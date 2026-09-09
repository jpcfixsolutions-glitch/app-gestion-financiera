import assert from "node:assert/strict"
import test from "node:test"
import { AppError } from "../errors/app-error.js"
import {
  calculateFinancing,
  calculatePrincipalInstallment,
  getNextDueDate,
  parseCreateOperationInput,
  parsePlanInput,
  resolvePaymentBalanceFields,
} from "./finance-rules.service.js"
test("calcula el total y la cuota en el backend", () => {
  assert.deepEqual(calculateFinancing(100_000, { cuotas: 6, interes: 20 }), {
    totalDevolver: 120_000,
    cuotaValor: 20_000,
  })
})
test("separa el capital amortizado del interés de la cuota", () => {
  assert.equal(calculatePrincipalInstallment(100_000, 6, 1), 16_666.67)
  assert.equal(calculatePrincipalInstallment(100_000, 6, 6), 16_666.65)
})
test("rechaza un número de pago fuera del plan", () => {
  assert.throws(
    () => calculatePrincipalInstallment(100_000, 6, 7),
    (error) => error instanceof AppError && error.code === "INVALID_PAYMENT",
  )
})
test("cobra en caja y amortiza en la modalidad original del préstamo", () => {
  assert.deepEqual(
    resolvePaymentBalanceFields("Efectivo", "Transferencia"),
    {
      cashField: "cajaEfectivo",
      outstandingField: "activoTransferencia",
    },
  )
  assert.deepEqual(
    resolvePaymentBalanceFields("Transferencia", "Efectivo"),
    {
      cashField: "cajaTransferencia",
      outstandingField: "activoEfectivo",
    },
  )
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
      telefono: "+54 11 4444-5555",
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
  assert.equal(parsed.cliente.dni, "30123456")
  assert.equal(parsed.operacion.motivo, "Capital de trabajo")
  assert.equal("totalDevolver" in parsed.operacion, false)
  assert.equal("cuotaValor" in parsed.operacion, false)
})
test("valida nombre, DNI y teléfono del cliente", () => {
  const validOperation = {
    cliente: {
      nombre: "Ana Pérez",
      dni: "30.123.456",
      telefono: "+54 11 4444-5555",
      direccion: "",
    },
    operacion: {
      monto: 10_000,
      modalidad: "Efectivo",
      motivo: "",
      planId: "p1",
    },
  }
  for (const cliente of [
    { ...validOperation.cliente, nombre: "Ana 123" },
    { ...validOperation.cliente, dni: "1234" },
    { ...validOperation.cliente, telefono: "sin teléfono" },
  ]) {
    assert.throws(
      () => parseCreateOperationInput({ ...validOperation, cliente }),
      (error) => error instanceof AppError && error.code === "VALIDATION_ERROR",
    )
  }
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
