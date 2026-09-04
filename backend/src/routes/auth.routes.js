import { Router } from "express"
import {
  loginController,
  meController,
} from "../controllers/auth.controller.js"
import { requireAuth } from "../middlewares/auth.middleware.js"
const authRoutes = Router()
authRoutes.post("/login", loginController)
authRoutes.get("/me", requireAuth, meController)
export default authRoutes
