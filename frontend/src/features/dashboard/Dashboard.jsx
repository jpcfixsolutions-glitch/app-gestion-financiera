import {
  formatCurrency as fmt,
  formatShortDate as fmtDate,
} from "@/domain/finance/formatters"
import { estadoConfig } from "@/domain/finance/status"
import {
  isCajaBlocked,
  isCajaLow,
  proximosVencimientos,
  totalCapital as total,
} from "@/domain/finance/calculations"
import CapitalCard from "@/components/ui/CapitalCard"
import Icon from "@/components/ui/Icon"
export default function Dashboard({ state, setView, setSelectedCliente }) {
  const { caja, activo, limiteReserva, clientes } = state
  const totalCaja = total(caja)
  const totalActivo = total(activo)
  const totalGlobal = totalCaja + totalActivo
  const cajaLow = isCajaLow(caja, limiteReserva)
  const cajaBlocked = isCajaBlocked(caja, limiteReserva)
  const proxVencimientos = proximosVencimientos(clientes, 5)
  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      <div>
        <p className="text-[11px] font-mono text-slate-400 tracking-widest uppercase mb-1">
          Panel de Control
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Balance General
        </h2>
      </div>

      {/* Capital cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-5">
        <CapitalCard
          label="Capital en Caja"
          split={caja}
          totalGlobal={totalGlobal}
          alertLow={cajaLow}
          alertBlocked={cajaBlocked}
        />
        <CapitalCard
          label="Capital Activo"
          split={activo}
          totalGlobal={totalGlobal}
        />
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        {[
          { label: "Total en Caja", val: fmt(totalCaja) },
          { label: "Total Activo", val: fmt(totalActivo) },
          { label: "Reserva Mínima", val: fmt(limiteReserva) },
          { label: "Clientes Activos", val: String(clientes.length) },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg bg-white border border-slate-200 px-3 py-3"
          >
            <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400 mb-1">
              {m.label}
            </p>
            <p className="text-sm font-semibold font-mono text-slate-800">
              {m.val}
            </p>
          </div>
        ))}
      </div>

      {/* Próximos vencimientos */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Icon name="calendar" cls="w-4 h-4 text-slate-400" />
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Próximos Vencimientos
          </p>
        </div>
        <div className="divide-y divide-slate-50">
          {proxVencimientos.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Icon name="calendar" cls="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium text-slate-600">
                Sin vencimientos próximos
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                No hay cuotas pendientes registradas en el sistema.
              </p>
            </div>
          ) : (
            proxVencimientos.map((op) => {
              const cfg = estadoConfig[op.estado]
              return (
                <button
                  key={op.id}
                  onClick={() => {
                    setSelectedCliente(op.clienteId)
                    setView("cliente")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {op.clienteNombre}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon
                        name={op.modalidad === "Efectivo" ? "cash" : "transfer"}
                        cls="w-3 h-3 text-slate-400"
                      />
                      <p className="text-[11px] text-slate-400 font-mono">
                        {op.modalidad}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-slate-800">
                      {fmt(op.cuotaValor)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {fmtDate(op.proximoVencimiento)}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => !cajaBlocked && setView("operacion")}
        disabled={cajaBlocked}
        className={`w-full flex items-center justify-center gap-3 rounded-xl py-4 font-semibold text-sm transition-all shadow-sm ${
          cajaBlocked
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200 shadow-md active:scale-[0.99]"
        }`}
      >
        <Icon name={cajaBlocked ? "lock" : "plus"} cls="w-5 h-5" />
        {cajaBlocked
          ? "Capital insuficiente — Operación bloqueada"
          : "Nueva Operación"}
      </button>
    </div>
  )
}
