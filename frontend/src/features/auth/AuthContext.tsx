import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import type { ReactNode } from "react"
import type { User } from "@/lib/authService"
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  verifySession,
} from "@/lib/authService"

// ─── Context shape ───────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check existing session on mount and verify with backend
  useEffect(() => {
    let isMounted = true
    async function initAuth() {
      const cached = getCurrentUser()
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

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await authLogin({ username, password })
        if (result.ok && result.user) {
          setUser(result.user)
          setIsLoading(false)
          return true
        }
        setError(result.error ?? "Error de autenticación")
        setIsLoading(false)
        return false
      } catch {
        setError("Error de conexión. Intentá nuevamente.")
        setIsLoading(false)
        return false
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    setUser(null)
    setError(null)
    await authLogout()
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
