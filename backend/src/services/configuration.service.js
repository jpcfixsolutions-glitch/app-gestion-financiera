import { eq } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { configuracion } from "../models/schema.js"
import { requireNumber, requireRecord } from "./validation.service.js"
export async function updateReserveLimit(empresaId, value) {
  const body = requireRecord(value)
  const limiteReserva = requireNumber(body.limiteReserva, "limiteReserva", {
    min: 0,
    max: 1_000_000_000_000,
  })
  const [updated] = await db
    .update(configuracion)
    .set({ limiteReserva })
    .where(eq(configuracion.empresaId, empresaId))
    .returning({ limiteReserva: configuracion.limiteReserva })
  if (!updated) {
    throw new AppError(
      "La empresa no tiene una configuración financiera",
      404,
      "CONFIGURATION_NOT_FOUND",
    )
  }
  return updated
}
