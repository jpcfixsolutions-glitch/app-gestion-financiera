export interface User {
  id: string
  username: string
  displayName: string
  empresaId?: string
}

const SESSION_KEY = "gf_auth_session"
const TOKEN_KEY = "gf_auth_token"

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) as User : null
  } catch {
    clearAuthSession()
    return null
  }
}

export function storeAuthSession(user: User, token?: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}
