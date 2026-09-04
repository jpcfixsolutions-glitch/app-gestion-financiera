import "dotenv/config"

import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import { getDatabaseConfig } from "../config/env"
import * as schema from "./schema"

const databaseConfig = getDatabaseConfig()

export const client = createClient(databaseConfig)
export const db = drizzle(client, { schema })

export async function closeDatabase(): Promise<void> {
  client.close()
}
