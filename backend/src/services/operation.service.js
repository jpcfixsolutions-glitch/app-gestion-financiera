import crypto from "node:crypto"
import { and, eq, gte, lt, sql } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import {
  clientes,
  configuracion,
  operaciones,
  planes,
} from "../models/schema.js"
import {
  calculateFinancing,
  getNextDueDate,
  parseCreateOperationInput,
  toIsoDate,
} from "./finance-rules.service.js"
import { toDomainPlan } from "./state.service.js"
import { requireModalidad, requireRecord } from "./validation.service.js"
import { logActivity } from "./activity.service.js"
export async function createOperation(empresaId, value, actor) {
  const input = parseCreateOperationInput(value)
  const queries = [
    db
      .select()
      .from(configuracion)
      .where(eq(configuracion.empresaId, empresaId))
      .limit(1),
    db
      .select()
      .from(clientes)
      .where(
        and(
          eq(clientes.empresaId, empresaId),
          eq(clientes.dni, input.cliente.dni),
        ),
      )
      .limit(1),
  ]
  if (!input.operacion.planCustom) {
    queries.push(
      db
        .select()
        .from(planes)
        .where(
          and(
            eq(planes.empresaId, empresaId),
            eq(planes.id, input.operacion.planId),
          ),
        )
        .limit(1),
    )
  }
  const [configurationRows, existingClientRows, planRows = []] =
    await db.batch(queries)
  const configuration = configurationRows[0]
  if (!configuration) {
    throw new AppError(
      "La empresa no tiene una configuración financiera",
      409,
      "CONFIGURATION_NOT_FOUND",
    )
  }
  const existingClient = existingClientRows[0]
  if (
    existingClient &&
    ["nombre", "telefono", "direccion"].some(
      (field) => existingClient[field] !== input.cliente[field],
    )
  ) {
    throw new AppError(
      "El DNI ya pertenece a un cliente. Editá sus datos desde la cartera antes de registrar otra operación",
      409,
      "DNI_ALREADY_REGISTERED",
    )
  }
  const planCreado = Boolean(input.operacion.planCustom)
  let plan
  if (input.operacion.planCustom) {
    plan = {
      id: `p_${crypto.randomUUID()}`,
      ...input.operacion.planCustom,
    }
  } else {
    const selectedPlan = planRows[0]
    if (!selectedPlan) {
      throw new AppError(
        "El plan seleccionado no existe o no pertenece a la empresa",
        404,
        "PLAN_NOT_FOUND",
      )
    }
    plan = toDomainPlan(selectedPlan)
  }
  const available =
    input.operacion.modalidad === "Efectivo"
      ? configuration.cajaEfectivo
      : configuration.cajaTransferencia
  const minimumForChannel = configuration.limiteReserva / 2
  if (input.operacion.monto > available - minimumForChannel) {
    throw new AppError(
      `Fondos insuficientes en ${input.operacion.modalidad.toLowerCase()} para respetar la reserva mínima`,
      409,
      "INSUFFICIENT_FUNDS",
    )
  }
  const now = new Date()
  const clienteId = existingClient?.id ?? `c_${crypto.randomUUID()}`
  const operacionId = `op_${crypto.randomUUID()}`
  const financing = calculateFinancing(input.operacion.monto, plan)
  const fechaInicio = toIsoDate(now)
  const proximoVencimiento = getNextDueDate(plan.frecuencia, now)
  const { updatedConfiguration, activities } = await db.transaction(
    async (tx) => {
      const balanceRows =
        input.operacion.modalidad === "Efectivo"
          ? await tx
              .update(configuracion)
              .set({
                cajaEfectivo: sql`${configuracion.cajaEfectivo} - ${input.operacion.monto}`,
                activoEfectivo: sql`${configuracion.activoEfectivo} + ${input.operacion.monto}`,
              })
              .where(
                and(
                  eq(configuracion.empresaId, empresaId),
                  gte(
                    configuracion.cajaEfectivo,
                    sql`${configuracion.limiteReserva} / 2 + ${input.operacion.monto}`,
                  ),
                ),
              )
              .returning()
          : await tx
              .update(configuracion)
              .set({
                cajaTransferencia: sql`${configuracion.cajaTransferencia} - ${input.operacion.monto}`,
                activoTransferencia: sql`${configuracion.activoTransferencia} + ${input.operacion.monto}`,
              })
              .where(
                and(
                  eq(configuracion.empresaId, empresaId),
                  gte(
                    configuracion.cajaTransferencia,
                    sql`${configuracion.limiteReserva} / 2 + ${input.operacion.monto}`,
                  ),
                ),
              )
              .returning()
      const updatedConfiguration = balanceRows[0]
      if (!updatedConfiguration) {
        throw new AppError(
          "Los fondos cambiaron y ya no alcanzan para completar la operación",
          409,
          "INSUFFICIENT_FUNDS",
        )
      }
      if (planCreado) {
        await tx.insert(planes).values({
          id: plan.id,
          empresaId,
          nombre: plan.nombre,
          cuotas: plan.cuotas,
          frecuencia: plan.frecuencia,
          interes: plan.interes,
        })
      }
      if (!existingClient) {
        await tx.insert(clientes).values({
          id: clienteId,
          empresaId,
          ...input.cliente,
        })
      }
      await tx.insert(operaciones).values({
        id: operacionId,
        clienteId,
        planId: plan.id,
        monto: input.operacion.monto,
        modalidad: input.operacion.modalidad,
        motivo: input.operacion.motivo,
        totalDevolver: financing.totalDevolver,
        cuotaValor: financing.cuotaValor,
        fechaInicio,
        pagosRealizados: 0,
        estado: "al-dia",
        proximoVencimiento,
      })
      const activities = []
      if (planCreado) {
        activities.push(
          await logActivity(tx, empresaId, actor, {
            tipo: "plan_creado",
            titulo: "Plan de financiación creado",
            detalle: `${plan.nombre} · ${plan.cuotas} cuotas · ${plan.interes}%`,
          }),
        )
      }
      if (!existingClient) {
        activities.push(
          await logActivity(tx, empresaId, actor, {
            tipo: "cliente_creado",
            titulo: "Cliente registrado",
            detalle: `${input.cliente.nombre} · DNI ${input.cliente.dni}`,
          }),
        )
      }
      activities.push(
        await logActivity(tx, empresaId, actor, {
          tipo: "operacion_creada",
          titulo: "Operación de financiación creada",
          detalle: `${input.cliente.nombre} · ${input.operacion.modalidad}`,
          monto: input.operacion.monto,
        }),
      )
      return { updatedConfiguration, activities }
    },
  )
  return {
    cliente: {
      id: clienteId,
      ...(existingClient
        ? {
            nombre: existingClient.nombre,
            dni: existingClient.dni,
            telefono: existingClient.telefono,
            direccion: existingClient.direccion,
          }
        : input.cliente),
    },
    operacion: {
      id: operacionId,
      clienteId,
      monto: input.operacion.monto,
      modalidad: input.operacion.modalidad,
      motivo: input.operacion.motivo,
      plan,
      ...financing,
      fechaInicio,
      pagosRealizados: 0,
      estado: "al-dia",
      proximoVencimiento,
    },
    planCreado,
    actividades: activities,
    ...toCapitalResponse(updatedConfiguration),
  }
}
export async function registerPayment(empresaId, operacionId, value, actor) {
  if (!operacionId || operacionId.length > 100) {
    throw new AppError(
      "Identificador de operación inválido",
      422,
      "VALIDATION_ERROR",
    )
  }
  const body = requireRecord(value)
  const modalidad = requireModalidad(body.modalidad, "modalidad")
  const [operation] = await db
    .select({
      id: operaciones.id,
      cuotaValor: operaciones.cuotaValor,
      pagosRealizados: operaciones.pagosRealizados,
      cuotas: planes.cuotas,
      clienteNombre: clientes.nombre,
    })
    .from(operaciones)
    .innerJoin(clientes, eq(operaciones.clienteId, clientes.id))
    .innerJoin(planes, eq(operaciones.planId, planes.id))
    .where(
      and(
        eq(operaciones.id, operacionId),
        eq(clientes.empresaId, empresaId),
        eq(planes.empresaId, empresaId),
      ),
    )
    .limit(1)
  if (!operation) {
    throw new AppError("Operación no encontrada", 404, "OPERATION_NOT_FOUND")
  }
  if (operation.pagosRealizados >= operation.cuotas) {
    throw new AppError(
      "La operación ya tiene todas sus cuotas pagadas",
      409,
      "OPERATION_PAID",
    )
  }
  const result = await db.transaction(async (tx) => {
    const [updatedOperation] = await tx
      .update(operaciones)
      .set({
        pagosRealizados: sql`${operaciones.pagosRealizados} + 1`,
      })
      .where(
        and(
          eq(operaciones.id, operacionId),
          lt(operaciones.pagosRealizados, operation.cuotas),
        ),
      )
      .returning({ pagosRealizados: operaciones.pagosRealizados })
    if (!updatedOperation) {
      throw new AppError(
        "La cuota ya fue registrada por otra solicitud",
        409,
        "PAYMENT_ALREADY_REGISTERED",
      )
    }
    const balanceRows = await updateBalancesForPayment(
      tx,
      empresaId,
      modalidad,
      operation.cuotaValor,
    )
    const updatedConfiguration = balanceRows[0]
    if (!updatedConfiguration) {
      throw new AppError(
        "La empresa no tiene una configuración financiera",
        409,
        "CONFIGURATION_NOT_FOUND",
      )
    }
    const activity = await logActivity(tx, empresaId, actor, {
      tipo: "pago_registrado",
      titulo: "Pago de cuota registrado",
      detalle: `${operation.clienteNombre} · ${modalidad}`,
      monto: operation.cuotaValor,
    })
    return { updatedOperation, updatedConfiguration, activity }
  })
  return {
    operacionId,
    pagosRealizados: result.updatedOperation.pagosRealizados,
    actividades: [result.activity],
    ...toCapitalResponse(result.updatedConfiguration),
  }
}
function updateBalancesForPayment(tx, empresaId, modalidad, cuotaValor) {
  if (modalidad === "Efectivo") {
    return tx
      .update(configuracion)
      .set({
        cajaEfectivo: sql`${configuracion.cajaEfectivo} + ${cuotaValor}`,
        activoEfectivo: sql`max(0, ${configuracion.activoEfectivo} - ${cuotaValor})`,
      })
      .where(eq(configuracion.empresaId, empresaId))
      .returning()
  }
  return tx
    .update(configuracion)
    .set({
      cajaTransferencia: sql`${configuracion.cajaTransferencia} + ${cuotaValor}`,
      activoTransferencia: sql`max(0, ${configuracion.activoTransferencia} - ${cuotaValor})`,
    })
    .where(eq(configuracion.empresaId, empresaId))
    .returning()
}
function toCapitalResponse(configuration) {
  return {
    caja: {
      efectivo: configuration.cajaEfectivo,
      transferencia: configuration.cajaTransferencia,
    },
    activo: {
      efectivo: configuration.activoEfectivo,
      transferencia: configuration.activoTransferencia,
    },
  }
}
