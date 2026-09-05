import { createPlan, deletePlan } from "../services/plan.service.js"
import { getRouteParam } from "./request.js"
export async function createPlanController(request, response) {
  const result = await createPlan(
    request.authUser.empresaId,
    request.body,
    request.authUser,
  )
  response.status(201).json({ ok: true, ...result })
}
export async function deletePlanController(request, response) {
  const result = await deletePlan(
    request.authUser.empresaId,
    getRouteParam(request, "id"),
    request.authUser,
  )
  response.json({ ok: true, ...result })
}
