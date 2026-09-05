import { Router } from "express"
import { healthController } from "../controllers/health.controller.js"
import activityRoutes from "./activity.routes.js"
import authRoutes from "./auth.routes.js"
import clientRoutes from "./client.routes.js"
import configurationRoutes from "./configuration.routes.js"
import operationRoutes from "./operation.routes.js"
import planRoutes from "./plan.routes.js"
import stateRoutes from "./state.routes.js"
const routes = Router()
routes.get("/", healthController)
routes.get("/health", healthController)
routes.use("/auth", authRoutes)
routes.use("/clientes", clientRoutes)
routes.use("/actividad", activityRoutes)
routes.use("/state", stateRoutes)
routes.use("/operaciones", operationRoutes)
routes.use("/configuracion", configurationRoutes)
routes.use("/planes", planRoutes)
export default routes
