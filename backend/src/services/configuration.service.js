import crypto from "node:crypto"
import { and, eq, gte, sql } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { configuracion, movimientosCaja } from "../models/schema.js"
import {
  requireModalidad,
  requireNumber,
  requireRecord,
  requireString,
} from "./validation.service.js"
import { logActivity } from "./activity.service.js"
export async function updateReserveLimit(empresaId, value, actor) {
  const body = requireRecord(value)
  const limiteReserva = requireNumber(body.limiteReserva, "limiteReserva", {
    min: 0,
    max: 1_000_000_000_000,
  })
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(configuracion)
      .set({ limiteReserva })
      .where(eq(configuracion.empresaId, empresaId))
      .returning({ limiteReserva: configuracion.limiteReserva })
    if (!updated) {
      throw new AppError(
        "La empresa no tiene una configuración financiera",
        404,
        "CONFIGURATION_NOT_FOUND",
      )
    }
    const activity = await logActivity(tx, empresaId, actor, {
      tipo: "configuracion_actualizada",
      titulo: "Reserva mínima actualizada",
      detalle: `Nuevo límite: ${formatAmount(limiteReserva)}`,
      monto: limiteReserva,
    })
    return { ...updated, actividades: [activity] }
  })
}

export async function registerCashMovement(empresaId, value, actor) {
  const body = requireRecord(value)
  const tipo = requireMovementType(body.tipo)
  const modalidad = requireModalidad(body.modalidad, "modalidad")
  const monto = requireNumber(body.monto, "monto", {
    min: 0.01,
    max: 1_000_000_000_000,
  })
  const razon = requireString(body.razon, "razon", {
    optional: true,
    max: 300,
  })

  return db.transaction(async (tx) => {
    const balanceRows = await updateCashBalance(
      tx,
      empresaId,
      tipo,
      modalidad,
      monto,
    )
    const updated = balanceRows[0]
    if (!updated) {
      throw new AppError(
        tipo === "extraccion"
          ? `Saldo insuficiente en ${modalidad.toLowerCase()}`
          : "La empresa no tiene una configuración financiera",
        tipo === "extraccion" ? 409 : 404,
        tipo === "extraccion"
          ? "INSUFFICIENT_FUNDS"
          : "CONFIGURATION_NOT_FOUND",
      )
    }

    const movimiento = {
      id: `mov_${crypto.randomUUID()}`,
      empresaId,
      tipo,
      modalidad,
      monto,
      razon,
      createdAt: new Date().toISOString(),
    }
    await tx.insert(movimientosCaja).values(movimiento)
    const activity = await logActivity(tx, empresaId, actor, {
      tipo: `caja_${tipo}`,
      titulo: tipo === "ingreso" ? "Ingreso de dinero" : "Extracción de dinero",
      detalle: [modalidad, razon].filter(Boolean).join(" · "),
      monto,
    })

    return {
      movimiento: {
        id: movimiento.id,
        tipo,
        modalidad,
        monto,
        razon,
        createdAt: movimiento.createdAt,
      },
      caja: {
        efectivo: updated.cajaEfectivo,
        transferencia: updated.cajaTransferencia,
      },
      actividades: [activity],
    }
  })
}

function formatAmount(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)
}

function requireMovementType(value) {
  if (value !== "ingreso" && value !== "extraccion") {
    throw new AppError(
      "tipo debe ser ingreso o extraccion",
      422,
      "VALIDATION_ERROR",
    )
  }
  return value
}

function updateCashBalance(tx, empresaId, tipo, modalidad, monto) {
  const isCash = modalidad === "Efectivo"
  const field = isCash
    ? configuracion.cajaEfectivo
    : configuracion.cajaTransferencia
  const value =
    tipo === "ingreso" ? sql`${field} + ${monto}` : sql`${field} - ${monto}`
  const changes = isCash
    ? { cajaEfectivo: value }
    : { cajaTransferencia: value }

  return tx
    .update(configuracion)
    .set(changes)
    .where(
      and(
        eq(configuracion.empresaId, empresaId),
        ...(tipo === "extraccion" ? [gte(field, monto)] : []),
      ),
    )
    .returning()
}
