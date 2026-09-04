import { Router } from "express"
import {
  createOperationController,
  registerPaymentController,
} from "../controllers/operation.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
const operationRoutes = Router()
operationRoutes.use(requireAuth)
operationRoutes.post("/", createOperationController)
operationRoutes.post("/:id/pago", registerPaymentController)
export default operationRoutes
