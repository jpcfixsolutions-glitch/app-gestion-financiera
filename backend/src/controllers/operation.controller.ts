import type { Request, Response } from "express"

import { createOperation, registerPayment } from "../services/operation.service"
import { getRouteParam } from "./request"

export async function createOperationController(
  request: Request,
  response: Response,
): Promise<void> {
  const result = await createOperation(
    request.authUser!.empresaId,
    request.body,
  )
  response.status(201).json({ ok: true, ...result })
}

export async function registerPaymentController(
  request: Request,
  response: Response,
): Promise<void> {
  const result = await registerPayment(
    request.authUser!.empresaId,
    getRouteParam(request, "id"),
    request.body,
  )
  response.json({ ok: true, ...result })
}
