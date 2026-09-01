import type { View } from "@/domain/finance/types"

export interface NavItem {
  readonly id: View
  readonly label: string
  readonly icon: string
}

export const SIDEBAR_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Panel de Control", icon: "dashboard" },
  { id: "cartera", label: "Cartera de Clientes", icon: "users" },
  { id: "config", label: "Configuración", icon: "settings" },
] as const

export const BOTTOM_NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Panel", icon: "dashboard" },
  { id: "cartera", label: "Cartera", icon: "users" },
  { id: "config", label: "Config.", icon: "settings" },
] as const
