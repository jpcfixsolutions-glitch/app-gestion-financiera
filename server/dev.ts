import { serve } from "@hono/node-server";
import api from "./api/index";

const port = 3001;

console.log(`🚀 API server running at http://localhost:${port}`);

serve({ fetch: api.fetch, port });
