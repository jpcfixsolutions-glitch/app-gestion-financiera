import type {
  AppState,
  Frecuencia,
  Modalidad,
} from "@/domain/finance/types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function fetchAppState(): Promise<AppState> {
  return request<AppState>("/state");
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface NuevaOperacionPayload {
  cliente: {
    nombre: string;
    dni: string;
    telefono: string;
    direccion: string;
  };
  operacion: {
    monto: number;
    modalidad: Modalidad;
    motivo: string;
    planId: string;
    planCustom?: {
      nombre: string;
      cuotas: number;
      frecuencia: Frecuencia;
      interes: number;
    };
    totalDevolver: number;
    cuotaValor: number;
  };
}

export function crearOperacion(payload: NuevaOperacionPayload): Promise<{ ok: boolean }> {
  return request("/operaciones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registrarPago(
  opId: string,
  modalidad: Modalidad,
): Promise<{ ok: boolean }> {
  return request(`/operaciones/${opId}/pago`, {
    method: "POST",
    body: JSON.stringify({ modalidad }),
  });
}

export function actualizarLimite(limiteReserva: number): Promise<{ ok: boolean }> {
  return request("/configuracion/limite", {
    method: "PUT",
    body: JSON.stringify({ limiteReserva }),
  });
}

export function agregarPlan(plan: {
  nombre: string;
  cuotas: number;
  frecuencia: Frecuencia;
  interes: number;
}): Promise<{ ok: boolean; id: string }> {
  return request("/planes", {
    method: "POST",
    body: JSON.stringify(plan),
  });
}

export function eliminarPlan(id: string): Promise<{ ok: boolean }> {
  return request(`/planes/${id}`, { method: "DELETE" });
}
