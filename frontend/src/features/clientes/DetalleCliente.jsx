import { useState } from "react"
import {
  formatCurrency as fmt,
  formatShortDate as fmtDate,
} from "@/domain/finance/formatters"
import { estadoConfig } from "@/domain/finance/status"
import { calcularProgreso, initialsFrom } from "@/domain/finance/calculations"
import { registrarPago as registrarPagoApi } from "@/lib/api"
import ModalidadToggle from "@/components/ui/ModalidadToggle"
import Icon from "@/components/ui/Icon"
export default function DetalleCliente({ cliente, setState, setView }) {
  const [pagoModalidad, setPagoModalidad] = useState({})
  const [savingOperationId, setSavingOperationId] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  async function registrarPago(op) {
    if (savingOperationId) return
    const modalidadCobro = pagoModalidad[op.id] ?? op.modalidad
    setSavingOperationId(op.id)
    setPaymentError(null)
    try {
      const result = await registrarPagoApi(op.id, modalidadCobro)
      setState((previous) => ({
        ...previous,
        caja: result.caja,
        activo: result.activo,
        actividad: [
          ...[...(result.actividades ?? [])].reverse(),
          ...previous.actividad,
        ],
        clientes: previous.clientes.map((currentClient) => ({
          ...currentClient,
          operaciones: currentClient.operaciones.map((operation) =>
            operation.id === result.operacionId
              ? { ...operation, pagosRealizados: result.pagosRealizados }
              : operation,
          ),
        })),
      }))
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "No se pudo registrar el pago",
      )
    } finally {
      setSavingOperationId(null)
    }
  }
  return (
    <div className="pb-24 lg:pb-8">
      <div className="px-4 lg:px-8 py-4 border-b border-slate-100 flex items-center gap-3 bg-white sticky top-0 z-10">
        <button
          onClick={() => setView("cartera")}
          aria-label="Volver a cartera"
          className="text-slate-400 hover:text-slate-700 p-1"
        >
          <Icon name="back" cls="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Cartera › Cliente
          </p>
          <p className="text-base font-semibold text-slate-800">
            {cliente.nombre}
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {paymentError && (
          <p
            className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600"
            role="alert"
          >
            {paymentError}
          </p>
        )}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 font-bold text-base">
                {initialsFrom(cliente.nombre)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{cliente.nombre}</p>
              <p className="text-[11px] font-mono text-slate-400">
                DNI {cliente.dni}
              </p>
            </div>
          </div>
          {[
            ["Teléfono", cliente.telefono],
            ["Dirección", cliente.direccion],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex px-5 py-2.5 border-b border-slate-50 last:border-0"
            >
              <span className="text-[11px] font-mono text-slate-400 w-24 shrink-0">
                {k}
              </span>
              <span className="text-sm text-slate-700">{v}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-3">
            Operaciones Activas
          </p>
          <div className="space-y-3">
            {cliente.operaciones.map((op) => {
              const cfg = estadoConfig[op.estado]
              const progreso = calcularProgreso(
                op.pagosRealizados,
                op.plan.cuotas,
              )
              const cobro = pagoModalidad[op.id] ?? op.modalidad
              return (
                <div
                  key={op.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        {op.motivo}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon
                        name={op.modalidad === "Efectivo" ? "cash" : "transfer"}
                        cls="w-3.5 h-3.5 text-slate-400"
                      />
                      <p className="text-[11px] font-mono text-slate-400">
                        {op.modalidad} · {op.plan.nombre} · {op.plan.cuotas}{" "}
                        cuotas {op.plan.frecuencia}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-2 gap-3">
                    {[
                      ["Capital asignado", fmt(op.monto)],
                      ["Total a devolver", fmt(op.totalDevolver)],
                      ["Valor de cuota", fmt(op.cuotaValor)],
                      ["Próx. vencimiento", fmtDate(op.proximoVencimiento)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[10px] font-mono text-slate-400 mb-0.5">
                          {k}
                        </p>
                        <p className="text-sm font-mono font-semibold text-slate-800">
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 pb-3">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                      <span>
                        {op.pagosRealizados} / {op.plan.cuotas} cuotas pagadas
                      </span>
                      <span>{Math.round(progreso)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>

                  {op.pagosRealizados < op.plan.cuotas && (
                    <div className="px-5 pb-4 space-y-2">
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                          Modalidad de cobro
                        </p>
                        <ModalidadToggle
                          value={cobro}
                          onChange={(m) =>
                            setPagoModalidad((prev) => ({
                              ...prev,
                              [op.id]: m,
                            }))
                          }
                        />
                      </div>
                      <button
                        onClick={() => registrarPago(op)}
                        disabled={savingOperationId !== null}
                        className="w-full rounded-lg bg-success-500 hover:bg-success-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Icon name="receipt" cls="w-4 h-4" />
                        {savingOperationId === op.id
                          ? "Registrando…"
                          : `Registrar pago — ${fmt(op.cuotaValor)} · ${cobro}`}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
