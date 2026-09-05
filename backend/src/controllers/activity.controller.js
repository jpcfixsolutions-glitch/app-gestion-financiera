import { getActivityPage } from "../services/activity.service.js"

export async function getActivityController(request, response) {
  const result = await getActivityPage(
    request.authUser.empresaId,
    request.query,
  )
  response.json({ ok: true, ...result })
}
