import type { CapitalSplit, Cliente, Operacion, Plan } from "./types"
import { totalCapital } from "./formatters"

// ─── Capital alerts ───────────────────────────────────────────────────────────

export function isCajaLow(caja: CapitalSplit, limiteReserva: number): boolean {
  return totalCapital(caja) <= limiteReserva * 1.5
}

export function isCajaBlocked(
  caja: CapitalSplit,
  limiteReserva: number,
): boolean {
  return totalCapital(caja) <= limiteReserva
}

// ─── Operacion calculations ──────────────────────────────────────────────────

export function calcularTotalDevolver(monto: number, plan: Plan): number {
  return monto * (1 + plan.interes / 100)
}

export function calcularCuotaValor(
  totalDevolver: number,
  cuotas: number,
): number {
  return cuotas > 0 ? totalDevolver / cuotas : 0
}

export function calcularProgreso(
  pagosRealizados: number,
  cuotasTotales: number,
): number {
  return cuotasTotales > 0 ? (pagosRealizados / cuotasTotales) * 100 : 0
}

// ─── Cartera helpers ─────────────────────────────────────────────────────────

export type EstadoOperacion = Operacion["estado"]

export function peorEstadoCliente(operaciones: Operacion[]): EstadoOperacion {
  return operaciones.reduce<EstadoOperacion>((acc, op) => {
    if (op.estado === "mora") return "mora"
    if (op.estado === "vence-pronto" && acc !== "mora") return "vence-pronto"
    return acc
  }, "al-dia")
}

export function totalPorModalidad(
  operaciones: Operacion[],
  modalidad: Operacion["modalidad"],
): number {
  return operaciones
    .filter((o) => o.modalidad === modalidad)
    .reduce((s, o) => s + o.monto, 0)
}

// ─── Próximos vencimientos ───────────────────────────────────────────────────

export interface VencimientoItem extends Operacion {
  clienteNombre: string
}

export function proximosVencimientos(
  clientes: Cliente[],
  limit: number,
): VencimientoItem[] {
  return clientes
    .flatMap((c) =>
      c.operaciones.map((op) => ({ ...op, clienteNombre: c.nombre })),
    )
    .sort((a, b) => a.proximoVencimiento.localeCompare(b.proximoVencimiento))
    .slice(0, limit)
}

// ─── Initials ────────────────────────────────────────────────────────────────

export function initialsFrom(nombre: string): string {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}
