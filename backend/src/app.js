import express from "express"
import { corsMiddleware } from "./middlewares/cors.middleware.js"
import { handleError, handleNotFound } from "./middlewares/error.middleware.js"
import routes from "./routes/index.js"
const app = express()
app.disable("x-powered-by")
app.use("/api", corsMiddleware)
app.use("/api", securityHeaders)
app.use("/api", express.json({ limit: "256kb" }))
app.use("/api", noStore)
app.get("/", (_request, response) => response.redirect(307, "/api"))
app.get("/favicon.ico", (_request, response) => response.status(204).end())
app.use("/api", routes)
app.use(handleNotFound)
app.use(handleError)
export default app
function securityHeaders(_request, response, next) {
  response.set({
    "Content-Security-Policy": "default-src 'none'",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  })
  next()
}
function noStore(_request, response, next) {
  response.setHeader("Cache-Control", "private, no-store")
  next()
}
