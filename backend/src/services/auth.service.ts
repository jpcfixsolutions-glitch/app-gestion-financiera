import { eq } from "drizzle-orm"

import { AppError } from "../errors/app-error"
import { db } from "../models/database"
import { usuarios } from "../models/schema"
import type { AuthTokenPayload } from "../types"
import { signAuthToken, verifyPassword } from "./security.service"
import { requireRecord, requireString } from "./validation.service"

export interface PublicUser {
  id: string
  username: string
  displayName: string
  empresaId: string
}

export async function login(value: unknown) {
  const body = requireRecord(value)
  const username = requireString(body.username, "username", {
    max: 80,
  }).toLowerCase()
  const password = requireString(body.password, "password", { max: 200 })

  const [user] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.username, username))
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

export function getCurrentUser(payload: AuthTokenPayload): PublicUser {
  return toPublicUser(payload)
}

function toPublicUser(user: {
  id?: string
  sub?: string
  username: string
  name: string
  empresaId: string
}): PublicUser {
  return {
    id: user.id ?? user.sub ?? "",
    username: user.username,
    displayName: user.name,
    empresaId: user.empresaId,
  }
}
