import { serve } from "@hono/node-server"

import app from "./app"

const port = parseInt(process.env.PORT || "3001", 10)

console.log(`🚀 API server running at http://localhost:${port}`)

serve({ fetch: app.fetch, port })
