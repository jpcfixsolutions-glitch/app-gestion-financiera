import crypto from "node:crypto"
import { and, desc, eq, lt } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { actividad } from "../models/schema.js"

export const ACTIVITY_PAGE_SIZE = 20

export async function logActivity(executor, empresaId, actor, event) {
  const row = {
    id: `act_${crypto.randomUUID()}`,
    empresaId,
    usuarioId: actor?.sub || actor?.id || "sistema",
    usuarioNombre: actor?.name || actor?.username || "Sistema",
    tipo: event.tipo,
    titulo: event.titulo,
    detalle: event.detalle || "",
    monto: event.monto ?? null,
    createdAt: new Date().toISOString(),
  }
  await executor.insert(actividad).values(row)
  return toDomainActivity(row)
}

export function activityPageQuery(
  empresaId,
  before,
  limit = ACTIVITY_PAGE_SIZE,
) {
  return db
    .select()
    .from(actividad)
    .where(
      and(
        eq(actividad.empresaId, empresaId),
        before ? lt(actividad.createdAt, before) : undefined,
      ),
    )
    .orderBy(desc(actividad.createdAt), desc(actividad.id))
    .limit(limit + 1)
}

export async function getActivityPage(empresaId, value = {}) {
  const before = parseBefore(value.before)
  const rows = await activityPageQuery(empresaId, before)
  return toActivityPage(rows)
}

export function toActivityPage(rows, limit = ACTIVITY_PAGE_SIZE) {
  return {
    items: rows.slice(0, limit).map(toDomainActivity),
    hasMore: rows.length > limit,
  }
}

function parseBefore(value) {
  if (value === undefined) return undefined
  if (
    typeof value !== "string" ||
    value.length > 40 ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new AppError(
      "El cursor del historial no es válido",
      422,
      "VALIDATION_ERROR",
    )
  }
  return value
}

function toDomainActivity(row) {
  return {
    id: row.id,
    usuarioNombre: row.usuarioNombre,
    tipo: row.tipo,
    titulo: row.titulo,
    detalle: row.detalle,
    monto: row.monto,
    createdAt: row.createdAt,
  }
}
