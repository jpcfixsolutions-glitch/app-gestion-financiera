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
      nombre: requireClientName(cliente.nombre),
      dni: requireDni(cliente.dni),
      telefono: requirePhone(cliente.telefono),
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
function requireClientName(value) {
  const nombre = requireString(value, "cliente.nombre", { min: 2, max: 120 })
  if (!/^[\p{L}\p{M}]+(?:[ '\-’][\p{L}\p{M}]+)*$/u.test(nombre)) {
    throw new AppError(
      "El nombre solo puede contener letras, espacios, apóstrofes y guiones",
      422,
      "VALIDATION_ERROR",
    )
  }
  return nombre
}
function requireDni(value) {
  const rawDni = requireString(value, "cliente.dni", { min: 7, max: 12 })
  if (!/^[\d.\s-]+$/.test(rawDni)) {
    throw new AppError(
      "El DNI solo puede contener números y separadores",
      422,
      "VALIDATION_ERROR",
    )
  }
  const dni = rawDni.replace(/\D/g, "")
  if (!/^\d{7,8}$/.test(dni)) {
    throw new AppError(
      "El DNI debe tener 7 u 8 dígitos",
      422,
      "VALIDATION_ERROR",
    )
  }
  return dni
}
function requirePhone(value) {
  const telefono = requireString(value, "cliente.telefono", {
    min: 8,
    max: 40,
  })
  if (!/^\+?[\d\s()-]+$/.test(telefono)) {
    throw new AppError(
      "El teléfono contiene caracteres no válidos",
      422,
      "VALIDATION_ERROR",
    )
  }
  const digits = telefono.replace(/\D/g, "")
  if (digits.length < 8 || digits.length > 15) {
    throw new AppError(
      "El teléfono debe tener entre 8 y 15 dígitos",
      422,
      "VALIDATION_ERROR",
    )
  }
  return telefono
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
