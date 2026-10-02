import crypto from "node:crypto"
import { eq, sql } from "drizzle-orm"
import { getCreatorCredentials } from "../config/env.js"
import { closeDatabase, db } from "../models/database.js"
import { empresas, usuarios } from "../models/schema.js"
import { hashPassword } from "../services/security.service.js"

async function createSubscriptionManager() {
  const { email, password, empresaId } = getCreatorCredentials()
  const [empresa] = await db.select({ id: empresas.id }).from(empresas).where(eq(empresas.id, empresaId)).limit(1)
  if (!empresa) throw new Error("CREATOR_EMPRESA_ID no corresponde a una empresa existente")

  const [existing] = await db
    .select()
    .from(usuarios)
    .where(sql`lower(${usuarios.username}) = ${email.toLowerCase()}`)
    .limit(1)
  if (existing && existing.rol !== "creator") {
    throw new Error("CREATOR_EMAIL ya pertenece a un usuario normal; no se modificó ningún dato")
  }

  const passwordHash = await hashPassword(password)
  if (existing) {
    await db.update(usuarios).set({ passwordHash }).where(eq(usuarios.id, existing.id))
  } else {
    await db.insert(usuarios).values({
      id: `creator_${crypto.randomUUID()}`,
      empresaId,
      nombre: "Operador de suscripción",
      username: email,
      passwordHash,
      rol: "creator",
      createdAt: new Date().toISOString(),
    })
  }
  console.log("Operador interno de suscripción actualizado.")
}

createSubscriptionManager()
  .catch((error) => {
    console.error(`No se pudo preparar el operador interno: ${error.message}`)
    process.exitCode = 1
  })
  .finally(closeDatabase)
