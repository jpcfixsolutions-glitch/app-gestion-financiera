import crypto from "node:crypto"
import { promisify } from "node:util"
import { getAuthSecret } from "../config/env.js"
const pbkdf2 = promisify(crypto.pbkdf2)
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_KEY_LENGTH = 64
const AUTH_SECRET = getAuthSecret()
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = await pbkdf2(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    "sha512",
  )
  return `${salt}:${derivedKey.toString("hex")}`
}
export async function verifyPassword(password, storedHash) {
  try {
    const [salt, originalHash, extra] = storedHash.split(":")
    if (!salt || !originalHash || extra) return false
    const computedHash = await pbkdf2(
      password,
      salt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEY_LENGTH,
      "sha512",
    )
    const originalBuffer = Buffer.from(originalHash, "hex")
    return (
      originalBuffer.length === computedHash.length &&
      crypto.timingSafeEqual(computedHash, originalBuffer)
    )
  } catch {
    return false
  }
}
export function signAuthToken(payload, expiresInDays = 7) {
  const fullPayload = {
    ...payload,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  }
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(data)
    .digest("base64url")
  return `${data}.${signature}`
}
export function verifyAuthToken(token) {
  try {
    const [data, signature, extra] = token.split(".")
    if (!data || !signature || extra) return null
    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(data)
      .digest("base64url")
    const actualBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null
    }
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"))
    if (
      !payload.sub ||
      !payload.empresaId ||
      !Number.isFinite(payload.exp) ||
      Date.now() > payload.exp
    ) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
