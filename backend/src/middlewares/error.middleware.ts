import type { ErrorHandler, NotFoundHandler } from "hono"

import { AppError } from "../errors/app-error"
import type { AppBindings } from "../types"

export const handleError: ErrorHandler<AppBindings> = (error, context) => {
  if (error instanceof AppError) {
    return context.json(
      { error: error.message, code: error.code },
      error.status,
    )
  }

  console.error("Error inesperado en la API:", error)
  return context.json(
    { error: "Error interno del servidor", code: "INTERNAL_SERVER_ERROR" },
    500,
  )
}

export const handleNotFound: NotFoundHandler = (context) =>
  context.json({ error: "Ruta no encontrada", code: "NOT_FOUND" }, 404)
