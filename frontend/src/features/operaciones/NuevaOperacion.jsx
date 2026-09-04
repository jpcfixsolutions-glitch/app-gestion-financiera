import { useState } from "react"
import { formatCurrency as fmt } from "@/domain/finance/formatters"
import {
  calcularCuotaValor,
  calcularTotalDevolver,
} from "@/domain/finance/calculations"
import { crearOperacion } from "@/lib/api"
import ModalidadToggle from "@/components/ui/ModalidadToggle"
import Icon from "@/components/ui/Icon"

const STEPS = [
  "Ficha del Cliente",
  "Datos de la Operación",
  "Método de Financiación",
  "Confirmación",
]

const CLIENT_FIELDS = [
  {
    label: "Nombre Completo",
    key: "nombre",
    type: "text",
    placeholder: "Ej: Juan Carlos Martínez",
  },
  {
    label: "DNI / CUIT",
    key: "dni",
    type: "text",
    placeholder: "Ej: 30.123.456",
  },
  {
    label: "Teléfono",
    key: "telefono",
    type: "tel",
    placeholder: "+54 11 XXXX-XXXX",
  },
  {
    label: "Dirección",
    key: "direccion",
    type: "text",
    placeholder: "Calle, número, localidad",
  },
]

const FREQUENCIES = ["Diario", "Quincenal", "Mensual"]

