import { Router } from "express"
import {
  registerCashMovementController,
  updateReserveLimitController,
} from "../controllers/configuration.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
const configurationRoutes = Router()
configurationRoutes.use(requireAuth)
configurationRoutes.put("/limite", updateReserveLimitController)
configurationRoutes.post("/caja/movimientos", registerCashMovementController)
export default configurationRoutes
