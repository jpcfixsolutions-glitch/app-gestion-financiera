import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { apiRequest } from "@/lib/apiClient"
import { useAuth } from "../auth/AuthContext"

const SubscriptionContext = createContext(null)

const INITIAL_STATUS = {
  state: "UNKNOWN",
  isConfigured: false,
  subscriptionDay: null,
  nextExpiry: null,
  isExpired: false,
  isWarning: false,
  daysRemaining: null,
}

function toSubscriptionState(data) {
  if (typeof data?.isConfigured !== "boolean") {
    throw new Error("La respuesta de suscripción no es válida. Intentá nuevamente.")
  }
  const status = { ...INITIAL_STATUS, ...data }
  if (!status.isConfigured) return { ...status, state: "UNCONFIGURED" }
  if (status.isExpired) return { ...status, state: "EXPIRED" }
  return { ...status, state: status.isWarning ? "WARNING" : "ACTIVE" }
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider")
  return context
}

export function SubscriptionProvider({ children }) {
  const { isAuthenticated, user, logout } = useAuth()
  const [status, setStatus] = useState(INITIAL_STATUS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshStatus = useCallback(async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    setError(null)
    try {
      const nextStatus = toSubscriptionState(await apiRequest("/subscription/status"))
      setStatus(nextStatus)
      return nextStatus
    } catch (requestError) {
      setError(requestError)
      setStatus(INITIAL_STATUS)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const saveSubscription = useCallback(async (path, body) => {
    const nextStatus = toSubscriptionState(await apiRequest(path, {
      method: "POST",
      ...(body ? { body: JSON.stringify(body) } : {}),
    }))
    setStatus(nextStatus)
    setError(null)
    return nextStatus
  }, [])

  const configureSubscription = useCallback(
    (day) => saveSubscription("/subscription/configure", { day }),
    [saveSubscription],
  )
  const renewSubscription = useCallback(
    () => saveSubscription("/subscription/renew"),
    [saveSubscription],
  )

  useEffect(() => {
    if (!isAuthenticated) return undefined
    refreshStatus()
    const interval = window.setInterval(refreshStatus, 60_000)
    const onReconnect = () => refreshStatus()
    window.addEventListener("focus", onReconnect)
    window.addEventListener("online", onReconnect)
    window.addEventListener("gf:subscription_expired", onReconnect)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", onReconnect)
      window.removeEventListener("online", onReconnect)
      window.removeEventListener("gf:subscription_expired", onReconnect)
    }
  }, [isAuthenticated, refreshStatus])

  return (
    <SubscriptionContext.Provider value={{ status, isLoading, error, refreshStatus, configureSubscription, renewSubscription, logout, user }}>
      {children}
    </SubscriptionContext.Provider>
  )
}
