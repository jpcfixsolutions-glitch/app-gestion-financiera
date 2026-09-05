import {
  createOperation,
  registerPayment,
} from "../services/operation.service.js"
import { getRouteParam } from "./request.js"
export async function createOperationController(request, response) {
  const result = await createOperation(
    request.authUser.empresaId,
    request.body,
    request.authUser,
  )
  response.status(201).json({ ok: true, ...result })
}
export async function registerPaymentController(request, response) {
  const result = await registerPayment(
    request.authUser.empresaId,
    getRouteParam(request, "id"),
    request.body,
    request.authUser,
  )
  response.json({ ok: true, ...result })
}
