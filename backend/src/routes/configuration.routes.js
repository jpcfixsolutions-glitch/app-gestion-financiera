import { Router } from "express"
import { updateReserveLimitController } from "../controllers/configuration.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
const configurationRoutes = Router()
configurationRoutes.use(requireAuth)
configurationRoutes.put("/limite", updateReserveLimitController)
export default configurationRoutes
