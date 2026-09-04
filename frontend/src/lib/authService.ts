import { apiRequest } from "@/lib/apiClient"
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  storeAuthSession,
  type User,
} from "@/lib/authStorage"

export type { User } from "@/lib/authStorage"

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

export { getAuthToken }

export function getCurrentUser(): User | null {
  return getStoredUser()
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  try {
    const data = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password,
      }),
    })

    if (data.token && data.user) {
      storeAuthSession(data.user, data.token)
      return { ok: true, user: data.user, token: data.token }
    }

    return { ok: false, error: "Respuesta inválida del servidor" }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error de conexión con el servidor. Intente nuevamente.",
    }
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getAuthToken()
    if (token) {
      await apiRequest("/auth/logout", {
        method: "POST",
      }).catch(() => {})
    }
  } finally {
    clearAuthSession()
  }
}

/**
 * Verifica la validez del token con el backend.
 */
export async function verifySession(): Promise<User | null> {
  const token = getAuthToken()
  if (!token) {
    clearAuthSession()
    return null
  }

  try {
    const data = await apiRequest<AuthResponse>("/auth/me")
    if (data.ok && data.user) {
      storeAuthSession(data.user)
      return data.user
    }

    return null
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) return null
    // Si hay error temporal de red, conservar usuario en sesión
    return getCurrentUser()
  }
}
