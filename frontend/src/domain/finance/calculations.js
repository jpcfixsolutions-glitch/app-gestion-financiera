// ─── Capital helpers ─────────────────────────────────────────────────────────
export function totalCapital(split) {
  if (!split) return 0
  return (split.efectivo ?? 0) + (split.transferencia ?? 0)
}
// ─── Capital alerts ───────────────────────────────────────────────────────────
export function isCajaLow(caja, limiteReserva) {
  return totalCapital(caja) <= limiteReserva * 1.5
}
export function isCajaBlocked(caja, limiteReserva) {
  return totalCapital(caja) <= limiteReserva
}
// ─── Operacion calculations ──────────────────────────────────────────────────
export function calcularTotalDevolver(monto, plan) {
  return monto * (1 + plan.interes / 100)
}
export function calcularCuotaValor(totalDevolver, cuotas) {
  return cuotas > 0 ? totalDevolver / cuotas : 0
}
export function calcularProgreso(pagosRealizados, cuotasTotales) {
  return cuotasTotales > 0 ? (pagosRealizados / cuotasTotales) * 100 : 0
}
export function peorEstadoCliente(operaciones) {
  return operaciones.reduce((acc, op) => {
    if (op.estado === "mora") return "mora"
    if (op.estado === "vence-pronto" && acc !== "mora") return "vence-pronto"
    return acc
  }, "al-dia")
}
export function totalPorModalidad(operaciones, modalidad) {
  return operaciones.reduce(
    (total, operation) =>
      operation.modalidad === modalidad ? total + operation.monto : total,
    0,
  )
}
export function vencimientosPendientes(clientes) {
  return clientes
    .flatMap((c) =>
      c.operaciones.map((op) => ({ ...op, clienteNombre: c.nombre })),
    )
    .filter((op) => op.pagosRealizados < op.plan.cuotas)
    .sort((a, b) => a.proximoVencimiento.localeCompare(b.proximoVencimiento))
}
// ─── Initials ────────────────────────────────────────────────────────────────
export function initialsFrom(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}
