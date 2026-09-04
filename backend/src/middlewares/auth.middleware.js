import { verifyAuthToken } from "../services/security.service.js"
export const requireAuth = (request, response, next) => {
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
