import { AppError } from "../errors/app-error"
import type { Frecuencia, Modalidad } from "../types"

const FRECUENCIAS: readonly Frecuencia[] = ["Diario", "Quincenal", "Mensual"]
const MODALIDADES: readonly Modalidad[] = ["Efectivo", "Transferencia"]

interface StringValidationOptions {
  min?: number
  max?: number
  optional?: boolean
}

interface NumberValidationOptions {
  min?: number
  max?: number
  integer?: boolean
}

export function requireRecord(
  value: unknown,
  field = "body",
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(
      `${field} debe ser un objeto válido`,
      422,
      "VALIDATION_ERROR",
    )
  }

  return value as Record<string, unknown>
}

export function requireString(
  value: unknown,
  field: string,
  options: StringValidationOptions = {},
): string {
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

export function requireNumber(
  value: unknown,
  field: string,
  options: NumberValidationOptions = {},
): number {
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

export function requireFrecuencia(value: unknown, field: string): Frecuencia {
  if (!FRECUENCIAS.includes(value as Frecuencia)) {
    throw new AppError(
      `${field} no es una frecuencia válida`,
      422,
      "VALIDATION_ERROR",
    )
  }

  return value as Frecuencia
}

export function requireModalidad(value: unknown, field: string): Modalidad {
  if (!MODALIDADES.includes(value as Modalidad)) {
    throw new AppError(
      `${field} no es una modalidad válida`,
      422,
      "VALIDATION_ERROR",
    )
  }

  return value as Modalidad
}
