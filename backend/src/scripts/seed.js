import { eq } from "drizzle-orm"
import { getInitialUserPassword } from "../config/env.js"
import { closeDatabase, db } from "../models/database.js"
import {
  actividad,
  clientes,
  configuracion,
  empresas,
  movimientosCaja,
  operaciones,
  planes,
  usuarios,
} from "../models/schema.js"
import { hashPassword } from "../services/security.service.js"

const EMPRESA_ID = "emp1"

async function seed() {
  console.log("Inicializando la base de datos con un estado limpio...")

  const passwordHash = await hashPassword(getInitialUserPassword())
  const createdAt = new Date().toISOString()

  await db.batch([
    db
      .insert(empresas)
      .values({
        id: EMPRESA_ID,
        nombre: "Gestión Financiera Corporativa",
        createdAt,
      })
      .onConflictDoNothing(),
    db.delete(actividad).where(eq(actividad.empresaId, EMPRESA_ID)),
    db.delete(movimientosCaja).where(eq(movimientosCaja.empresaId, EMPRESA_ID)),
    db.delete(operaciones),
    db.delete(clientes).where(eq(clientes.empresaId, EMPRESA_ID)),
    db.delete(planes).where(eq(planes.empresaId, EMPRESA_ID)),
    db.delete(configuracion).where(eq(configuracion.empresaId, EMPRESA_ID)),
    db.insert(configuracion).values({
      id: "cfg1",
      empresaId: EMPRESA_ID,
      limiteReserva: 0,
      cajaEfectivo: 0,
      cajaTransferencia: 0,
      activoEfectivo: 0,
      activoTransferencia: 0,
    }),
    db
      .insert(usuarios)
      .values({
        id: "usr_osmar",
        empresaId: EMPRESA_ID,
        nombre: "Osmar Bonaldi",
        username: "OsmarBonaldi",
        passwordHash,
        rol: "admin",
        createdAt,
      })
      .onConflictDoNothing(),
  ])

  console.log("Base de datos lista para el uso del cliente.")
}

seed()
  .catch((error) => {
    console.error("Falló la inicialización:", error)
    process.exitCode = 1
  })
  .finally(closeDatabase)
