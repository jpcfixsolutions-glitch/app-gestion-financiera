import crypto from "node:crypto"

/**
 * Hash de contraseña seguro usando PBKDF2 con SHA-512 y sal criptográfica aleatoria de 16 bytes.
 * Estándar recomendado por OWASP para almacenamiento de contraseñas.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
    .toString("hex")
  return `${salt}:${hash}`
}

/**
 * Verificación de contraseña contra hash almacenado usando comparación en tiempo constante
 * para prevenir ataques de temporización (timing attacks).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":")
    if (parts.length !== 2) return false
    const [salt, originalHash] = parts
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
      .toString("hex")
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(originalHash, "hex"),
    )
  } catch {
    return false
  }
}

export interface AuthTokenPayload {
  sub: string
  username: string
  name: string
  empresaId: string
  rol: string
  exp: number
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️ ADVERTENCIA: AUTH_SECRET no está configurada en producción.",
      )
    }
    return "gf_internal_dev_secret_key_32_chars_long_min"
  }
  return secret
}

/**
 * Genera un token firmado con HMAC-SHA256 (sin estado, seguro para funciones serverless).
 */
export function signAuthToken(
  payload: Omit<AuthTokenPayload, "exp">,
  expiresInDays = 7,
): string {
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  }
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest("base64url")
  return `${data}.${signature}`
}

/**
 * Valida un token firmado y retorna el payload o null si es inválido o ha expirado.
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 2) return null
    const [data, signature] = parts

    const expectedSignature = crypto
      .createHmac("sha256", getAuthSecret())
      .update(data)
      .digest("base64url")
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      return null
    }

    const payload: AuthTokenPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8"),
    )
    if (Date.now() > payload.exp) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
