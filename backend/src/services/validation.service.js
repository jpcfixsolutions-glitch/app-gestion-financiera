import { AppError } from "../errors/app-error.js"
const FRECUENCIAS = ["Diario", "Quincenal", "Mensual"]
const MODALIDADES = ["Efectivo", "Transferencia"]
export function requireRecord(value, field = "body") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(
      `${field} debe ser un objeto válido`,
      422,
      "VALIDATION_ERROR",
    )
  }
  return value
}
export function requireString(value, field, options = {}) {
  if (value === undefined || value === null) {
    if (options.optional) return ""
    throw new AppError(`${field} es requerido`, 422, "VALIDATION_ERROR")
  }
  if (typeof value !== "string") {
    throw new AppError(`${field} debe ser texto`, 422, "VALIDATION_ERROR")
  }
  const normalized = value.trim()
  const min = options.min ?? (options.optional ? 0 : 1)
  const max = options.max ?? 255
  if (normalized.length < min || normalized.length > max) {
    throw new AppError(
      `${field} debe tener entre ${min} y ${max} caracteres`,
      422,
      "VALIDATION_ERROR",
    )
  }
  return normalized
}
export function requireNumber(value, field, options = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AppError(
      `${field} debe ser un número válido`,
      422,
      "VALIDATION_ERROR",
    )
  }
  if (options.integer && !Number.isInteger(value)) {
    throw new AppError(
      `${field} debe ser un número entero`,
      422,
      "VALIDATION_ERROR",
    )
  }
  if (options.min !== undefined && value < options.min) {
    throw new AppError(
      `${field} debe ser mayor o igual a ${options.min}`,
      422,
      "VALIDATION_ERROR",
    )
  }
  if (options.max !== undefined && value > options.max) {
    throw new AppError(
      `${field} debe ser menor o igual a ${options.max}`,
      422,
      "VALIDATION_ERROR",
    )
  }
  return value
}
export function requireFrecuencia(value, field) {
  if (!FRECUENCIAS.includes(value)) {
    throw new AppError(
      `${field} no es una frecuencia válida`,
      422,
      "VALIDATION_ERROR",
    )
  }
  return value
}
export function requireModalidad(value, field) {
  if (!MODALIDADES.includes(value)) {
    throw new AppError(
      `${field} no es una modalidad válida`,
      422,
      "VALIDATION_ERROR",
    )
  }
  return value
}
