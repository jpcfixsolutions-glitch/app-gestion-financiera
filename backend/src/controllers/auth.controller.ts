import type { Handler } from "hono"

import { getCurrentUser, login } from "../services/auth.service"
import type { AppBindings } from "../types"
import { readJsonBody } from "./request"

export const loginController: Handler<AppBindings> = async (context) => {
  const result = await login(await readJsonBody(context))
  return context.json({ ok: true, ...result })
}

export const meController: Handler<AppBindings> = (context) =>
  context.json({ ok: true, user: getCurrentUser(context.get("authUser")) })

export const logoutController: Handler<AppBindings> = (context) =>
  context.json({ ok: true })
