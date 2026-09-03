import { serve } from "@hono/node-server"

import api from "./api/index"

const port = parseInt(process.env.PORT || "3001", 10)

console.log(`🚀 API server running at http://localhost:${port}`)

serve({ fetch: api.fetch, port })
