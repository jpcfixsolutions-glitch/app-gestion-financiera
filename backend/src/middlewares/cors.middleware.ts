import type { RequestHandler } from "express"

import { getAllowedOrigins } from "../config/env"

const allowedOrigins = getAllowedOrigins()

export const corsMiddleware: RequestHandler = (request, response, next) => {
  const origin = request.get("Origin")

  if (origin) {
    response.vary("Origin")
    if (isAllowedOrigin(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin)
    }
  }

  response.set({
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Expose-Headers": "X-Request-Id",
    "Access-Control-Max-Age": "86400",
  })

  if (request.method === "OPTIONS") {
    response.status(204).end()
    return
  }

  next()
}

function isAllowedOrigin(origin: string): boolean {
  const normalizedOrigin = origin.replace(/\/$/, "")
  if (allowedOrigins.has("*") || allowedOrigins.has(normalizedOrigin))
    return true

  return [...allowedOrigins].some((pattern) => {
    const wildcardIndex = pattern.indexOf("*")
    if (
      wildcardIndex === -1 ||
      pattern.indexOf("*", wildcardIndex + 1) !== -1
    ) {
      return false
    }

    return (
      normalizedOrigin.startsWith(pattern.slice(0, wildcardIndex)) &&
      normalizedOrigin.endsWith(pattern.slice(wildcardIndex + 1))
    )
  })
}
