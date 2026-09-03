import type { Operacion } from "./types"

export const estadoConfig: Record<Operacion["estado"], {
  label: string

  dot: string

  badge: string
}> = {
  "al-dia": {
    label: "Al día",

    dot: "bg-success-500",

    badge: "bg-success-100 text-success-600",
  },

  "vence-pronto": {
    label: "Vence pronto",

    dot: "bg-warning-500",

    badge: "bg-warning-100 text-warning-600",
  },

  mora: {
    label: "En mora",

    dot: "bg-danger-600",

    badge: "bg-danger-100 text-danger-700",
  },
}
