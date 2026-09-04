import { getAppState } from "../services/state.service.js"
export async function getStateController(request, response) {
  const state = await getAppState(request.authUser.empresaId)
  response.json(state)
}
