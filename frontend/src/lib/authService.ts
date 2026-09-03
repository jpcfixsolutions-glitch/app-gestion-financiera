import { getApiUrl } from "@/lib/apiConfig"

export interface User {
  id: string
  username: string
  displayName: string
  empresaId?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  ok: boolean
  user?: User
  token?: string
  error?: string
}

const SESSION_KEY = "gf_auth_session"
const TOKEN_KEY = "gf_auth_token"

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    return null
  }
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  try {
    const res = await fetch(getApiUrl("/auth/login"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password,
      }),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        error: data?.error || "Usuario o contraseña incorrectos",
      }
    }

    if (data.token && data.user) {
      sessionStorage.setItem(TOKEN_KEY, data.token)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
      return { ok: true, user: data.user, token: data.token }
    }

    return { ok: false, error: "Respuesta inválida del servidor" }
  } catch (err) {
    console.error("Error al conectar con el servicio de autenticación:", err)
    return {
      ok: false,
      error: "Error de conexión con el servidor. Intente nuevamente.",
    }
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getAuthToken()
    if (token) {
      await fetch(getApiUrl("/auth/logout"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {})
    }
  } finally {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Verifica la validez del token con el backend.
 */
export async function verifySession(): Promise<User | null> {
  const token = getAuthToken()
  if (!token) {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }

  try {
    const res = await fetch(getApiUrl("/auth/me"), {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      return null
    }

    const data = await res.json()
    if (data.ok && data.user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
      return data.user
    }

    return null
  } catch {
    // Si hay error temporal de red, conservar usuario en sesión
    return getCurrentUser()
  }
}
