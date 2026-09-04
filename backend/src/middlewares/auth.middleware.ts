import type { RequestHandler } from "express"

import { verifyAuthToken } from "../services/security.service"

export const requireAuth: RequestHandler = (request, response, next) => {
  const authorization = request.get("Authorization")

  if (!authorization?.startsWith("Bearer ")) {
    response
      .status(401)
      .json({ error: "No autorizado. Inicie sesión.", code: "UNAUTHORIZED" })
    return
  }

  const user = verifyAuthToken(authorization.slice(7).trim())
  if (!user) {
    response.status(401).json({
      error: "Sesión no válida o expirada",
      code: "INVALID_SESSION",
    })
    return
  }

  request.authUser = user
  next()
}
