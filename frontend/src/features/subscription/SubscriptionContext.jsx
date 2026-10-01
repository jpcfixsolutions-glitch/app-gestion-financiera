import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "../auth/AuthContext"

const SubscriptionContext = createContext(null)

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}

export function SubscriptionProvider({ children }) {
  const { isAuthenticated, user, logout } = useAuth()
  const [status, setStatus] = useState({ state: "UNKNOWN" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/subscription/status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      if (!response.ok) {
        throw new Error("Error fetching subscription status")
      }
      const data = await response.json()
      
      // Determine state based on the payload
      let state = "UNCONFIGURED"
      if (data.isConfigured) {
        if (data.isExpired) state = "EXPIRED"
        else if (data.isWarning) state = "WARNING"
        else state = "ACTIVE"
      }
      
      setStatus({ ...data, state })
    } catch (err) {
      console.error(err)
      setError(err)
      setStatus({ state: "UNKNOWN" })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchStatus()

    // Refresh every 60s
    const interval = setInterval(fetchStatus, 60000)
    
    // Refresh on focus
    const onFocus = () => fetchStatus()
    window.addEventListener("focus", onFocus)
    
    // Refresh on subscription expiration event
    const onSubExpired = () => fetchStatus()
    window.addEventListener("gf:subscription_expired", onSubExpired)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("gf:subscription_expired", onSubExpired)
    }
  }, [fetchStatus])

  // Optional: Global fetch interceptor to catch 402 SUBSCRIPTION_EXPIRED
  // We can do this in the app's api client if it exists, or provide a function to handle errors
  const handleApiError = useCallback((errorPayload) => {
    if (errorPayload?.code === "SUBSCRIPTION_EXPIRED") {
      fetchStatus()
    }
  }, [fetchStatus])

  return (
    <SubscriptionContext.Provider value={{ status, isLoading, error, refreshStatus: fetchStatus, handleApiError, logout, user }}>
      {children}
    </SubscriptionContext.Provider>
  )
}
