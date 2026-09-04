import { Hono } from "hono"

import { updateReserveLimitController } from "../controllers/configuration.controller"
import { requireAuth } from "../middlewares/auth.middleware"
import type { AppBindings } from "../types"

const configurationRoutes = new Hono<AppBindings>()

configurationRoutes.use("*", requireAuth)
configurationRoutes.put("/limite", updateReserveLimitController)

export default configurationRoutes
