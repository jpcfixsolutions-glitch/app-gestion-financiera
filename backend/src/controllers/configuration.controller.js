import { updateReserveLimit } from "../services/configuration.service.js"
export async function updateReserveLimitController(request, response) {
  const result = await updateReserveLimit(
    request.authUser.empresaId,
    request.body,
  )
  response.json({ ok: true, ...result })
}
