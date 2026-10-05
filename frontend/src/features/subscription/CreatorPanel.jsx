import { useEffect, useState } from "react"
import { useSubscription } from "./SubscriptionContext"

export default function CreatorPanel() {
  const { status, isLoading, error, refreshStatus, configureSubscription, renewSubscription, logout } = useSubscription()
  const [day, setDay] = useState(status.subscriptionDay || 1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (status.subscriptionDay) setDay(status.subscriptionDay)
  }, [status.subscriptionDay])
  
  const handleConfigure = async (e) => {
    e.preventDefault()
    const selectedDay = Number(day)
    if (!Number.isInteger(selectedDay) || selectedDay < 1 || selectedDay > 31) {
      setMessage({ type: "error", text: "Elegí un día entero entre 1 y 31." })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await configureSubscription(selectedDay)
      setMessage({ type: "success", text: "Configuración guardada correctamente." })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "No se pudo guardar la configuración." })
    } finally {
      setLoading(false)
    }
  }

  const handleRenew = async () => {
    if (!window.confirm("¿Estás seguro de que deseas reactivar el servicio y calcular un nuevo vencimiento?")) {
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await renewSubscription()
      setMessage({ type: "success", text: "Servicio reactivado correctamente." })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "No se pudo reactivar el servicio." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-200 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Panel de Suscripción (Creador)</h1>
          <button onClick={logout} className="text-brand-400 hover:text-brand-300 transition-colors">
            Cerrar Sesión
          </button>
        </div>

        {message && (
          <div role="status" className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg bg-red-900/30 p-4 text-red-400">
            <p>No se pudo consultar la suscripción: {error.message}</p>
            <button onClick={refreshStatus} disabled={isLoading} className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-white disabled:opacity-50">
              {isLoading ? "Consultando..." : "Reintentar"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Estado Actual</h2>
            <div className="text-2xl font-semibold text-white">
              {status.state === "UNCONFIGURED" ? "Sin configurar" : 
               status.state === "ACTIVE" ? "Activo" : 
               status.state === "WARNING" ? "Aviso (Por vencer)" : 
               status.state === "EXPIRED" ? "Bloqueado" : error ? "No disponible" : "Cargando..."}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Próximo Vencimiento</h2>
            <div className="text-lg font-medium text-slate-200">
              {status.nextExpiry ? new Date(status.nextExpiry).toLocaleString() : "No definido"}
            </div>
            {Number.isInteger(status.daysRemaining) && (
              <div className="text-sm text-slate-500 mt-1">
                {status.isExpired ? "Vencido" : `Faltan ${status.daysRemaining} días`}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Configurar Corte Mensual</h2>
          <form onSubmit={handleConfigure} className="space-y-4">
            <div>
              <label htmlFor="subscription-day" className="block text-sm font-medium text-slate-400 mb-1">Día del mes (1 - 31)</label>
              <input 
                id="subscription-day"
                type="number" 
                min="1" 
                max="31" 
                step="1"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || status.state === "UNKNOWN"}
              className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Configuración"}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Reactivar Servicio</h2>
          <p className="text-slate-400 text-sm">
            Esta opción recalcula el próximo vencimiento según el día configurado. Solo disponible si el servicio está vencido.
          </p>
          <button 
            onClick={handleRenew}
            disabled={status.state !== "EXPIRED" || loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Reactivar Servicio"}
          </button>
        </div>
      </div>
    </div>
  )
}
