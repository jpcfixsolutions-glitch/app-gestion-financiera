import { Router } from "express"

import { updateReserveLimitController } from "../controllers/configuration.controller"
import { requireAuth } from "../middlewares/auth.middleware"

const configurationRoutes = Router()

configurationRoutes.use(requireAuth)
configurationRoutes.put("/limite", updateReserveLimitController)

export default configurationRoutes
