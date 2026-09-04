import { Hono } from "hono"
import { bodyLimit } from "hono/body-limit"
import { secureHeaders } from "hono/secure-headers"

import { corsMiddleware } from "./middlewares/cors.middleware"
import { handleError, handleNotFound } from "./middlewares/error.middleware"
import routes from "./routes"
import type { AppBindings } from "./types"

const app = new Hono<AppBindings>()

app.use("*", secureHeaders())
app.use("/api/*", corsMiddleware)
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 256 * 1024,
    onError: (context) =>
      context.json(
        {
          error: "El cuerpo de la solicitud es demasiado grande",
          code: "BODY_TOO_LARGE",
        },
        413,
      ),
  }),
)
app.use("/api/*", async (context, next) => {
  context.header("Cache-Control", "private, no-store")
  await next()
})

app.route("/api", routes)
app.onError(handleError)
app.notFound(handleNotFound)

export default app
export type ApiType = typeof app
