import { Router } from "express"

import {
  createOperationController,
  registerPaymentController,
} from "../controllers/operation.controller"
import { requireAuth } from "../middlewares/auth.middleware"

const operationRoutes = Router()

operationRoutes.use(requireAuth)
operationRoutes.post("/", createOperationController)
operationRoutes.post("/:id/pago", registerPaymentController)

export default operationRoutes
