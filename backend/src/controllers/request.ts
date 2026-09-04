import type { Context } from "hono"

import { AppError } from "../errors/app-error"

export async function readJsonBody(context: Context): Promise<unknown> {
  try {
    return await context.req.json()
  } catch {
    throw new AppError("El cuerpo JSON no es válido", 400, "INVALID_JSON")
  }
}
