import {
  registerCashMovement,
  updateReserveLimit,
} from "../services/configuration.service.js"
export async function updateReserveLimitController(request, response) {
  const result = await updateReserveLimit(
    request.authUser.empresaId,
    request.body,
    request.authUser,
  )
  response.json({ ok: true, ...result })
}
export async function registerCashMovementController(request, response) {
  const result = await registerCashMovement(
    request.authUser.empresaId,
    request.body,
    request.authUser,
  )
  response.status(201).json({ ok: true, ...result })
}
