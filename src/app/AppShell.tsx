import type { FinanceStateReturn } from "@/hooks/useFinanceState"
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
  reload,
}: FinanceStateReturn) {
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
          <NuevaOperacion
            state={state}
            setState={setState}
            setView={setView}
            reload={reload}
          />
        )}
        {view === "config" && (
          <Config state={state} setState={setState} reload={reload} />
        )}
        {view === "cliente" && selectedCliente && (
          <DetalleCliente
            cliente={selectedCliente}
            state={state}
            setState={setState}
            setView={setView}
            reload={reload}
          />
        )}
      </main>

      <BottomNav view={view} setView={setView} />
    </div>
  )
}
