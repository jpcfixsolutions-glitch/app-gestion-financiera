import { getCurrentUser, login } from "../services/auth.service.js"
export async function loginController(request, response) {
  const result = await login(request.body)
  response.json({ ok: true, ...result })
}
export function meController(request, response) {
  response.json({ ok: true, user: getCurrentUser(request.authUser) })
}
