import { handle } from "hono/vercel"

import api from "../src/api/index"

export default handle(api)
