import type { Request, Response } from "express"

import { getCurrentUser, login } from "../services/auth.service"

export async function loginController(
  request: Request,
  response: Response,
): Promise<void> {
  const result = await login(request.body)
  response.json({ ok: true, ...result })
}

export function meController(request: Request, response: Response): void {
  response.json({ ok: true, user: getCurrentUser(request.authUser!) })
}

export function logoutController(_request: Request, response: Response): void {
  response.json({ ok: true })
}
