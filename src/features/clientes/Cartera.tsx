import { useState, useMemo } from "react"
import type { Cliente, View } from "@/domain/finance/types"
import { formatCurrency as fmt } from "@/domain/finance/formatters"
import { estadoConfig } from "@/domain/finance/status"
import {
  initialsFrom,
  peorEstadoCliente,
  totalPorModalidad,
} from "@/domain/finance/calculations"
import Icon from "@/components/ui/Icon"

export interface CarteraProps {
  clientes: Cliente[]
  setView: (v: View) => void
  setSelectedCliente: (id: string) => void
}

export default function Cartera({
  clientes,
  setView,
  setSelectedCliente,
}: CarteraProps) {
  const [q, setQ] = useState("")
  const filtered = useMemo(
    () =>
      clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q.toLowerCase()) || c.dni.includes(q),
      ),
    [clientes, q],
  )

  return (
    <div className="p-4 lg:p-8 space-y-4 pb-24 lg:pb-8">
      <div>
        <p className="text-[11px] font-mono text-slate-400 tracking-widest uppercase mb-1">
          Módulo
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Cartera de Clientes
        </h2>
      </div>

      <div className="relative">
        <Icon
          name="search"
          cls="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
        />
        <input
          type="search"
          placeholder="Buscar por nombre o DNI…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const peorEstado = peorEstadoCliente(c.operaciones)
          const cfg = estadoConfig[peorEstado]
          const totalEfectivo = totalPorModalidad(c.operaciones, "Efectivo")
          const totalTransf = totalPorModalidad(c.operaciones, "Transferencia")

          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCliente(c.id)
                setView("cliente")
              }}
              className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-brand-300 hover:shadow-sm transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <span className="text-brand-700 font-semibold text-sm">
                  {initialsFrom(c.nombre)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {c.nombre}
                </p>
                <p className="text-[11px] font-mono text-slate-400">{c.dni}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {totalEfectivo > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                      <Icon name="cash" cls="w-3 h-3" /> {fmt(totalEfectivo)}
                    </span>
                  )}
                  {totalTransf > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                      <Icon name="transfer" cls="w-3 h-3" /> {fmt(totalTransf)}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}
              >
                {cfg.label}
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Icon name="users" cls="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin resultados para "{q}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
