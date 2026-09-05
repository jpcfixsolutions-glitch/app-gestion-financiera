import { Router } from "express"
import { getActivityController } from "../controllers/activity.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"

const activityRoutes = Router()
activityRoutes.use(requireAuth)
activityRoutes.get("/", getActivityController)

export default activityRoutes
