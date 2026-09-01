import { handle } from "hono/vercel";
import api from "../server/api/index";

export default handle(api);
