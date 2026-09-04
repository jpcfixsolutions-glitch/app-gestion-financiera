import { Hono } from "hono"

import {
  loginController,
  logoutController,
  meController,
} from "../controllers/auth.controller"
import { requireAuth } from "../middlewares/auth.middleware"
import type { AppBindings } from "../types"

const authRoutes = new Hono<AppBindings>()

authRoutes.post("/login", loginController)
authRoutes.get("/me", requireAuth, meController)
authRoutes.post("/logout", logoutController)

export default authRoutes
