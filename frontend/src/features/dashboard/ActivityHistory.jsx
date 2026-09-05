import { useState } from "react"
import {
  formatCurrency as fmt,
  formatDateTime,
} from "@/domain/finance/formatters"
import { fetchActivity } from "@/lib/api"
import Icon from "@/components/ui/Icon"

const EVENT_STYLE = {
  caja_ingreso: {
    icon: "cash",
    color: "bg-success-50 text-success-600",
    amount: "+",
  },
  caja_extraccion: {
    icon: "cash",
    color: "bg-danger-50 text-danger-600",
    amount: "−",
  },
  cliente_creado: {
    icon: "user",
    color: "bg-brand-50 text-brand-600",
  },
  cliente_actualizado: {
    icon: "edit",
    color: "bg-brand-50 text-brand-600",
  },
  operacion_creada: {
    icon: "receipt",
    color: "bg-brand-50 text-brand-600",
  },
  pago_registrado: {
    icon: "check",
    color: "bg-success-50 text-success-600",
    amount: "+",
  },
  plan_creado: {
    icon: "plus",
    color: "bg-brand-50 text-brand-600",
  },
  plan_actualizado: {
    icon: "edit",
    color: "bg-brand-50 text-brand-600",
  },
  plan_eliminado: {
    icon: "trash",
    color: "bg-danger-50 text-danger-600",
  },
  configuracion_actualizada: {
    icon: "settings",
    color: "bg-slate-100 text-slate-600",
  },
}

export default function ActivityHistory({ state, setState }) {
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState(null)

  async function loadMore() {
    const lastItem = state.actividad.at(-1)
    if (!lastItem || loadingMore) return
    setLoadingMore(true)
    setLoadError(null)
    try {
      const result = await fetchActivity(lastItem.createdAt)
      setState((previous) => {
        const knownIds = new Set(previous.actividad.map((item) => item.id))
        const newItems = result.items.filter((item) => !knownIds.has(item.id))
        return {
          ...previous,
          actividad: [...previous.actividad, ...newItems],
          hasMoreActividad: result.hasMore,
        }
      })
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial anterior.",
      )
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon name="history" cls="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Historial de actividad
            </p>
            <p className="text-[10px] text-slate-400">
              Acciones registradas por fecha y hora
            </p>
          </div>
        </div>
        {state.actividad.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-500">
            {state.actividad.length}
          </span>
        )}
      </div>

      {state.actividad.length === 0 ? (
        <div className="px-5 py-9 text-center">
          <Icon name="history" cls="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            Todavía no hay actividad
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Los próximos movimientos y cambios aparecerán acá.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {state.actividad.map((item) => {
            const style = EVENT_STYLE[item.tipo] ?? {
              icon: "history",
              color: "bg-slate-100 text-slate-600",
            }
            return (
              <article key={item.id} className="flex gap-3 px-4 py-3.5">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.color}`}
                >
                  <Icon name={style.icon} cls="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.titulo}
                    </p>
                    {item.monto !== null && (
                      <p
                        className={`shrink-0 text-sm font-mono font-semibold ${
                          style.amount === "−"
                            ? "text-danger-600"
                            : style.amount === "+"
                              ? "text-success-600"
                              : "text-slate-700"
                        }`}
                      >
                        {style.amount ?? ""}
                        {fmt(item.monto)}
                      </p>
                    )}
                  </div>
                  {item.detalle && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.detalle}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] font-mono text-slate-400">
                    {formatDateTime(item.createdAt)} · {item.usuarioNombre}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {(state.hasMoreActividad || loadError) && (
        <div className="border-t border-slate-100 px-4 py-3 text-center">
          {loadError && (
            <p className="mb-2 text-xs text-danger-600" role="alert">
              {loadError}
            </p>
          )}
          {state.hasMoreActividad && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:opacity-60"
            >
              {loadingMore ? "Cargando…" : "Cargar movimientos anteriores"}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
