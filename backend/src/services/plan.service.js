import crypto from "node:crypto"
import { and, eq } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { clientes, operaciones, planes } from "../models/schema.js"
import { parsePlanInput } from "./finance-rules.service.js"
import { toDomainPlan } from "./state.service.js"
export async function createPlan(empresaId, value) {
  const input = parsePlanInput(value)
  const id = `p_${crypto.randomUUID()}`
  const [created] = await db
    .insert(planes)
    .values({ id, empresaId, ...input })
    .returning()
  return toDomainPlan(created)
}
export async function deletePlan(empresaId, id) {
  if (!id || id.length > 100) {
    throw new AppError(
      "Identificador de plan inválido",
      422,
      "VALIDATION_ERROR",
    )
  }
  const [planRows, usageRows] = await db.batch([
    db
      .select({ id: planes.id })
      .from(planes)
      .where(and(eq(planes.id, id), eq(planes.empresaId, empresaId)))
      .limit(1),
    db
      .select({ id: operaciones.id })
      .from(operaciones)
      .innerJoin(clientes, eq(operaciones.clienteId, clientes.id))
      .where(and(eq(operaciones.planId, id), eq(clientes.empresaId, empresaId)))
      .limit(1),
  ])
  if (!planRows[0]) {
    throw new AppError("Plan no encontrado", 404, "PLAN_NOT_FOUND")
  }
  if (usageRows[0]) {
    throw new AppError(
      "No se puede eliminar un plan utilizado por operaciones",
      409,
      "PLAN_IN_USE",
    )
  }
  await db
    .delete(planes)
    .where(and(eq(planes.id, id), eq(planes.empresaId, empresaId)))
  return { id }
}
