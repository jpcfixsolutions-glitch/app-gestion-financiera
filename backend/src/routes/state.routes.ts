import { Router } from "express"

import { getStateController } from "../controllers/state.controller"
import { requireAuth } from "../middlewares/auth.middleware"

const stateRoutes = Router()

stateRoutes.use(requireAuth)
stateRoutes.get("/", getStateController)

export default stateRoutes
