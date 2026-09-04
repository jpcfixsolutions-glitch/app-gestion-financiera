import { Router } from "express"
import { getStateController } from "../controllers/state.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
const stateRoutes = Router()
stateRoutes.use(requireAuth)
stateRoutes.get("/", getStateController)
export default stateRoutes
