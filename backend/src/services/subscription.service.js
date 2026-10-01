import { eq } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { configuracion } from "../models/schema.js"

const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || "America/Argentina/Buenos_Aires"

/**
 * Calculates the next expiration date based on the subscription day, current date, and timezone.
 * Returns the expiration date in UTC as an ISO string.
 */
export function calculateNextExpiry(subscriptionDay, now, timezone) {
  const options = { timeZone: timezone, year: "numeric", month: "numeric", day: "numeric" }
  const formatter = new Intl.DateTimeFormat("en-US", options)
  
  // Format returns MM/DD/YYYY
  const parts = formatter.formatToParts(now)
  const currentYear = parseInt(parts.find((p) => p.type === "year").value, 10)
  const currentMonth = parseInt(parts.find((p) => p.type === "month").value, 10)
  const currentDay = parseInt(parts.find((p) => p.type === "day").value, 10)

  // Calculate days in current month
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate()
  const adjustedDayCurrent = Math.min(subscriptionDay, daysInCurrentMonth)

  let targetYear = currentYear
  let targetMonth = currentMonth
  let targetDay = adjustedDayCurrent

  if (currentDay >= adjustedDayCurrent) {
    // Expiration goes to next month
    targetMonth = currentMonth + 1
    if (targetMonth > 12) {
      targetMonth = 1
      targetYear++
    }
    const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate()
    targetDay = Math.min(subscriptionDay, daysInTargetMonth)
  }

  // Create the exact time string for 23:59:59.999 in the target timezone
  // We can construct this using the IANA timezone. A simple way in JS without huge libraries is:
  // Convert local target datetime to UTC string.
  
  const formattedMonth = String(targetMonth).padStart(2, "0")
  const formattedDay = String(targetDay).padStart(2, "0")
  
  // ISO string without Z is treated as local time
  const isoLocal = `${targetYear}-${formattedMonth}-${formattedDay}T23:59:59.999`
  
  // Parse in the given timezone (JS doesn't natively do this easily, but we can use a small trick)
  // Actually, since we only need UTC string, we can use standard Date logic if we adjust for timezone offset
  // A cleaner approach for timezone handling in vanilla JS is to create a date in UTC, then find the offset
  
  // Since we want 23:59:59.999 in America/Argentina/Buenos_Aires (usually UTC-3)
  // It's safer to use a function to calculate the UTC time.
  const dateStr = `${targetYear}-${formattedMonth}-${formattedDay}T23:59:59.999`
  
  // To avoid dealing with complex Date parsing for specific timezones in vanilla Node,
  // we can use Intl.DateTimeFormat with a known UTC time and find the difference, or just assume UTC-3 for Buenos Aires.
  // But let's do it robustly:
  
  // We create a date string for the target time, assuming it's in the local timezone (Node's local)
  // This is wrong because Node's local could be UTC.
  
  // Let's implement a solid calculation for Business Timezone:
  // For America/Argentina/Buenos_Aires, it's always UTC-03:00.
  // But to be generic:
  return getUtcStringFromLocal(targetYear, targetMonth, targetDay, 23, 59, 59, 999, timezone)
}

function getUtcStringFromLocal(year, month, day, hour, minute, second, ms, timezone) {
  // Approximate way using standard JS:
  // Start with UTC date matching the local values
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms))
  
  // Find the offset for this specific date in the target timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric",
    hour12: false
  })
  
  const parts = formatter.formatToParts(utcDate)
  
  const tzYear = parseInt(parts.find(p => p.type === "year").value, 10)
  const tzMonth = parseInt(parts.find(p => p.type === "month").value, 10)
  const tzDay = parseInt(parts.find(p => p.type === "day").value, 10)
  const tzHour = parseInt(parts.find(p => p.type === "hour").value, 10)
  
  // Calculate difference
  const localApparent = new Date(Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, minute, second, ms))
  const offsetMs = localApparent.getTime() - utcDate.getTime()
  
  // Adjust the original UTC date to correct for the offset
  // Wait, if we want target local time to map to UTC, we subtract the offset from the apparent UTC time
  const targetUtc = new Date(utcDate.getTime() - offsetMs)
  return targetUtc.toISOString()
}

export function getSubscriptionDerivedState(subscriptionDay, nextExpiryStr) {
  if (!subscriptionDay || !nextExpiryStr) {
    return {
      isConfigured: false,
      subscriptionDay: null,
      nextExpiry: null,
      isExpired: false,
      isWarning: false,
      daysRemaining: null
    }
  }

  const now = new Date()
  const nextExpiry = new Date(nextExpiryStr)
  const isExpired = now > nextExpiry
  
  const msRemaining = nextExpiry.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
  
  const isWarning = !isExpired && daysRemaining <= 5

  return {
    isConfigured: true,
    subscriptionDay,
    nextExpiry: nextExpiryStr,
    isExpired,
    isWarning,
    daysRemaining
  }
}

export async function getSubscriptionStatus(empresaId) {
  const [config] = await db
    .select({
      subscriptionDay: configuracion.subscriptionDay,
      nextExpiry: configuracion.nextExpiry
    })
    .from(configuracion)
    .where(eq(configuracion.empresaId, empresaId))
    .limit(1)

  if (!config) {
    // If no config row at all for this company, it's unconfigured
    return getSubscriptionDerivedState(null, null)
  }

  return getSubscriptionDerivedState(config.subscriptionDay, config.nextExpiry)
}

export async function configureSubscription(empresaId, day) {
  if (day < 1 || day > 31) {
    throw new AppError("El día de suscripción debe estar entre 1 y 31", 400)
  }

  const now = new Date()
  const nextExpiry = calculateNextExpiry(day, now, BUSINESS_TIMEZONE)

  // Upsert config or just update since config is always created in seed for emp1.
  // In a real app we might need to upsert, but here configuracion exists per tenant.
  const result = await db.update(configuracion)
    .set({
      subscriptionDay: day,
      nextExpiry
    })
    .where(eq(configuracion.empresaId, empresaId))
    .returning({
      subscriptionDay: configuracion.subscriptionDay,
      nextExpiry: configuracion.nextExpiry
    })

  if (result.length === 0) {
    // If no config row existed, we create it (assuming some defaults for other fields if nullable, 
    // but they are not null with defaults in schema, so this works)
    const [inserted] = await db.insert(configuracion).values({
      id: crypto.randomUUID(),
      empresaId,
      subscriptionDay: day,
      nextExpiry,
      // all other fields have defaults in schema except they might throw if not present in some sqlite configurations
      // but drizzle schema has `.default(0)` for them.
    }).returning({
      subscriptionDay: configuracion.subscriptionDay,
      nextExpiry: configuracion.nextExpiry
    })
    return getSubscriptionDerivedState(inserted.subscriptionDay, inserted.nextExpiry)
  }

  return getSubscriptionDerivedState(result[0].subscriptionDay, result[0].nextExpiry)
}

export async function renewSubscription(empresaId) {
  const status = await getSubscriptionStatus(empresaId)
  
  if (!status.isConfigured) {
    throw new AppError("La suscripción no está configurada", 400)
  }
  
  if (!status.isExpired) {
    throw new AppError("La suscripción no está vencida", 400)
  }

  const now = new Date()
  const nextExpiry = calculateNextExpiry(status.subscriptionDay, now, BUSINESS_TIMEZONE)

  await db.update(configuracion)
    .set({ nextExpiry })
    .where(eq(configuracion.empresaId, empresaId))

  return getSubscriptionDerivedState(status.subscriptionDay, nextExpiry)
}
