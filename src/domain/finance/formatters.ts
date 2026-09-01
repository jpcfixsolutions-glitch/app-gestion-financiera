import type { CapitalSplit } from "./types"

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
}

export function totalCapital(split: CapitalSplit | undefined) {
  if (!split) return 0
  return (split.efectivo ?? 0) + (split.transferencia ?? 0)
}
