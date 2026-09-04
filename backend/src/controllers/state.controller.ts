import type { Handler } from "hono"

import { getAppState } from "../services/state.service"
import type { AppBindings } from "../types"

export const getStateController: Handler<AppBindings> = async (context) => {
  const state = await getAppState(context.get("authUser").empresaId)
  return context.json(state)
}
