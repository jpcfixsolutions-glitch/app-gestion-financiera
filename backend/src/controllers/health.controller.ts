import type { Request, Response } from "express"

export function healthController(_request: Request, response: Response): void {
  response.json({
    ok: true,
    service: "app-gestion-financiera-backend",
    timestamp: new Date().toISOString(),
  })
}
