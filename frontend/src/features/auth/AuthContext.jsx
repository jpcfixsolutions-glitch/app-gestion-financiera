import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import {
  login as authLogin,
  logout as authLogout,
  verifySession,
} from "@/lib/authService"
import { getStoredUser } from "@/lib/authStorage"
const AuthContext = createContext(null)
// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // Check existing session on mount and verify with backend
  useEffect(() => {
    let isMounted = true
    async function initAuth() {
      const cached = getStoredUser()
      if (cached && isMounted) {
        setUser(cached)
      }
      try {
        const verified = await verifySession()
        if (isMounted) {
          setUser(verified)
        }
      } catch {
        // En caso de error de red transitorio, mantener usuario local
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    initAuth()
    return () => {
      isMounted = false
    }
  }, [])
  useEffect(() => {
    const handleUnauthorized = () => setUser(null)
    window.addEventListener("gf:unauthorized", handleUnauthorized)
    return () =>
      window.removeEventListener("gf:unauthorized", handleUnauthorized)
  }, [])
  const login = useCallback(async (username, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await authLogin({ username, password })
      if (result.ok && result.user) {
        setUser(result.user)
        return true
      }
      setError(result.error ?? "Error de autenticación")
      return false
    } catch {
      setError("Error de conexión. Intentá nuevamente.")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])
  const logout = useCallback(() => {
    authLogout()
    setUser(null)
    setError(null)
  }, [])
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
