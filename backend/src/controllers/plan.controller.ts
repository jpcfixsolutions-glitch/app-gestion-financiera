import type { Handler } from "hono"

import { createPlan, deletePlan } from "../services/plan.service"
import type { AppBindings } from "../types"
import { readJsonBody } from "./request"

export const createPlanController: Handler<AppBindings> = async (context) => {
  const plan = await createPlan(
    context.get("authUser").empresaId,
    await readJsonBody(context),
  )
  return context.json({ ok: true, plan }, 201)
}

export const deletePlanController: Handler<AppBindings> = async (context) => {
  const result = await deletePlan(
    context.get("authUser").empresaId,
    context.req.param("id") ?? "",
  )
  return context.json({ ok: true, ...result })
}
