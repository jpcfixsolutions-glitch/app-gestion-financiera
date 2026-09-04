import { Router } from "express"
import {
  createPlanController,
  deletePlanController,
} from "../controllers/plan.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
const planRoutes = Router()
planRoutes.use(requireAuth)
planRoutes.post("/", createPlanController)
planRoutes.delete("/:id", deletePlanController)
export default planRoutes
