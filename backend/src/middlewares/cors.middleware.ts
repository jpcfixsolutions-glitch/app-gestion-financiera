import { cors } from "hono/cors"

import { getAllowedOrigins } from "../config/env"

const allowedOrigins = getAllowedOrigins()

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return undefined
    if (isAllowedOrigin(origin)) {
      return origin
    }
    return undefined
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["X-Request-Id"],
  maxAge: 86_400,
})

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
