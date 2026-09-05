import { getRouteParam } from "./request.js"
import { updateClient } from "../services/client.service.js"

export async function updateClientController(request, response) {
  const result = await updateClient(
    request.authUser.empresaId,
    getRouteParam(request, "id"),
    request.body,
    request.authUser,
  )
  response.json({ ok: true, ...result })
}
