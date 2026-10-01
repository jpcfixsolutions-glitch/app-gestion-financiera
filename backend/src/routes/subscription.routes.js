import { Router } from "express"
import { requireAuth } from "../middlewares/auth.middleware.js"
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
    res.status(403).json({ error: "Acceso denegado. Se requiere rol de creador." })
    return
  }
  next()
}

router.post("/configure", requireCreator, async (req, res, next) => {
  try {
    const { day } = req.body
    if (typeof day !== "number") {
      res.status(400).json({ error: "El campo 'day' debe ser un número." })
      return
    }
    const status = await configureSubscription(req.authUser.empresaId, day)
    res.json(status)
  } catch (error) {
    next(error)
  }
})

router.post("/renew", requireCreator, async (req, res, next) => {
  try {
    const status = await renewSubscription(req.authUser.empresaId)
    res.json(status)
  } catch (error) {
    next(error)
  }
})

export default router
