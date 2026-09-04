import { getInitialUserPassword } from "../config/env"
import { closeDatabase, db } from "../models/database"
import { empresas, usuarios } from "../models/schema"
import { hashPassword } from "../services/security.service"

async function createOrUpdateUser() {
  const username = "osmar"
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
      target: usuarios.username,
      set: { nombre, passwordHash },
    })

  console.log(`✅ Usuario '${nombre}' actualizado correctamente.`)
}

createOrUpdateUser()
  .catch((error) => {
    console.error("❌ Error al crear o actualizar el usuario:", error)
    process.exitCode = 1
  })
  .finally(closeDatabase)
