import { Router } from "express"
import { healthController } from "../controllers/health.controller.js"
import activityRoutes from "./activity.routes.js"
import authRoutes from "./auth.routes.js"
import clientRoutes from "./client.routes.js"
import configurationRoutes from "./configuration.routes.js"
import operationRoutes from "./operation.routes.js"
import planRoutes from "./plan.routes.js"
import stateRoutes from "./state.routes.js"
import subscriptionRoutes from "./subscription.routes.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js"

const routes = Router()
routes.get("/", healthController)
routes.get("/health", healthController)
routes.use("/auth", authRoutes)
routes.use("/subscription", subscriptionRoutes)

// Exclude these from subscription block: auth, subscription, health (already above)
// The rest should be protected by auth and active subscription
const businessAuth = [requireAuth, requireActiveSubscription]

routes.use("/clientes", businessAuth, clientRoutes)
routes.use("/actividad", businessAuth, activityRoutes)
routes.use("/state", businessAuth, stateRoutes)
routes.use("/operaciones", businessAuth, operationRoutes)
routes.use("/configuracion", businessAuth, configurationRoutes)
routes.use("/planes", businessAuth, planRoutes)

export default routes
