import type { MiddlewareHandler } from "hono"

import { verifyAuthToken } from "../services/security.service"
import type { AppBindings } from "../types"

export const requireAuth: MiddlewareHandler<AppBindings> = async (
  context,
  next,
) => {
  const authorization = context.req.header("Authorization")

  if (!authorization?.startsWith("Bearer ")) {
    return context.json(
      { error: "No autorizado. Inicie sesión.", code: "UNAUTHORIZED" },
      401,
    )
  }

  const user = verifyAuthToken(authorization.slice(7).trim())
  if (!user) {
    return context.json(
      { error: "Sesión no válida o expirada", code: "INVALID_SESSION" },
      401,
    )
  }

  context.set("authUser", user)
  await next()
}
