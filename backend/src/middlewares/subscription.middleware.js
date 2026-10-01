import { getSubscriptionStatus } from "../services/subscription.service.js"
import { AppError } from "../errors/app-error.js"

export const requireActiveSubscription = async (req, res, next) => {
  // If the user is the internal operator, they never get blocked
  if (req.authUser?.rol === "creator") {
    return next()
  }

  try {
    const status = await getSubscriptionStatus(req.authUser.empresaId)
    if (status.isExpired) {
      return res.status(402).json({
        code: "SUBSCRIPTION_EXPIRED",
        message: "La suscripción está vencida"
      })
    }
    next()
  } catch (error) {
    next(error)
  }
}
