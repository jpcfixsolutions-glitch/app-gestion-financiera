import type { Request, Response } from "express"

import { getAppState } from "../services/state.service"

export async function getStateController(
  request: Request,
  response: Response,
): Promise<void> {
  const state = await getAppState(request.authUser!.empresaId)
  response.json(state)
}
