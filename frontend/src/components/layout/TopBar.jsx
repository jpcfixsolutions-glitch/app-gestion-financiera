import { formatCurrency as fmt } from "@/domain/finance/formatters"
import { isCajaBlocked } from "@/domain/finance/calculations"
import Icon from "@/components/ui/Icon"
export default function TopBar({ caja, limiteReserva, onNuevaOperacion }) {
  const blocked = isCajaBlocked(caja, limiteReserva)
  return (
    <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
      <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
        Sistema de Gestión Financiera Corporativa
      </p>
      <div className="flex items-center gap-4">
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Icon name="cash" cls="w-3 h-3" /> Efectivo
            </p>
            <p
              className={`text-sm font-mono font-semibold ${
                caja.efectivo <= limiteReserva / 2
                  ? "text-danger-600"
                  : "text-success-600"
              }`}
            >
              {fmt(caja.efectivo)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
              <Icon name="transfer" cls="w-3 h-3" /> Transfer.
            </p>
            <p
              className={`text-sm font-mono font-semibold ${
                caja.transferencia <= limiteReserva / 2
                  ? "text-danger-600"
                  : "text-success-600"
              }`}
            >
              {fmt(caja.transferencia)}
            </p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <button
          onClick={() => !blocked && onNuevaOperacion()}
          disabled={blocked}
          aria-label="Nueva Operación"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            blocked
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-700 text-white"
          }`}
        >
          <Icon name={blocked ? "lock" : "plus"} cls="w-4 h-4" />
          Nueva Operación
        </button>
      </div>
    </div>
  )
}
