import { formatCurrency as fmt } from "@/domain/finance/formatters"
import { totalCapital as total } from "@/domain/finance/calculations"
import Icon from "@/components/ui/Icon"
export default function CapitalCard({
  label,
  split,
  totalGlobal,
  alertBlocked,
  tone = "success",
  onEdit,
}) {
  const safeSplit = split ?? { efectivo: 0, transferencia: 0 }
  const tot = total(safeSplit)
  const pct = totalGlobal > 0 ? Math.min(100, (tot / totalGlobal) * 100) : 0
  const color = alertBlocked ? "danger" : tone
  const styles = {
    danger: {
      border: "border-danger-600",
      background: "bg-danger-50",
      bar: "bg-danger-600",
      text: "text-danger-700",
    },
    success: {
      border: "border-success-100",
      background: "bg-success-50",
      bar: "bg-success-500",
      text: "text-success-600",
    },
    brand: {
      border: "border-brand-200",
      background: "bg-brand-50",
      bar: "bg-brand-500",
      text: "text-brand-700",
    },
  }[color]
  return (
    <div
      className={`rounded-xl p-4 lg:p-5 border-2 transition-colors ${styles.background} ${styles.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 leading-tight">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {alertBlocked && (
            <Icon name="alert" cls="w-4 h-4 shrink-0 text-danger-600" />
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-brand-700"
            >
              <Icon name="edit" cls="h-3 w-3" />
              Editar
            </button>
          )}
        </div>
      </div>

      <p
        className={`text-2xl lg:text-3xl font-mono font-semibold leading-none ${styles.text}`}
      >
        {fmt(tot)}
      </p>

      {alertBlocked && (
        <p className="mt-1 text-[10px] font-medium text-danger-700">
          Reserva mínima alcanzada
        </p>
      )}

      {/* Split row */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded-lg bg-white/60 px-2.5 py-1.5">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Icon name="cash" cls="w-3 h-3" /> Efectivo
          </p>
          <p className={`text-sm font-mono font-semibold ${styles.text}`}>
            {fmt(safeSplit.efectivo)}
          </p>
        </div>
        <div className="flex-1 rounded-lg bg-white/60 px-2.5 py-1.5">
          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Icon name="transfer" cls="w-3 h-3" /> Transfer.
          </p>
          <p className={`text-sm font-mono font-semibold ${styles.text}`}>
            {fmt(safeSplit.transferencia)}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${styles.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
