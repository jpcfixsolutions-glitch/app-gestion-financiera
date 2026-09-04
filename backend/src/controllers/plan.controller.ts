import type { Request, Response } from "express"

import { createPlan, deletePlan } from "../services/plan.service"
import { getRouteParam } from "./request"

export async function createPlanController(
  request: Request,
  response: Response,
): Promise<void> {
  const plan = await createPlan(request.authUser!.empresaId, request.body)
  response.status(201).json({ ok: true, plan })
}

export async function deletePlanController(
  request: Request,
  response: Response,
): Promise<void> {
  const result = await deletePlan(
    request.authUser!.empresaId,
    getRouteParam(request, "id"),
  )
  response.json({ ok: true, ...result })
}
