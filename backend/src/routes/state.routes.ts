import { Hono } from "hono"

import { getStateController } from "../controllers/state.controller"
import { requireAuth } from "../middlewares/auth.middleware"
import type { AppBindings } from "../types"

const stateRoutes = new Hono<AppBindings>()

stateRoutes.use("*", requireAuth)
stateRoutes.get("/", getStateController)

export default stateRoutes
