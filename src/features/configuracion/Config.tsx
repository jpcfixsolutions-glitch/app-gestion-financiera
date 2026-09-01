import { useState } from "react"
import type { AppState, Frecuencia, Plan } from "@/domain/finance/types"
import { formatCurrency as fmt } from "@/domain/finance/formatters"
import {
  actualizarLimite,
  agregarPlan,
  eliminarPlan,
} from "@/lib/api"
import Icon from "@/components/ui/Icon"

export interface ConfigProps {
  state: AppState
  setState: (fn: (prev: AppState) => AppState) => void
  reload: () => Promise<void>
}

export default function Config({ state, setState, reload }: ConfigProps) {
  const [limiteInput, setLimiteInput] = useState(String(state.limiteReserva))
  const [nuevoPlan, setNuevoPlan] = useState({
    nombre: "",
    cuotas: "3",
    frecuencia: "Mensual" as Frecuencia,
    interes: "15",
  })

  async function saveLimite() {
    const parsed = Number(limiteInput.replace(/\D/g, ""))
    setState((prev) => ({ ...prev, limiteReserva: parsed }))
    await actualizarLimite(parsed)
    await reload()
  }

  async function addPlan() {
    if (!nuevoPlan.nombre || !nuevoPlan.cuotas || !nuevoPlan.interes) return
    const plan: Plan = {
      id: "p" + Date.now(),
      nombre: nuevoPlan.nombre,
      cuotas: Number(nuevoPlan.cuotas),
      frecuencia: nuevoPlan.frecuencia,
      interes: Number(nuevoPlan.interes),
    }
    setState((prev) => ({ ...prev, planes: [...prev.planes, plan] }))
    await agregarPlan({
      nombre: plan.nombre,
      cuotas: plan.cuotas,
      frecuencia: plan.frecuencia,
      interes: plan.interes,
    })
    setNuevoPlan({
      nombre: "",
      cuotas: "3",
      frecuencia: "Mensual",
      interes: "15",
    })
    await reload()
  }

  async function deletePlan(id: string) {
    setState((prev) => ({
      ...prev,
      planes: prev.planes.filter((p) => p.id !== id),
    }))
    await eliminarPlan(id)
    await reload()
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
      <div>
        <p className="text-[11px] font-mono text-slate-400 tracking-widest uppercase mb-1">
          Módulo
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Configuración</h2>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Control de Caja
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            Reserva mínima (combinada) que no puede comprometerse.
          </p>
        </div>
        <div className="px-5 py-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5">
              Límite de Reserva Mínima (ARS)
            </label>
            <input
              type="text"
              value={limiteInput}
              onChange={(e) => setLimiteInput(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>
          <button
            onClick={saveLimite}
            className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 text-sm font-semibold transition-colors"
          >
            Guardar
          </button>
        </div>
        <div className="px-5 pb-4">
          <p className="text-[11px] text-slate-400 font-mono">
            Valor actual:{" "}
            <span className="text-brand-600">{fmt(state.limiteReserva)}</span>
          </p>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Métodos de Financiación Predeterminados
          </p>
          <p className="text-sm text-slate-600 mt-0.5">
            Planes disponibles al registrar una nueva operación.
          </p>
        </div>
        <div className="divide-y divide-slate-50">
          {state.planes.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{p.nombre}</p>
                <p className="text-[11px] font-mono text-slate-400">
                  {p.cuotas} cuotas · {p.frecuencia} · {p.interes}% interés
                </p>
              </div>
              <button
                onClick={() => deletePlan(p.id)}
                aria-label={`Eliminar plan ${p.nombre}`}
                className="text-slate-300 hover:text-danger-600 transition-colors p-1"
              >
                <Icon name="trash" cls="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-5 py-5 space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            Nuevo método
          </p>
          <input
            placeholder="Nombre del plan"
            value={nuevoPlan.nombre}
            onChange={(e) =>
              setNuevoPlan({ ...nuevoPlan, nombre: e.target.value })
            }
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Cuotas
              </label>
              <input
                type="number"
                min="1"
                value={nuevoPlan.cuotas}
                onChange={(e) =>
                  setNuevoPlan({ ...nuevoPlan, cuotas: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Frecuencia
              </label>
              <select
                value={nuevoPlan.frecuencia}
                onChange={(e) =>
                  setNuevoPlan({
                    ...nuevoPlan,
                    frecuencia: e.target.value as Frecuencia,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {(["Diario", "Quincenal", "Mensual"] as Frecuencia[]).map(
                  (f) => (
                    <option key={f}>{f}</option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                Interés %
              </label>
              <input
                type="number"
                min="0"
                value={nuevoPlan.interes}
                onChange={(e) =>
                  setNuevoPlan({ ...nuevoPlan, interes: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <button
            onClick={addPlan}
            className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="plus" cls="w-4 h-4" /> Agregar plan
          </button>
        </div>
      </section>
    </div>
  )
}
