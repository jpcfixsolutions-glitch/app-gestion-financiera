import { getInitialUserPassword } from "../config/env.js"
import { closeDatabase, db } from "../models/database.js"
import { empresas, usuarios } from "../models/schema.js"
import { hashPassword } from "../services/security.service.js"
async function createOrUpdateUser() {
  const username = "OsmarBonaldi"
  const nombre = "Osmar Bonaldi"
  const passwordHash = await hashPassword(getInitialUserPassword())
  await db
    .insert(empresas)
    .values({
      id: "emp1",
      nombre: "Gestión Financiera Corporativa",
      createdAt: new Date().toISOString(),
    })
    .onConflictDoNothing()
  await db
    .insert(usuarios)
    .values({
      id: "usr_osmar",
      empresaId: "emp1",
      nombre,
      username,
      passwordHash,
      rol: "admin",
      createdAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: usuarios.id,
      set: { nombre, username, passwordHash },
    })
  console.log(`✅ Usuario '${nombre}' actualizado correctamente.`)
}
createOrUpdateUser()
  .catch((error) => {
    console.error("❌ Error al crear o actualizar el usuario:", error)
    process.exitCode = 1
  })
  .finally(closeDatabase)
