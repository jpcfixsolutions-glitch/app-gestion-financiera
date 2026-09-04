import type { Handler } from "hono"

import { createOperation, registerPayment } from "../services/operation.service"
import type { AppBindings } from "../types"
import { readJsonBody } from "./request"

export const createOperationController: Handler<AppBindings> = async (
  context,
) => {
  const result = await createOperation(
    context.get("authUser").empresaId,
    await readJsonBody(context),
  )
  return context.json({ ok: true, ...result }, 201)
}

export const registerPaymentController: Handler<AppBindings> = async (
  context,
) => {
  const result = await registerPayment(
    context.get("authUser").empresaId,
    context.req.param("id") ?? "",
    await readJsonBody(context),
  )
  return context.json({ ok: true, ...result })
}
