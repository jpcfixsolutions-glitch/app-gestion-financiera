import type { Request } from "express"

export function getRouteParam(request: Request, name: string): string {
  const value = request.params[name]
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}
