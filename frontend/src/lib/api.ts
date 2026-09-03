import type { AppState, Frecuencia, Modalidad } from "@/domain/finance/types"
import { getAuthToken } from "@/lib/authService"
import { getApiUrl } from "@/lib/apiConfig"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",

    ...(token ? { Authorization: `Bearer ${token}` } : {}),

    ...(options?.headers as Record<string, string> || {}),
  }

  const res = await fetch(getApiUrl(path), {
    ...options,
    credentials: "include",
    headers,
  })

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      sessionStorage.removeItem("gf_auth_token")

      sessionStorage.removeItem("gf_auth_session")

      window.location.reload()
    }

    throw new Error(`API error ${res.status}: ${await res.text()}`)
  }

  return res.json()
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function fetchAppState(): Promise<AppState> {
  return request<AppState>("/state")
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

    totalDevolver: number

    cuotaValor: number
  }
}

export function crearOperacion(
  payload: NuevaOperacionPayload,
): Promise<{ ok: boolean }> {
  return request("/operaciones", {
    method: "POST",

    body: JSON.stringify(payload),
  })
}

export function registrarPago(
  opId: string,

  modalidad: Modalidad,
): Promise<{ ok: boolean }> {
  return request(`/operaciones/${opId}/pago`, {
    method: "POST",

    body: JSON.stringify({ modalidad }),
  })
}

export function actualizarLimite(
  limiteReserva: number,
): Promise<{ ok: boolean }> {
  return request("/configuracion/limite", {
    method: "PUT",

    body: JSON.stringify({ limiteReserva }),
  })
}

export interface AgregarPlanResponse {
  ok: boolean
  id: string
}

export function agregarPlan(plan: {
  nombre: string
  cuotas: number
  frecuencia: Frecuencia
  interes: number
}): Promise<AgregarPlanResponse> {
  return request("/planes", {
    method: "POST",
    body: JSON.stringify(plan),
  })
}

export function eliminarPlan(id: string): Promise<{ ok: boolean }> {
  return request(`/planes/${id}`, { method: "DELETE" })
}
