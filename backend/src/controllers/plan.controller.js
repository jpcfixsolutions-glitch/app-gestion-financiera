import { createPlan, deletePlan } from "../services/plan.service.js"
import { getRouteParam } from "./request.js"
export async function createPlanController(request, response) {
  const plan = await createPlan(request.authUser.empresaId, request.body)
  response.status(201).json({ ok: true, plan })
}
export async function deletePlanController(request, response) {
  const result = await deletePlan(
    request.authUser.empresaId,
    getRouteParam(request, "id"),
  )
  response.json({ ok: true, ...result })
}
