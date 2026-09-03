import { useState, useCallback, useEffect } from "react"
import type { AppState, View } from "@/domain/finance/types"
import { fetchAppState } from "@/lib/api"

const EMPTY_FINANCE_STATE: AppState = {
  caja: { efectivo: 0, transferencia: 0 },
  activo: { efectivo: 0, transferencia: 0 },
  limiteReserva: 0,
  planes: [],
  clientes: [],
}

export interface FinanceStateReturn {
  state: AppState
  setState: (fn: (prev: AppState) => AppState) => void
  view: View
  setView: (v: View) => void
  selectedClienteId: string | null
  setSelectedCliente: (id: string) => void
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useFinanceState(): FinanceStateReturn {
  const [state, setStateRaw] = useState<AppState>(EMPTY_FINANCE_STATE)
  const [view, setView] = useState<View>("dashboard")
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const setState = useCallback((fn: (prev: AppState) => AppState) => {
    setStateRaw(fn)
  }, [])

  const setSelectedCliente = useCallback((id: string) => {
    setSelectedClienteId(id)
  }, [])

  return {
    state,
    setState,
    view,
    setView,
    selectedClienteId,
    setSelectedCliente,
    loading,
    error,
    reload,
  }
}
