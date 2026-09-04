import type { ErrorRequestHandler, RequestHandler } from "express"

import { AppError } from "../errors/app-error"

export const handleError: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof AppError) {
    response
      .status(error.status)
      .json({ error: error.message, code: error.code })
    return
  }

  if (isJsonSyntaxError(error)) {
    response
      .status(400)
      .json({ error: "El cuerpo JSON no es válido", code: "INVALID_JSON" })
    return
  }

  if (isPayloadTooLargeError(error)) {
    response.status(413).json({
      error: "El cuerpo de la solicitud es demasiado grande",
      code: "BODY_TOO_LARGE",
    })
    return
  }

  console.error("Error inesperado en la API:", error)
  response.status(500).json({
    error: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
  })
}

export const handleNotFound: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Ruta no encontrada", code: "NOT_FOUND" })
}

function isJsonSyntaxError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "body" in error
  )
}

function isPayloadTooLargeError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  )
}
