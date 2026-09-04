import { eq } from "drizzle-orm"

import { db } from "../models/database"
import { clientes, configuracion, operaciones, planes } from "../models/schema"
import type {
  AppState,
  Cliente,
  Frecuencia,
  Modalidad,
  Operacion,
  Plan,
} from "../types"

export async function getAppState(empresaId: string): Promise<AppState> {
  const [configurationRows, planRows, clientRows, operationRows] =
    await db.batch([
      db
        .select()
        .from(configuracion)
        .where(eq(configuracion.empresaId, empresaId))
        .limit(1),
      db.select().from(planes).where(eq(planes.empresaId, empresaId)),
      db.select().from(clientes).where(eq(clientes.empresaId, empresaId)),
      db
        .select({
          id: operaciones.id,
          clienteId: operaciones.clienteId,
          planId: operaciones.planId,
          monto: operaciones.monto,
          modalidad: operaciones.modalidad,
          motivo: operaciones.motivo,
          totalDevolver: operaciones.totalDevolver,
          cuotaValor: operaciones.cuotaValor,
          fechaInicio: operaciones.fechaInicio,
          pagosRealizados: operaciones.pagosRealizados,
          estado: operaciones.estado,
          proximoVencimiento: operaciones.proximoVencimiento,
        })
        .from(operaciones)
        .innerJoin(clientes, eq(operaciones.clienteId, clientes.id))
        .where(eq(clientes.empresaId, empresaId)),
    ])

  const planMap = new Map<string, Plan>()
  for (const plan of planRows) {
    planMap.set(plan.id, toDomainPlan(plan))
  }

  const clientMap = new Map<string, Cliente>()
  for (const client of clientRows) {
    clientMap.set(client.id, {
      id: client.id,
      nombre: client.nombre,
      dni: client.dni,
      telefono: client.telefono,
      direccion: client.direccion,
      operaciones: [],
    })
  }

  for (const operation of operationRows) {
    const client = clientMap.get(operation.clienteId)
    const plan = planMap.get(operation.planId)
    if (!client || !plan) continue

    client.operaciones.push({
      id: operation.id,
      clienteId: operation.clienteId,
      monto: operation.monto,
      modalidad: operation.modalidad as Modalidad,
      motivo: operation.motivo,
      plan,
      totalDevolver: operation.totalDevolver,
      cuotaValor: operation.cuotaValor,
      fechaInicio: operation.fechaInicio,
      pagosRealizados: operation.pagosRealizados,
      estado: operation.estado as Operacion["estado"],
      proximoVencimiento: operation.proximoVencimiento,
    })
  }

  const configuration = configurationRows[0]

  return {
    caja: {
      efectivo: configuration?.cajaEfectivo ?? 0,
      transferencia: configuration?.cajaTransferencia ?? 0,
    },
    activo: {
      efectivo: configuration?.activoEfectivo ?? 0,
      transferencia: configuration?.activoTransferencia ?? 0,
    },
    limiteReserva: configuration?.limiteReserva ?? 0,
    planes: [...planMap.values()],
    clientes: [...clientMap.values()],
  }
}

export function toDomainPlan(plan: {
  id: string
  nombre: string
  cuotas: number
  frecuencia: string
  interes: number
}): Plan {
  return {
    id: plan.id,
    nombre: plan.nombre,
    cuotas: plan.cuotas,
    frecuencia: plan.frecuencia as Frecuencia,
    interes: plan.interes,
  }
}
