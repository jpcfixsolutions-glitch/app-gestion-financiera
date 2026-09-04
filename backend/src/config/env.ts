const DEFAULT_LOCAL_DATABASE_URL = "file:local.db"
const DEFAULT_LOCAL_AUTH_SECRET = "gf_internal_dev_secret_key_32_chars_long_min"
const DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:8443",
  "http://127.0.0.1:8443",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]
const DEFAULT_PRODUCTION_ORIGINS = [
  "https://mis-finanzas-ipc.vercel.app",
  "https://mis-finanzas-app-backend.vercel.app",
]

function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

function requiredInProduction(name: string, fallback: string): string {
  const value = process.env[name]?.trim()
  if (value) return value

  if (isProduction()) {
    throw new Error(`${name} debe estar configurada en producción`)
  }

  return fallback
}

export function getDatabaseConfig() {
  const url = requiredInProduction(
    "TURSO_DATABASE_URL",
    DEFAULT_LOCAL_DATABASE_URL,
  )
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined

  if (isProduction() && !url.startsWith("file:") && !authToken) {
    throw new Error("TURSO_AUTH_TOKEN debe estar configurada en producción")
  }

  return { url, authToken }
}

export function getAuthSecret(): string {
  const secret = requiredInProduction("AUTH_SECRET", DEFAULT_LOCAL_AUTH_SECRET)
  if (isProduction() && secret.length < 32) {
    throw new Error(
      "AUTH_SECRET debe tener al menos 32 caracteres en producción",
    )
  }
  return secret
}

export function getAllowedOrigins(): Set<string> {
  const configuredOrigins = (
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    ""
  )
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)

  const defaultOrigins = isProduction()
    ? DEFAULT_PRODUCTION_ORIGINS
    : DEFAULT_LOCAL_ORIGINS

  return new Set([...defaultOrigins, ...configuredOrigins])
}

export function getInitialUserPassword(): string {
  return requiredInProduction(
    "INITIAL_USER_PASSWORD",
    "CAMBIAR_POR_CONTRASEÑA_SEGURA",
  )
}
