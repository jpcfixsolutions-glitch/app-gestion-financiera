import { Router } from "express"
import { updateClientController } from "../controllers/client.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"

const clientRoutes = Router()
clientRoutes.use(requireAuth)
clientRoutes.put("/:id", updateClientController)

export default clientRoutes
