import type { CapitalSplit } from "@/domain/finance/types"

import {
  formatCurrency as fmt,
  totalCapital as total,
} from "@/domain/finance/formatters"

import Icon from "@/components/ui/Icon"

export interface CapitalCardProps {
  label: string

  split: CapitalSplit

  totalGlobal: number

  alertLow?: boolean

  alertBlocked?: boolean
}

export default function CapitalCard({
  label,

  split,

  totalGlobal,

  alertLow,

  alertBlocked,
}: CapitalCardProps) {
  const safeSplit: CapitalSplit = split ?? { efectivo: 0, transferencia: 0 }

  const tot = total(safeSplit)

  const pct = totalGlobal > 0 ? Math.min(100, (tot / totalGlobal) * 100) : 0

  const isCapitalEnCaja = alertLow !== undefined

  const borderColor = isCapitalEnCaja
    ? alertBlocked
      ? "border-danger-600"
      : alertLow
        ? "border-warning-500"
        : "border-brand-200"
    : "border-success-100"

  const bgColor = isCapitalEnCaja
    ? alertBlocked
      ? "bg-danger-50"
      : alertLow
        ? "bg-warning-100"
        : "bg-brand-50"
    : "bg-success-50"

  const barColor = isCapitalEnCaja
    ? alertBlocked
      ? "bg-danger-600"
      : alertLow
        ? "bg-warning-500"
        : "bg-brand-500"
    : "bg-success-500"

  const totalColor = isCapitalEnCaja
    ? alertBlocked
      ? "text-danger-700"
      : alertLow
        ? "text-warning-600"
        : "text-brand-700"
    : "text-success-600"

  return (
    <div className={`rounded-xl p-4 lg:p-5 border-2 ${bgColor} ${borderColor}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 leading-tight">
          {label}
        </p>
        {isCapitalEnCaja && alertLow && (
          <Icon
            name="alert"
            cls={`w-4 h-4 shrink-0 ${
              alertBlocked ? "text-danger-600" : "text-warning-600"
            }`}
          />
        )}
      </div>

      <p
        className={`text-2xl lg:text-3xl font-mono font-semibold leading-none ${totalColor}`}
      >
        {fmt(tot)}
      </p>

      {isCapitalEnCaja && alertLow && (
        <p
          className={`mt-1 text-[10px] font-medium ${
            alertBlocked ? "text-danger-700" : "text-warning-600"
          }`}
        >
          {alertBlocked ? "Límite alcanzado" : "Próximo al límite"}
        </p>
      )}

      {/* Split row */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded-lg bg-white/60 px-2.5 py-1.5">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Icon name="cash" cls="w-3 h-3" /> Efectivo
          </p>
          <p className={`text-sm font-mono font-semibold ${totalColor}`}>
            {fmt(safeSplit.efectivo)}
          </p>
        </div>
        <div className="flex-1 rounded-lg bg-white/60 px-2.5 py-1.5">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Icon name="transfer" cls="w-3 h-3" /> Transfer.
          </p>
          <p className={`text-sm font-mono font-semibold ${totalColor}`}>
            {fmt(safeSplit.transferencia)}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
