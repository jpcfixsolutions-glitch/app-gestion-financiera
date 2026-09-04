import type {
  AppState,
  CapitalSplit,
  Cliente,
  Frecuencia,
  Modalidad,
  Operacion,
  Plan,
} from "@/domain/finance/types"
import { apiRequest } from "@/lib/apiClient"

// ─── Queries ─────────────────────────────────────────────────────────────────

export function fetchAppState(): Promise<AppState> {
  return apiRequest<AppState>("/state")
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface NuevaOperacionPayload {
  cliente: {
    nombre: string

    dni: string

    telefono: string

    direccion: string
  }

  operacion: {
    monto: number

    modalidad: Modalidad

    motivo: string

    planId: string

    planCustom?: {
      nombre: string

      cuotas: number

      frecuencia: Frecuencia

      interes: number
    }
  }
}

export function crearOperacion(
  payload: NuevaOperacionPayload,
): Promise<CrearOperacionResponse> {
  return apiRequest("/operaciones", {
    method: "POST",

    body: JSON.stringify(payload),
  })
}

export interface CrearOperacionResponse {
  ok: boolean
  cliente: Omit<Cliente, "operaciones">
  operacion: Operacion
  planCreado: boolean
  caja: CapitalSplit
  activo: CapitalSplit
}

export function registrarPago(
  opId: string,

  modalidad: Modalidad,
): Promise<RegistrarPagoResponse> {
  return apiRequest(`/operaciones/${opId}/pago`, {
    method: "POST",

    body: JSON.stringify({ modalidad }),
  })
}

export interface RegistrarPagoResponse {
  ok: boolean
  operacionId: string
  pagosRealizados: number
  caja: CapitalSplit
  activo: CapitalSplit
}

export interface ActualizarLimiteResponse {
  ok: boolean
  limiteReserva: number
}

export function actualizarLimite(
  limiteReserva: number,
): Promise<ActualizarLimiteResponse> {
  return apiRequest("/configuracion/limite", {
    method: "PUT",

    body: JSON.stringify({ limiteReserva }),
  })
}

export interface AgregarPlanResponse {
  ok: boolean
  plan: Plan
}

export function agregarPlan(plan: {
  nombre: string
  cuotas: number
  frecuencia: Frecuencia
  interes: number
}): Promise<AgregarPlanResponse> {
  return apiRequest("/planes", {
    method: "POST",
    body: JSON.stringify(plan),
  })
}

export interface EliminarPlanResponse {
  ok: boolean
  id: string
}

export function eliminarPlan(id: string): Promise<EliminarPlanResponse> {
  return apiRequest(`/planes/${id}`, { method: "DELETE" })
}
