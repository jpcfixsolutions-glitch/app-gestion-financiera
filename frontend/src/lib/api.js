import { apiRequest } from "@/lib/apiClient"
// ─── Queries ─────────────────────────────────────────────────────────────────
export function fetchAppState() {
  return apiRequest("/state")
}
export function fetchActivity(before) {
  const query = before ? `?before=${encodeURIComponent(before)}` : ""
  return apiRequest(`/actividad${query}`)
}
export function crearOperacion(payload) {
  return apiRequest("/operaciones", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
export function registrarPago(opId, modalidad) {
  return apiRequest(`/operaciones/${opId}/pago`, {
    method: "POST",
    body: JSON.stringify({ modalidad }),
  })
}
export function actualizarLimite(limiteReserva) {
  return apiRequest("/configuracion/limite", {
    method: "PUT",
    body: JSON.stringify({ limiteReserva }),
  })
}
export function registrarMovimientoCaja(movimiento) {
  return apiRequest("/configuracion/caja/movimientos", {
    method: "POST",
    body: JSON.stringify(movimiento),
  })
}
export function agregarPlan(plan) {
  return apiRequest("/planes", {
    method: "POST",
    body: JSON.stringify(plan),
  })
}
export function editarPlan(id, plan) {
  return apiRequest(`/planes/${id}`, {
    method: "PUT",
    body: JSON.stringify(plan),
  })
}
export function eliminarPlan(id) {
  return apiRequest(`/planes/${id}`, { method: "DELETE" })
}
