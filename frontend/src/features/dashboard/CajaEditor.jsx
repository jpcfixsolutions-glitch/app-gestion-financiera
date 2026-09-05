import { useState } from "react"
import { formatCurrency as fmt } from "@/domain/finance/formatters"
import { registrarMovimientoCaja } from "@/lib/api"
import Icon from "@/components/ui/Icon"
import ModalidadToggle from "@/components/ui/ModalidadToggle"

export default function CajaEditor({ caja, onClose, onSaved }) {
  const [tipo, setTipo] = useState("ingreso")
  const [modalidad, setModalidad] = useState("Efectivo")
  const [monto, setMonto] = useState("")
  const [razon, setRazon] = useState("")
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const amount = Number(monto)
  const saldo = modalidad === "Efectivo" ? caja.efectivo : caja.transferencia

  async function submit(event) {
    event.preventDefault()
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Ingresá un monto mayor a cero.")
      return
    }
    if (tipo === "extraccion" && amount > saldo) {
      setError(`El monto supera el saldo disponible de ${fmt(saldo)}.`)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const result = await registrarMovimientoCaja({
        tipo,
        modalidad,
        monto: amount,
        razon,
      })
      onSaved(result)
      onClose()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo registrar el movimiento.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="caja-editor-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Capital en caja
            </p>
            <h3
              id="caja-editor-title"
              className="text-lg font-semibold text-slate-900"
            >
              Registrar movimiento
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar editor"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="close" cls="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <label className="mb-2 block text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Tipo de movimiento
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {[
                ["ingreso", "Ingreso"],
                ["extraccion", "Extracción"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTipo(value)
                    setError(null)
                  }}
                  className={`rounded-lg py-3 text-sm font-semibold transition-all ${
                    tipo === value
                      ? value === "ingreso"
                        ? "bg-success-500 text-white shadow-sm"
                        : "bg-danger-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Medio
            </label>
            <ModalidadToggle
              value={modalidad}
              onChange={(value) => {
                setModalidad(value)
                setError(null)
              }}
            />
            <p className="mt-1.5 text-[11px] font-mono text-slate-400">
              Saldo actual: {fmt(saldo)}
            </p>
          </div>

          <div>
            <label
              htmlFor="caja-monto"
              className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest text-slate-400"
            >
              Monto (ARS)
            </label>
            <input
              id="caja-monto"
              type="number"
              min="0.01"
              step="0.01"
              required
              autoFocus
              value={monto}
              onChange={(event) => {
                setMonto(event.target.value)
                setError(null)
              }}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xl font-mono font-semibold text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label
              htmlFor="caja-razon"
              className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest text-slate-400"
            >
              Razón{" "}
              <span className="normal-case tracking-normal">(opcional)</span>
            </label>
            <textarea
              id="caja-razon"
              rows={2}
              maxLength={300}
              value={razon}
              onChange={(event) => setRazon(event.target.value)}
              placeholder="Ej: aporte de capital, gastos operativos…"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {error && (
            <p
              className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              tipo === "ingreso"
                ? "bg-success-500 hover:bg-success-600"
                : "bg-danger-600 hover:bg-danger-700"
            }`}
          >
            {saving ? "Registrando…" : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  )
}
