import "dotenv/config"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { getDatabaseConfig } from "../config/env.js"
import * as schema from "./schema.js"
const databaseConfig = getDatabaseConfig()
export const client = createClient(databaseConfig)
export const db = drizzle(client, { schema })
export async function closeDatabase() {
  client.close()
}
