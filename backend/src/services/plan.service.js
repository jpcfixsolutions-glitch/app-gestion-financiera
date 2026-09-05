import crypto from "node:crypto"
import { and, count, eq } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { clientes, operaciones, planes } from "../models/schema.js"
import { parsePlanInput } from "./finance-rules.service.js"
import { toDomainPlan } from "./state.service.js"
import { logActivity } from "./activity.service.js"
export async function createPlan(empresaId, value, actor) {
  const input = parsePlanInput(value)
  const id = `p_${crypto.randomUUID()}`
  return db.transaction(async (tx) => {
    const [totals] = await tx
      .select({ value: count() })
      .from(planes)
      .where(eq(planes.empresaId, empresaId))
    if (totals.value >= 6) {
      throw new AppError(
        "Solo se pueden registrar hasta 6 métodos de financiación",
        409,
        "PLAN_LIMIT_REACHED",
      )
    }
    const [created] = await tx
      .insert(planes)
      .values({ id, empresaId, ...input })
      .returning()
    const activity = await logActivity(tx, empresaId, actor, {
      tipo: "plan_creado",
      titulo: "Plan de financiación creado",
      detalle: `${input.nombre} · ${input.cuotas} cuotas · ${input.interes}%`,
    })
    return { plan: toDomainPlan(created), actividades: [activity] }
  })
}
export async function updatePlan(empresaId, id, value, actor) {
  validatePlanId(id)
  const input = parsePlanInput(value)
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
      "No se puede editar un plan utilizado por operaciones; creá una nueva variante",
      409,
      "PLAN_IN_USE",
    )
  }
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(planes)
      .set(input)
      .where(and(eq(planes.id, id), eq(planes.empresaId, empresaId)))
      .returning()
    const activity = await logActivity(tx, empresaId, actor, {
      tipo: "plan_actualizado",
      titulo: "Plan de financiación actualizado",
      detalle: `${input.nombre} · ${input.cuotas} cuotas · ${input.interes}%`,
    })
    return { plan: toDomainPlan(updated), actividades: [activity] }
  })
}
export async function deletePlan(empresaId, id, actor) {
  validatePlanId(id)
  const [planRows, usageRows] = await db.batch([
    db
      .select({ id: planes.id, nombre: planes.nombre })
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
  return db.transaction(async (tx) => {
    await tx
      .delete(planes)
      .where(and(eq(planes.id, id), eq(planes.empresaId, empresaId)))
    const activity = await logActivity(tx, empresaId, actor, {
      tipo: "plan_eliminado",
      titulo: "Plan de financiación eliminado",
      detalle: planRows[0].nombre,
    })
    return { id, actividades: [activity] }
  })
}

function validatePlanId(id) {
  if (!id || id.length > 100) {
    throw new AppError(
      "Identificador de plan inválido",
      422,
      "VALIDATION_ERROR",
    )
  }
}
