import { useState, useCallback, useEffect } from "react"
import { fetchAppState } from "@/lib/api"
const EMPTY_FINANCE_STATE = {
  caja: { efectivo: 0, transferencia: 0 },
  activo: { efectivo: 0, transferencia: 0 },
  limiteReserva: 0,
  planes: [],
  clientes: [],
}
export function useFinanceState() {
  const [state, setStateRaw] = useState(EMPTY_FINANCE_STATE)
  const [view, setView] = useState("dashboard")
  const [selectedClienteId, setSelectedClienteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const reload = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchAppState()
      setStateRaw(data)
    } catch (err) {
      console.error("Error al cargar datos reales de la API:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Error de conexión al cargar datos",
      )
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    reload()
  }, [reload])
  return {
    state,
    setState: setStateRaw,
    view,
    setView,
    selectedClienteId,
    setSelectedCliente: setSelectedClienteId,
    loading,
    error,
    reload,
  }
}
