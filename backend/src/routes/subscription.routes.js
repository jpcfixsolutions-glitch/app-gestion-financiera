import { Router } from "express"
import { requireAuth } from "../middlewares/auth.middleware.js"
import { AppError } from "../errors/app-error.js"
import { getSubscriptionStatus, configureSubscription, renewSubscription } from "../services/subscription.service.js"

const router = Router()

// all endpoints require auth
router.use(requireAuth)

router.get("/status", async (req, res, next) => {
  try {
    const status = await getSubscriptionStatus(req.authUser.empresaId)
    res.json(status)
  } catch (error) {
    next(error)
  }
})

// only creator can configure or renew
const requireCreator = (req, res, next) => {
  if (req.authUser.rol !== "creator") {
    return next(new AppError("Acceso denegado", 403, "FORBIDDEN"))
  }
  next()
}

router.post("/configure", requireCreator, async (req, res, next) => {
  try {
    const status = await configureSubscription(req.authUser.empresaId, req.body?.day, req.authUser)
    res.json(status)
  } catch (error) {
    next(error)
  }
})

router.post("/renew", requireCreator, async (req, res, next) => {
  try {
    const status = await renewSubscription(req.authUser.empresaId, req.authUser)
    res.json(status)
  } catch (error) {
    next(error)
  }
})

export default router
