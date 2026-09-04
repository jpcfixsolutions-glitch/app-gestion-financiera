import { sql } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { usuarios } from "../models/schema.js"
import { signAuthToken, verifyPassword } from "./security.service.js"
import { requireRecord, requireString } from "./validation.service.js"
export async function login(value) {
  const body = requireRecord(value)
  const username = requireString(body.username, "username", {
    max: 80,
  })
  const normalizedUsername = username.toLowerCase()
  const password = requireString(body.password, "password", { max: 200 })
  const [user] = await db
    .select()
    .from(usuarios)
    .where(sql`lower(${usuarios.username}) = ${normalizedUsername}`)
    .limit(1)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(
      "Usuario o contraseña incorrectos",
      401,
      "INVALID_CREDENTIALS",
    )
  }
  const token = signAuthToken({
    sub: user.id,
    username: user.username,
    name: user.nombre,
    empresaId: user.empresaId,
    rol: user.rol,
  })
  return {
    token,
    user: toPublicUser({
      id: user.id,
      username: user.username,
      name: user.nombre,
      empresaId: user.empresaId,
    }),
  }
}
export function getCurrentUser(payload) {
  return toPublicUser(payload)
}
function toPublicUser(user) {
  return {
    id: user.id ?? user.sub ?? "",
    username: user.username,
    displayName: user.name,
    empresaId: user.empresaId,
  }
}
