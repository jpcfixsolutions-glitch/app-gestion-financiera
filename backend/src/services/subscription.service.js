import crypto from "node:crypto"
import { eq } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { configuracion } from "../models/schema.js"
import { logActivity } from "./activity.service.js"

export const BUSINESS_TIMEZONE =
  process.env.BUSINESS_TIMEZONE || "America/Argentina/Buenos_Aires"

const DAY_MS = 24 * 60 * 60 * 1000

function getDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date)
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  )
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function offsetAt(date, timeZone) {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value
  const match = name?.match(/^GMT([+-])(\d{2}):(\d{2})$/)
  if (!match) throw new AppError("La zona horaria de negocio no es válida", 500)
  const sign = match[1] === "+" ? 1 : -1
  return sign * (Number(match[2]) * 60 + Number(match[3])) * 60 * 1000
}

function localEndOfDayToUtc(year, month, day, timezone) {
  const localAsUtc = Date.UTC(year, month - 1, day, 23, 59, 59, 999)
  let candidate = new Date(localAsUtc - offsetAt(new Date(localAsUtc), timezone))
  // A second pass covers offset changes around DST transitions.
  candidate = new Date(localAsUtc - offsetAt(candidate, timezone))
  return candidate.toISOString()
}

/** Calculates the next cutoff in the business timezone and returns a UTC ISO instant. */
export function calculateNextExpiry(subscriptionDay, now, timezone) {
  if (!Number.isInteger(subscriptionDay) || subscriptionDay < 1 || subscriptionDay > 31) {
    throw new AppError("El día de suscripción debe estar entre 1 y 31", 400)
  }
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new AppError("La fecha actual no es válida", 500)
  }
  const { year, month, day } = getDateParts(now, timezone)
  const currentCutoff = Math.min(subscriptionDay, daysInMonth(year, month))
  let targetYear = year
  let targetMonth = month
  if (day >= currentCutoff) {
    targetMonth += 1
    if (targetMonth === 13) {
      targetMonth = 1
      targetYear += 1
    }
  }
  const targetDay = Math.min(subscriptionDay, daysInMonth(targetYear, targetMonth))
  return localEndOfDayToUtc(targetYear, targetMonth, targetDay, timezone)
}

export function getSubscriptionDerivedState(subscriptionDay, nextExpiryStr, now = new Date()) {
  const nextExpiry = nextExpiryStr ? new Date(nextExpiryStr) : null
  if (
    !Number.isInteger(subscriptionDay) || subscriptionDay < 1 || subscriptionDay > 31 ||
    !nextExpiry || Number.isNaN(nextExpiry.getTime())
  ) {
    return { isConfigured: false, subscriptionDay: null, nextExpiry: null, isExpired: false, isWarning: false, daysRemaining: null }
  }
  const isExpired = now.getTime() > nextExpiry.getTime()
  const daysRemaining = Math.max(0, Math.ceil((nextExpiry.getTime() - now.getTime()) / DAY_MS))
  return {
    isConfigured: true,
    subscriptionDay,
    nextExpiry: nextExpiry.toISOString(),
    isExpired,
    isWarning: !isExpired && daysRemaining <= 5,
    daysRemaining,
  }
}

async function getConfiguration(executor, empresaId) {
  const [row] = await executor.select({ id: configuracion.id, subscriptionDay: configuracion.subscriptionDay, nextExpiry: configuracion.nextExpiry }).from(configuracion).where(eq(configuracion.empresaId, empresaId)).limit(1)
  return row
}

export async function getSubscriptionStatus(empresaId, now = new Date()) {
  const config = await getConfiguration(db, empresaId)
  return getSubscriptionDerivedState(config?.subscriptionDay, config?.nextExpiry, now)
}

export async function configureSubscription(empresaId, day, actor) {
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new AppError("El día de suscripción debe estar entre 1 y 31", 400, "VALIDATION_ERROR")
  }
  const nextExpiry = calculateNextExpiry(day, new Date(), BUSINESS_TIMEZONE)
  return db.transaction(async (tx) => {
    const existing = await getConfiguration(tx, empresaId)
    if (existing) {
      await tx.update(configuracion).set({ subscriptionDay: day, nextExpiry }).where(eq(configuracion.id, existing.id))
    } else {
      await tx.insert(configuracion).values({ id: `cfg_${crypto.randomUUID()}`, empresaId, subscriptionDay: day, nextExpiry })
    }
    await logActivity(tx, empresaId, actor, {
      tipo: "subscription_configurada",
      titulo: "Suscripción configurada",
      detalle: `Día de corte: ${day}. Vencimiento anterior: ${existing?.nextExpiry || "sin configurar"}`,
    })
    return getSubscriptionDerivedState(day, nextExpiry)
  })
}

export async function renewSubscription(empresaId, actor) {
  return db.transaction(async (tx) => {
    const existing = await getConfiguration(tx, empresaId)
    const status = getSubscriptionDerivedState(existing?.subscriptionDay, existing?.nextExpiry)
    if (!status.isConfigured) throw new AppError("La suscripción no está configurada", 400, "SUBSCRIPTION_UNCONFIGURED")
    if (!status.isExpired) throw new AppError("La suscripción no está vencida", 400, "SUBSCRIPTION_NOT_EXPIRED")
    const nextExpiry = calculateNextExpiry(status.subscriptionDay, new Date(), BUSINESS_TIMEZONE)
    await tx.update(configuracion).set({ nextExpiry }).where(eq(configuracion.id, existing.id))
    await logActivity(tx, empresaId, actor, {
      tipo: "subscription_reactivada",
      titulo: "Suscripción reactivada",
      detalle: `Vencimiento anterior: ${existing.nextExpiry}. Nuevo vencimiento: ${nextExpiry}`,
    })
    return getSubscriptionDerivedState(status.subscriptionDay, nextExpiry)
  })
}
