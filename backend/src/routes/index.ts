import { Hono } from "hono"

import { healthController } from "../controllers/health.controller"
import type { AppBindings } from "../types"
import authRoutes from "./auth.routes"
import configurationRoutes from "./configuration.routes"
import operationRoutes from "./operation.routes"
import planRoutes from "./plan.routes"
import stateRoutes from "./state.routes"

const routes = new Hono<AppBindings>()

routes.get("/", healthController)
routes.get("/health", healthController)
routes.route("/auth", authRoutes)
routes.route("/state", stateRoutes)
routes.route("/operaciones", operationRoutes)
routes.route("/configuracion", configurationRoutes)
routes.route("/planes", planRoutes)

export default routes
