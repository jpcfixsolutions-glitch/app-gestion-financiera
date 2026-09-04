import type { Handler } from "hono"

export const healthController: Handler = (context) =>
  context.json({
    ok: true,
    service: "app-gestion-financiera-backend",
    timestamp: new Date().toISOString(),
  })
