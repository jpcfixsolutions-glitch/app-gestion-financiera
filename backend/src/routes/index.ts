import { Router } from "express"

import { healthController } from "../controllers/health.controller"
import authRoutes from "./auth.routes"
import configurationRoutes from "./configuration.routes"
import operationRoutes from "./operation.routes"
import planRoutes from "./plan.routes"
import stateRoutes from "./state.routes"

const routes = Router()

routes.get("/", healthController)
routes.get("/health", healthController)
routes.use("/auth", authRoutes)
routes.use("/state", stateRoutes)
routes.use("/operaciones", operationRoutes)
routes.use("/configuracion", configurationRoutes)
routes.use("/planes", planRoutes)

export default routes
