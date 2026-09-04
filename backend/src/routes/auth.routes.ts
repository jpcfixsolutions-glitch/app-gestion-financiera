import { Router } from "express"

import {
  loginController,
  logoutController,
  meController,
} from "../controllers/auth.controller"
import { requireAuth } from "../middlewares/auth.middleware"

const authRoutes = Router()

authRoutes.post("/login", loginController)
authRoutes.get("/me", requireAuth, meController)
authRoutes.post("/logout", logoutController)

export default authRoutes
