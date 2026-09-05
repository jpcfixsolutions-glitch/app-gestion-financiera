import Sidebar from "@/components/layout/Sidebar"
import BottomNav from "@/components/layout/BottomNav"
import TopBar from "@/components/layout/TopBar"
import Dashboard from "@/features/dashboard/Dashboard"
import Cartera from "@/features/clientes/Cartera"
import DetalleCliente from "@/features/clientes/DetalleCliente"
import NuevaOperacion from "@/features/operaciones/NuevaOperacion"
import Config from "@/features/configuracion/Config"
export default function AppShell({
  state,
  setState,
  view,
  setView,
  selectedClienteId,
  setSelectedCliente,
  loading,
  error,
  reload,
}) {
  const selectedCliente =
    state.clientes.find((c) => c.id === selectedClienteId) || null
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-mono">Cargando datos…</p>
        </div>
      </div>
    )
  }
  if (error && state.clientes.length === 0 && state.planes.length === 0) {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Error de conexión
            </h3>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={reload}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-full bg-slate-50 flex font-sans">
      <Sidebar view={view} setView={setView} />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <TopBar
          caja={state.caja}
          limiteReserva={state.limiteReserva}
          onNuevaOperacion={() => setView("operacion")}
        />

        {view === "dashboard" && (
          <Dashboard
            state={state}
            setState={setState}
            setView={setView}
            setSelectedCliente={setSelectedCliente}
          />
        )}
        {view === "cartera" && (
          <Cartera
            clientes={state.clientes}
            setView={setView}
            setSelectedCliente={setSelectedCliente}
          />
        )}
        {view === "operacion" && (
          <NuevaOperacion state={state} setState={setState} setView={setView} />
        )}
        {view === "config" && <Config state={state} setState={setState} />}
        {view === "cliente" && selectedCliente && (
          <DetalleCliente
            cliente={selectedCliente}
            setState={setState}
            setView={setView}
          />
        )}
      </main>

      <BottomNav view={view} setView={setView} />
    </div>
  )
}