export default function NuevaOperacion({ state, setState, setView }) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [data, setData] = useState({
    nombre: "",
    dni: "",
    telefono: "",
    direccion: "",
    motivo: "",
    monto: "",
    modalidad: "Efectivo",
    planId: state.planes[0]?.id || "custom",
    personalizado: state.planes.length === 0,
    cuotas: "6",
    frecuencia: "Mensual",
    interes: "20",
  })
  const planSeleccionado = state.planes.find((p) => p.id === data.planId)
  const planFinal = data.personalizado
    ? {
        nombre: "Plan Personalizado",
        cuotas: Number(data.cuotas) || 1,
        frecuencia: data.frecuencia,
        interes: Number(data.interes) || 0,
      }
    : planSeleccionado || null
  const monto = Number(data.monto) || 0
  const totalDevolver = planFinal ? calcularTotalDevolver(monto, planFinal) : 0
  const cuotaValor = planFinal
    ? calcularCuotaValor(totalDevolver, planFinal.cuotas)
    : 0
  // Available in the selected modalidad
  const disponible =
    data.modalidad === "Efectivo"
      ? state.caja.efectivo
      : state.caja.transferencia
  const montoExcede = monto > disponible - state.limiteReserva / 2 && monto > 0
  async function confirm() {
    if (!planFinal || isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await crearOperacion({
        cliente: {
          nombre: data.nombre,
          dni: data.dni,
          telefono: data.telefono,
          direccion: data.direccion,
        },
        operacion: {
          monto,
          modalidad: data.modalidad,
          motivo: data.motivo,
          planId: data.personalizado ? "" : data.planId,
          planCustom: data.personalizado ? planFinal : undefined,
        },
      })
      setState((previous) => {
        const existingClient = previous.clientes.some(
          (client) => client.id === result.cliente.id,
        )
        const clientes = existingClient
          ? previous.clientes.map((client) =>
              client.id === result.cliente.id
                ? {
                    ...client,
                    ...result.cliente,
                    operaciones: [...client.operaciones, result.operacion],
                  }
                : client,
            )
          : [
              ...previous.clientes,
              { ...result.cliente, operaciones: [result.operacion] },
            ]
        const planes =
          result.planCreado &&
          !previous.planes.some((plan) => plan.id === result.operacion.plan.id)
            ? [...previous.planes, result.operacion.plan]
            : previous.planes
        return {
          ...previous,
          caja: result.caja,
          activo: result.activo,
          planes,
          clientes,
        }
      })
      setView("dashboard")
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la operación",
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="min-h-full flex flex-col pb-24 lg:pb-8">
      <div className="px-4 lg:px-8 py-4 border-b border-slate-100 flex items-center gap-3 bg-white sticky top-0 z-10">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : setView("dashboard"))}
          aria-label="Volver"
          className="text-slate-400 hover:text-slate-700 p-1"
        >
          <Icon name="back" cls="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Paso {step + 1} de {STEPS.length}
          </p>
          <p className="text-base font-semibold text-slate-800">
            {STEPS[step]}
          </p>
        </div>
      </div>

      <div className="flex px-4 lg:px-8 pt-4 gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? "bg-brand-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 px-4 lg:px-8 py-6 space-y-4">
        {/* Step 0 — Ficha cliente */}
        {step === 0 && (
          <div className="space-y-4">
            {CLIENT_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={data[f.key]}
                  onChange={(e) =>
                    setData({ ...data, [f.key]: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-4 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Datos operación + modalidad */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5">
                Motivo de la Operación
              </label>
              <textarea
                rows={3}
                placeholder="Descripción breve del destino de los fondos"
                value={data.motivo}
                onChange={(e) => setData({ ...data, motivo: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-4 text-base text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            {/* Modalidad selector */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5">
                Modalidad de Desembolso
              </label>
              <ModalidadToggle
                value={data.modalidad}
                onChange={(m) => setData({ ...data, modalidad: m })}
              />
              <div className="mt-2 flex gap-2">
                <div className="flex-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                  <p className="text-[9px] font-mono text-slate-400 uppercase">
                    Disponible en caja
                  </p>
                  <p className="text-sm font-mono font-semibold text-slate-700">
                    {fmt(disponible)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5">
                Monto a Financiar (ARS)
              </label>
              <input
                type="number"
                placeholder="0"
                value={data.monto}
                onChange={(e) => setData({ ...data, monto: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-4 text-2xl font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
              {monto > 0 && (
                <p className="mt-1.5 text-[11px] font-mono text-slate-400">
                  {fmt(monto)}
                </p>
              )}
              {montoExcede && (
                <p className="mt-1.5 text-[11px] font-mono text-warning-600">
                  ⚠ El monto supera el disponible en{" "}
                  {data.modalidad.toLowerCase()}.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — Plan */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5">
                Plan Base
              </label>
              <select
                value={data.personalizado ? "custom" : data.planId}
                onChange={(e) => {
                  if (e.target.value === "custom")
                    setData({ ...data, personalizado: true })
                  else
                    setData({
                      ...data,
                      personalizado: false,
                      planId: e.target.value,
                    })
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-4 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent appearance-none bg-white"
              >
                {state.planes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.cuotas} cuotas, {p.frecuencia}, {p.interes}%
                  </option>
                ))}
                <option value="custom">Plan Personalizado…</option>
              </select>
            </div>

            {data.personalizado && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-brand-600">
                  Calculadora Personalizada
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Cuotas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={data.cuotas}
                      onChange={(e) =>
                        setData({ ...data, cuotas: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Frecuencia
                    </label>
                    <select
                      value={data.frecuencia}
                      onChange={(e) =>
                        setData({
                          ...data,
                          frecuencia: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    >
                      {FREQUENCIES.map((f) => (
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
                      value={data.interes}
                      onChange={(e) =>
                        setData({ ...data, interes: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {monto > 0 && planFinal && (
              <div className="rounded-xl bg-slate-900 text-white p-5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Vista previa · {planFinal.nombre}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono mb-0.5">
                      Total a devolver
                    </p>
                    <p className="text-xl font-mono font-semibold">
                      {fmt(totalDevolver)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono mb-0.5">
                      Valor por cuota
                    </p>
                    <p className="text-xl font-mono font-semibold text-success-400">
                      {fmt(cuotaValor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono mb-0.5">
                      Cuotas
                    </p>
                    <p className="text-sm font-mono">
                      {planFinal.cuotas} · {planFinal.frecuencia}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono mb-0.5">
                      Modalidad
                    </p>
                    <div className="flex items-center gap-1">
                      <Icon
                        name={
                          data.modalidad === "Efectivo" ? "cash" : "transfer"
                        }
                        cls="w-3.5 h-3.5 text-brand-300"
                      />
                      <p className="text-sm font-mono">{data.modalidad}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Confirmación */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Ficha del Cliente
                </p>
              </div>
              {[
                ["Nombre", data.nombre],
                ["DNI", data.dni],
                ["Teléfono", data.telefono],
                ["Dirección", data.direccion],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex px-5 py-2.5 border-b border-slate-50 last:border-0"
                >
                  <span className="text-[11px] font-mono text-slate-400 w-24 shrink-0">
                    {k}
                  </span>
                  <span className="text-sm text-slate-800">{v}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Datos de la Operación
                </p>
              </div>
              <div className="flex px-5 py-2.5 border-b border-slate-50">
                <span className="text-[11px] font-mono text-slate-400 w-24 shrink-0">
                  Motivo
                </span>
                <span className="text-sm text-slate-800">{data.motivo}</span>
              </div>
              <div className="flex px-5 py-2.5 border-b border-slate-50">
                <span className="text-[11px] font-mono text-slate-400 w-24 shrink-0">
                  Monto
                </span>
                <span className="text-sm text-slate-800 font-mono">
                  {fmt(monto)}
                </span>
              </div>
              <div className="flex items-center px-5 py-2.5">
                <span className="text-[11px] font-mono text-slate-400 w-24 shrink-0">
                  Modalidad
                </span>
                <div className="flex items-center gap-1.5">
                  <Icon
                    name={data.modalidad === "Efectivo" ? "cash" : "transfer"}
                    cls="w-4 h-4 text-brand-500"
                  />
                  <span className="text-sm text-slate-800 font-medium">
                    {data.modalidad}
                  </span>
                </div>
              </div>
            </div>

            {planFinal && (
              <div className="rounded-xl bg-brand-950 text-white p-5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-brand-300">
                  Resumen Financiero
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-brand-400 font-mono mb-0.5">
                      Plan
                    </p>
                    <p className="text-sm font-medium">{planFinal.nombre}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-400 font-mono mb-0.5">
                      Frecuencia
                    </p>
                    <p className="text-sm font-medium">
                      {planFinal.cuotas} cuotas {planFinal.frecuencia}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-400 font-mono mb-0.5">
                      Total a devolver
                    </p>
                    <p className="text-lg font-mono font-semibold text-white">
                      {fmt(totalDevolver)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-400 font-mono mb-0.5">
                      Valor de cuota
                    </p>
                    <p className="text-lg font-mono font-semibold text-success-400">
                      {fmt(cuotaValor)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 lg:px-8 py-4 border-t border-slate-100 bg-white">
        {submitError && (
          <p className="mb-3 text-sm text-danger-600" role="alert">
            {submitError}
          </p>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Continuar <Icon name="chevron" cls="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={confirm}
            disabled={isSubmitting}
            className="w-full bg-success-500 hover:bg-success-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Icon name="check" cls="w-5 h-5" />
            {isSubmitting ? "Guardando…" : "Confirmar Operación"}
          </button>
        )}
      </div>
    </div>
  )
}
