import { useMemo, useState } from "react"
import { formatCurrency as fmt } from "@/domain/finance/formatters"
import { estadoConfig } from "@/domain/finance/status"
import {
  initialsFrom,
  peorEstadoCliente,
  totalPorModalidad,
} from "@/domain/finance/calculations"
import { editarCliente } from "@/lib/api"
import Icon from "@/components/ui/Icon"

const PAGE_SIZE = 8

function validateClient(client) {
  const errors = {}
  if (!/^[\p{L}\p{M}]+(?:[ '\-’][\p{L}\p{M}]+)*$/u.test(client.nombre.trim())) {
    errors.nombre = "Usá solo letras, espacios, apóstrofes o guiones."
  }
  const dniDigits = client.dni.replace(/\D/g, "")
  if (!/^[\d.\s-]+$/.test(client.dni.trim()) || !/^\d{7,8}$/.test(dniDigits)) {
    errors.dni = "Ingresá un DNI válido de 7 u 8 dígitos."
  }
  const phoneDigits = client.telefono.replace(/\D/g, "")
  if (
    !/^\+?[\d\s()-]+$/.test(client.telefono.trim()) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15
  ) {
    errors.telefono = "Ingresá un teléfono válido de 8 a 15 dígitos."
  }
  return errors
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs font-mono text-slate-400">
        Página {page} de {pages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

function ClientEditFlow({ client, onClose, onSaved }) {
  const [confirmed, setConfirmed] = useState(false)
  const [data, setData] = useState({
    nombre: client.nombre,
    dni: client.dni,
    telefono: client.telefono,
    direccion: client.direccion,
  })
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState(null)
  const [saving, setSaving] = useState(false)

  function updateField(field, value) {
    setData((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }
  async function save(event) {
    event.preventDefault()
    const validation = validateClient(data)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return
    setSaving(true)
    setRequestError(null)
    try {
      const result = await editarCliente(client.id, data)
      onSaved(result)
      onClose()
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los cambios.",
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
      aria-labelledby="client-editor-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      {!confirmed ? (
        <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Icon name="edit" cls="h-5 w-5" />
          </div>
          <h3
            id="client-editor-title"
            className="text-center text-lg font-semibold text-slate-900"
          >
            ¿Editar este cliente?
          </h3>
          <p className="mt-2 text-center text-sm text-slate-500">
            Vas a modificar los datos de <strong>{client.nombre}</strong>.
            ¿Querés continuar?
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setConfirmed(true)}
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Sí, editar
            </button>
          </div>
        </div>
      ) : (
        <form
          className="w-full max-w-lg rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          onSubmit={save}
        >
          <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Cartera de clientes
              </p>
              <h3
                id="client-editor-title"
                className="text-lg font-semibold text-slate-900"
              >
                Editar cliente
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar editor"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon name="close" cls="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4 px-5 py-5">
            {[
              ["nombre", "Nombre completo", "text", "Ej: Ana Pérez"],
              ["dni", "DNI", "text", "Ej: 30.123.456"],
              ["telefono", "Teléfono", "tel", "+54 11 XXXX-XXXX"],
              ["direccion", "Dirección", "text", "Calle, número, localidad"],
            ].map(([field, label, type, placeholder]) => (
              <div key={field}>
                <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  {label}
                  {field !== "direccion" && (
                    <span className="text-danger-600"> *</span>
                  )}
                </label>
                <input
                  type={type}
                  inputMode={field === "dni" ? "numeric" : undefined}
                  value={data[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  placeholder={placeholder}
                  aria-invalid={Boolean(errors[field])}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                    errors[field]
                      ? "border-danger-600 focus:ring-danger-600"
                      : "border-slate-200 focus:ring-brand-400"
                  }`}
                />
                {errors[field] && (
                  <p className="mt-1.5 text-xs text-danger-600">
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
            {requestError && (
              <p
                className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700"
                role="alert"
              >
                {requestError}
              </p>
            )}
          </div>
          <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function Cartera({
  clientes,
  setState,
  setView,
  setSelectedCliente,
}) {
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [editingClient, setEditingClient] = useState(null)
  const filtered = useMemo(
    () =>
      clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q.toLowerCase()) || c.dni.includes(q),
      ),
    [clientes, q],
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages)
  const visibleClients = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
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
          onChange={(event) => {
            setQ(event.target.value)
            setPage(1)
          }}
          className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        {visibleClients.map((client) => {
          const peorEstado = peorEstadoCliente(client.operaciones)
          const cfg = estadoConfig[peorEstado]
          const totalEfectivo = totalPorModalidad(
            client.operaciones,
            "Efectivo",
          )
          const totalTransf = totalPorModalidad(
            client.operaciones,
            "Transferencia",
          )
          return (
            <div
              key={client.id}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 transition-all hover:border-brand-300 hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedCliente(client.id)
                  setView("cliente")
                }}
                className="flex min-w-0 flex-1 items-center gap-4 p-2 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <span className="text-sm font-semibold text-brand-700">
                    {initialsFrom(client.nombre)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {client.nombre}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    {client.dni}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {totalEfectivo > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-400">
                        <Icon name="cash" cls="w-3 h-3" /> {fmt(totalEfectivo)}
                      </span>
                    )}
                    {totalTransf > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-400">
                        <Icon name="transfer" cls="w-3 h-3" />{" "}
                        {fmt(totalTransf)}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setEditingClient(client)}
                aria-label={`Editar cliente ${client.nombre}`}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <Icon name="edit" cls="h-4 w-4" />
              </button>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 py-12 text-center text-slate-400">
            <Icon
              name="users"
              cls="mx-auto h-10 w-10 text-slate-400 opacity-30"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">
                {q
                  ? `Sin resultados para "${q}"`
                  : "No hay clientes registrados en la cartera"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {q
                  ? "Probá buscando con otro nombre o DNI"
                  : "Iniciá registrando una nueva operación de financiamiento"}
              </p>
            </div>
            {!q && (
              <button
                onClick={() => setView("operacion")}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <Icon name="plus" cls="h-3.5 w-3.5" /> Nueva Operación
              </button>
            )}
          </div>
        )}
      </div>

      <Pagination page={currentPage} pages={pages} onChange={setPage} />

      {editingClient && (
        <ClientEditFlow
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSaved={(result) =>
            setState((previous) => ({
              ...previous,
              clientes: previous.clientes.map((client) =>
                client.id === result.cliente.id
                  ? { ...client, ...result.cliente }
                  : client,
              ),
              actividad: [
                ...[...(result.actividades ?? [])].reverse(),
                ...previous.actividad,
              ],
            }))
          }
        />
      )}
    </div>
  )
}
