import { Hono } from "hono"

import {
  createPlanController,
  deletePlanController,
} from "../controllers/plan.controller"
import { requireAuth } from "../middlewares/auth.middleware"
import type { AppBindings } from "../types"

const planRoutes = new Hono<AppBindings>()

planRoutes.use("*", requireAuth)
planRoutes.post("/", createPlanController)
planRoutes.delete("/:id", deletePlanController)

export default planRoutes
