import { Router } from "express"

import {
  createPlanController,
  deletePlanController,
} from "../controllers/plan.controller"
import { requireAuth } from "../middlewares/auth.middleware"

const planRoutes = Router()

planRoutes.use(requireAuth)
planRoutes.post("/", createPlanController)
planRoutes.delete("/:id", deletePlanController)

export default planRoutes
