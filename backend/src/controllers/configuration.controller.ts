import type { Request, Response } from "express"

import { updateReserveLimit } from "../services/configuration.service"

export async function updateReserveLimitController(
  request: Request,
  response: Response,
): Promise<void> {
  const result = await updateReserveLimit(
    request.authUser!.empresaId,
    request.body,
  )
  response.json({ ok: true, ...result })
}
