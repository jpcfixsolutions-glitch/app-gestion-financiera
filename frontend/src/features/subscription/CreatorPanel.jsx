import { useState } from "react"
import { useSubscription } from "./SubscriptionContext"

export default function CreatorPanel() {
  const { status, refreshStatus, logout } = useSubscription()
  const [day, setDay] = useState(status.subscriptionDay || 1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  
  const handleConfigure = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/subscription/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ day: Number(day) })
      })
      if (!res.ok) throw new Error("Error al configurar")
      await refreshStatus()
      setMessage({ type: "success", text: "Configuración guardada correctamente." })
    } catch (err) {
      setMessage({ type: "error", text: err.message })
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
      const res = await fetch("/api/subscription/renew", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      if (!res.ok) throw new Error("Error al reactivar")
      await refreshStatus()
      setMessage({ type: "success", text: "Servicio reactivado correctamente." })
    } catch (err) {
      setMessage({ type: "error", text: err.message })
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
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Estado Actual</h2>
            <div className="text-2xl font-semibold text-white">
              {status.state === "UNCONFIGURED" ? "Sin configurar" : 
               status.state === "ACTIVE" ? "Activo" : 
               status.state === "WARNING" ? "Aviso (Por vencer)" : 
               status.state === "EXPIRED" ? "Bloqueado" : "Cargando..."}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Próximo Vencimiento</h2>
            <div className="text-lg font-medium text-slate-200">
              {status.nextExpiry ? new Date(status.nextExpiry).toLocaleString() : "No definido"}
            </div>
            {status.daysRemaining !== null && (
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
              <label className="block text-sm font-medium text-slate-400 mb-1">Día del mes (1 - 31)</label>
              <input 
                type="number" 
                min="1" 
                max="31" 
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
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
