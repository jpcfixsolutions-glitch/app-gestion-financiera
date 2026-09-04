import assert from "node:assert/strict"
import test from "node:test"

import { AppError } from "../errors/app-error"
import {
  calculateFinancing,
  getNextDueDate,
  parseCreateOperationInput,
  parsePlanInput,
} from "./finance-rules.service"

test("calcula el total y la cuota en el backend", () => {
  assert.deepEqual(calculateFinancing(100_000, { cuotas: 6, interes: 20 }), {
    totalDevolver: 120_000,
    cuotaValor: 20_000,
  })
})

test("calcula el vencimiento según la frecuencia", () => {
  const start = new Date("2026-09-04T12:00:00.000Z")

  assert.equal(getNextDueDate("Diario", start), "2026-09-05")
  assert.equal(getNextDueDate("Quincenal", start), "2026-09-19")
  assert.equal(getNextDueDate("Mensual", start), "2026-10-04")
})

test("normaliza una operación válida e ignora importes calculados por el cliente", () => {
  const parsed = parseCreateOperationInput({
    cliente: {
      nombre: "  Ana Pérez  ",
      dni: " 30.123.456 ",
      telefono: "",
      direccion: "",
    },
    operacion: {
      monto: 50_000,
      modalidad: "Efectivo",
      motivo: " Capital de trabajo ",
      planId: "p1",
      totalDevolver: 1,
      cuotaValor: 1,
    },
  })

  assert.equal(parsed.cliente.nombre, "Ana Pérez")
  assert.equal(parsed.operacion.motivo, "Capital de trabajo")
  assert.equal("totalDevolver" in parsed.operacion, false)
  assert.equal("cuotaValor" in parsed.operacion, false)
})

test("rechaza planes con reglas financieras inválidas", () => {
  assert.throws(
    () =>
      parsePlanInput({
        nombre: "Plan inválido",
        cuotas: 0,
        frecuencia: "Semanal",
        interes: -1,
      }),
    (error) => error instanceof AppError && error.code === "VALIDATION_ERROR",
  )
})
