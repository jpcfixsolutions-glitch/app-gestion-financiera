import { useSubscription } from "./SubscriptionContext"
import { useEffect, useState } from "react"

export default function SubscriptionGate({ children }) {
  const { status, user, logout, error, refreshStatus } = useSubscription()
  const [isWarningMinimized, setIsWarningMinimized] = useState(false)

  useEffect(() => {
    setIsWarningMinimized(false)
  }, [status.state, status.daysRemaining])

  // Internal user bypasses everything
  if (user?.rol === "creator") {
    return <>{children}</>
  }

  if (status.state === "UNKNOWN") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950 p-4">
        <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <h2 className="text-xl font-bold text-white">Verificando suscripción</h2>
          <p className="mt-3 text-sm text-slate-300">
            {error ? "No se pudo comprobar el estado del servicio." : "Esperá un momento mientras verificamos el acceso."}
          </p>
          {error && (
            <button onClick={refreshStatus} className="mt-6 rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-600">
              Reintentar
            </button>
          )}
        </div>
      </div>
    )
  }

  // Render Expired overlay on top of children (or instead of children)
  if (status.state === "EXPIRED") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950 p-4">
        <div className="max-w-md w-full bg-slate-900 border border-brand-800 rounded-xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10a2 2 0 100-4 2 2 0 000 4zm0 4a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Suscripción Vencida</h2>
          <p className="text-slate-300 mb-8">
            El servicio ha sido suspendido temporalmente por vencimiento de la suscripción. 
            Por favor, contacte a su proveedor para reactivar el sistema.
          </p>
          <button
            onClick={logout}
            className="w-full bg-brand-700 hover:bg-brand-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {status.state === "WARNING" && !isWarningMinimized && (
        <div
          className={`${status.daysRemaining <= 2 ? "border-red-300 bg-red-100 text-red-950" : "border-orange-300 bg-orange-100 text-orange-950"} relative z-40 flex items-center justify-between border-b px-4 py-3`}
          role="status"
        >
          <div className="flex items-center space-x-3">
            <svg className={`${status.daysRemaining <= 2 ? "text-red-700" : "text-orange-700"} h-5 w-5 shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Aviso de suscripción: {status.daysRemaining === 0 ? "vence hoy" : status.daysRemaining === 1 ? "vence mañana" : `vence en ${status.daysRemaining} días`} · {new Date(status.nextExpiry).toLocaleDateString("es-AR", { dateStyle: "long" })}</span>
          </div>
          <button 
            onClick={() => setIsWarningMinimized(true)}
            className={`${status.daysRemaining <= 2 ? "text-red-800 hover:bg-red-200" : "text-orange-800 hover:bg-orange-200"} rounded p-1 transition-colors`}
            aria-label="Minimizar aviso de suscripción"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {status.state === "WARNING" && isWarningMinimized && (
        <button 
          onClick={() => setIsWarningMinimized(false)}
          className="fixed bottom-4 right-4 z-40 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium">Suscripción por vencer</span>
        </button>
      )}

      {children}
    </>
  )
}
