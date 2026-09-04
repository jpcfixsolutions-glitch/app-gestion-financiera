import { Hono } from "hono"

import {
  createOperationController,
  registerPaymentController,
} from "../controllers/operation.controller"
import { requireAuth } from "../middlewares/auth.middleware"
import type { AppBindings } from "../types"

const operationRoutes = new Hono<AppBindings>()

operationRoutes.use("*", requireAuth)
operationRoutes.post("/", createOperationController)
operationRoutes.post("/:id/pago", registerPaymentController)

export default operationRoutes
