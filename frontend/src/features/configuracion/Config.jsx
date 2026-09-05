import { useState } from "react"
import { formatCurrency as fmt } from "@/domain/finance/formatters"
import { actualizarLimite, agregarPlan, eliminarPlan } from "@/lib/api"
import Icon from "@/components/ui/Icon"

const EMPTY_PLAN = {
  nombre: "",
  cuotas: "3",
  frecuencia: "Mensual",
  interes: "15",
}

export default function Config({ state, setState }) {
  const [limiteInput, setLimiteInput] = useState(String(state.limiteReserva))
  const [nuevoPlan, setNuevoPlan] = useState(EMPTY_PLAN)
  const [savingAction, setSavingAction] = useState(null)
  const [actionError, setActionError] = useState(null)
  async function saveLimite() {
    const parsed = Number(limiteInput.replace(/\D/g, ""))
    setSavingAction("limit")
    setActionError(null)
    try {
      const result = await actualizarLimite(parsed)
      setState((previous) => ({
        ...previous,
        limiteReserva: result.limiteReserva,
        actividad: [
          ...[...(result.actividades ?? [])].reverse(),
          ...previous.actividad,
        ],
      }))
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "No se pudo guardar el límite",
      )
    } finally {
      setSavingAction(null)
    }
  }
  async function addPlan() {
    if (
      !nuevoPlan.nombre ||
      !nuevoPlan.cuotas ||
      !nuevoPlan.interes ||
      savingAction
    )
      return
    const plan = {
      nombre: nuevoPlan.nombre,
      cuotas: Number(nuevoPlan.cuotas),
      frecuencia: nuevoPlan.frecuencia,
      interes: Number(nuevoPlan.interes),
    }
    setSavingAction("plan")
    setActionError(null)
    try {
      const result = await agregarPlan(plan)
      setState((previous) => ({
        ...previous,
        planes: [...previous.planes, result.plan],
        actividad: [
          ...[...(result.actividades ?? [])].reverse(),
          ...previous.actividad,
        ],
      }))
      setNuevoPlan(EMPTY_PLAN)
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "No se pudo agregar el plan",
      )
    } finally {
      setSavingAction(null)
    }
  }
  async function deletePlan(id) {
    if (savingAction) return
    setSavingAction(id)
    setActionError(null)
    try {
      const result = await eliminarPlan(id)
      setState((previous) => ({
        ...previous,
        planes: previous.planes.filter((plan) => plan.id !== result.id),
        actividad: [
          ...[...(result.actividades ?? [])].reverse(),
          ...previous.actividad,
        ],
      }))
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "No se pudo eliminar el plan",
      )
    } finally {
      setSavingAction(null)
    }
  }
  return (
    <div className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
      <div>
        <p className="text-[11px] font-mono text-slate-400 tracking-widest uppercase mb-1">
          Módulo
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Configuración</h2>
      </div>

      {actionError && (
        <p
          className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600"
          role="alert"
        >
          {actionError}
        </p>
      )}

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
            disabled={savingAction !== null}
            className="rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 text-sm font-semibold transition-colors"
          >
            {savingAction === "limit" ? "Guardando…" : "Guardar"}
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
          {state.planes.length === 0 ? (
            <div className="px-5 py-6 text-center text-xs text-slate-400">
              No hay planes de financiación configurados. Creá uno nuevo a
              continuación.
            </div>
          ) : (
            state.planes.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {p.nombre}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {p.cuotas} cuotas · {p.frecuencia} · {p.interes}% interés
                  </p>
                </div>
                <button
                  onClick={() => deletePlan(p.id)}
                  disabled={savingAction !== null}
                  aria-label={`Eliminar plan ${p.nombre}`}
                  className="text-slate-300 hover:text-danger-600 disabled:opacity-40 transition-colors p-1"
                >
                  <Icon name="trash" cls="w-4 h-4" />
                </button>
              </div>
            ))
          )}
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
                    frecuencia: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {["Diario", "Quincenal", "Mensual"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
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
            disabled={savingAction !== null}
            className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="plus" cls="w-4 h-4" />
            {savingAction === "plan" ? "Agregando…" : "Agregar plan"}
          </button>
        </div>
      </section>
    </div>
  )
}
