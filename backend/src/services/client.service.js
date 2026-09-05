import { and, eq } from "drizzle-orm"
import { AppError } from "../errors/app-error.js"
import { db } from "../models/database.js"
import { clientes } from "../models/schema.js"
import { parseClientInput } from "./finance-rules.service.js"
import { logActivity } from "./activity.service.js"

export async function updateClient(empresaId, id, value, actor) {
  if (!id || id.length > 100) {
    throw new AppError(
      "Identificador de cliente inválido",
      422,
      "VALIDATION_ERROR",
    )
  }
  const input = parseClientInput(value)
  const [currentRows, sameDniRows] = await db.batch([
    db
      .select()
      .from(clientes)
      .where(and(eq(clientes.id, id), eq(clientes.empresaId, empresaId)))
      .limit(1),
    db
      .select({ id: clientes.id })
      .from(clientes)
      .where(
        and(eq(clientes.empresaId, empresaId), eq(clientes.dni, input.dni)),
      )
      .limit(1),
  ])
  if (!currentRows[0]) {
    throw new AppError("Cliente no encontrado", 404, "CLIENT_NOT_FOUND")
  }
  if (sameDniRows[0] && sameDniRows[0].id !== id) {
    throw new AppError(
      "Ya existe otro cliente registrado con ese DNI",
      409,
      "DNI_ALREADY_REGISTERED",
    )
  }
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(clientes)
      .set(input)
      .where(and(eq(clientes.id, id), eq(clientes.empresaId, empresaId)))
      .returning()
    const activity = await logActivity(tx, empresaId, actor, {
      tipo: "cliente_actualizado",
      titulo: "Datos de cliente actualizados",
      detalle: `${updated.nombre} · DNI ${updated.dni}`,
    })
    return {
      cliente: {
        id: updated.id,
        nombre: updated.nombre,
        dni: updated.dni,
        telefono: updated.telefono,
        direccion: updated.direccion,
      },
      actividades: [activity],
    }
  })
}
