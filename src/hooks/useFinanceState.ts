import { useState, useCallback, useEffect } from "react";
import type { AppState, View } from "@/domain/finance/types";
import { fetchAppState } from "@/lib/api";
import { INITIAL_STATE } from "@/data/demo-state";

export interface FinanceStateReturn {
  state: AppState;
  setState: (fn: (prev: AppState) => AppState) => void;
  view: View;
  setView: (v: View) => void;
  selectedClienteId: string | null;
  setSelectedCliente: (id: string) => void;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useFinanceState(): FinanceStateReturn {
  const [state, setStateRaw] = useState<AppState>(INITIAL_STATE);
  const [view, setView] = useState<View>("dashboard");
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAppState();
      setStateRaw(data);
    } catch (err) {
      console.error("Failed to load state from API, using demo data:", err);
      setError(err instanceof Error ? err.message : "Error de conexión");
      // Keep current state (falls back to INITIAL_STATE on first load)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const setState = useCallback(
    (fn: (prev: AppState) => AppState) => {
      setStateRaw(fn);
    },
    [],
  );

  const setSelectedCliente = useCallback((id: string) => {
    setSelectedClienteId(id);
  }, []);

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
  };
}
