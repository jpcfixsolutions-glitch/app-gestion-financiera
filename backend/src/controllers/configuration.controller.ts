import type { Handler } from "hono"

import { updateReserveLimit } from "../services/configuration.service"
import type { AppBindings } from "../types"
import { readJsonBody } from "./request"

export const updateReserveLimitController: Handler<AppBindings> = async (
  context,
) => {
  const result = await updateReserveLimit(
    context.get("authUser").empresaId,
    await readJsonBody(context),
  )
  return context.json({ ok: true, ...result })
}
