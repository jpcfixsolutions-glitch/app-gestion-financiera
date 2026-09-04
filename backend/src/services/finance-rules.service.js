import { AppError } from "../errors/app-error.js"
import {
  requireFrecuencia,
  requireModalidad,
  requireNumber,
  requireRecord,
  requireString,
} from "./validation.service.js"
export function parsePlanInput(value, field = "plan") {
  const plan = requireRecord(value, field)
  return {
    nombre: requireString(plan.nombre, `${field}.nombre`, { min: 2, max: 80 }),
    cuotas: requireNumber(plan.cuotas, `${field}.cuotas`, {
      min: 1,
      max: 3650,
      integer: true,
    }),
    frecuencia: requireFrecuencia(plan.frecuencia, `${field}.frecuencia`),
    interes: requireNumber(plan.interes, `${field}.interes`, {
      min: 0,
      max: 1000,
    }),
  }
}
export function parseCreateOperationInput(value) {
  const body = requireRecord(value)
  const cliente = requireRecord(body.cliente, "cliente")
  const operacion = requireRecord(body.operacion, "operacion")
  const planCustom = operacion.planCustom
    ? parsePlanInput(operacion.planCustom, "operacion.planCustom")
    : undefined
  const planId = planCustom
    ? ""
    : requireString(operacion.planId, "operacion.planId", { max: 100 })
  return {
    cliente: {
      nombre: requireString(cliente.nombre, "cliente.nombre", {
        min: 2,
        max: 120,
      }),
      dni: requireString(cliente.dni, "cliente.dni", { min: 5, max: 32 }),
      telefono: requireString(cliente.telefono, "cliente.telefono", {
        optional: true,
        max: 40,
      }),
      direccion: requireString(cliente.direccion, "cliente.direccion", {
        optional: true,
        max: 200,
      }),
    },
    operacion: {
      monto: requireNumber(operacion.monto, "operacion.monto", {
        min: 0.01,
        max: 1_000_000_000_000,
      }),
      modalidad: requireModalidad(operacion.modalidad, "operacion.modalidad"),
      motivo: requireString(operacion.motivo, "operacion.motivo", {
        optional: true,
        max: 500,
      }),
      planId,
      planCustom,
    },
  }
}
export function calculateFinancing(monto, plan) {
  if (plan.cuotas <= 0) {
    throw new AppError(
      "El plan debe tener al menos una cuota",
      422,
      "INVALID_PLAN",
    )
  }
  const totalDevolver = roundMoney(monto * (1 + plan.interes / 100))
  const cuotaValor = roundMoney(totalDevolver / plan.cuotas)
  return { totalDevolver, cuotaValor }
}
export function getNextDueDate(frecuencia, startDate = new Date()) {
  const daysByFrequency = {
    Diario: 1,
    Quincenal: 15,
    Mensual: 30,
  }
  const nextDate = new Date(startDate)
  nextDate.setUTCDate(nextDate.getUTCDate() + daysByFrequency[frecuencia])
  return toIsoDate(nextDate)
}
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10)
}
function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
