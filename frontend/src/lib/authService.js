import { apiRequest } from "@/lib/apiClient"
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  storeAuthSession,
} from "@/lib/authStorage"
export async function login(credentials) {
  try {
    const data = await apiRequest("/auth/login", {
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
export function logout() {
  clearAuthSession()
}
/**
 * Verifica la validez del token con el backend.
 */
export async function verifySession() {
  const token = getAuthToken()
  if (!token) {
    clearAuthSession()
    return null
  }
  try {
    const data = await apiRequest("/auth/me")
    if (data.ok && data.user) {
      storeAuthSession(data.user)
      return data.user
    }
    return null
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) return null
    // Si hay error temporal de red, conservar usuario en sesión
    return getStoredUser()
  }
}
