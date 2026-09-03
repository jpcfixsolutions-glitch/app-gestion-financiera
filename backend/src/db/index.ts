import "dotenv/config"
import { drizzle } from "drizzle-orm/libsql"
import { createClient, type Client } from "@libsql/client"
import * as schema from "./schema"
import { hashPassword } from "../lib/auth"

const DEFAULT_URL = "file:local.db"

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL || DEFAULT_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (
    !process.env.TURSO_DATABASE_URL &&
    process.env.NODE_ENV === "production"
  ) {
    console.warn(
      "⚠️ TURSO_DATABASE_URL no está configurada. Configure las variables de entorno en Vercel.",
    )
  }

  return createClient({
    url,
    authToken,
  })
}

export const client = createDbClient()
export const db = drizzle(client, { schema })

/**
 * Garantiza que las tablas necesarias existan en SQLite / Turso.
 * Se ejecuta de forma idempotente (CREATE TABLE IF NOT EXISTS).
 */
let initPromise: Promise<void> | null = null

export async function ensureInitialized(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      await client.executeMultiple(`
        CREATE TABLE IF NOT EXISTS empresas (
          id TEXT PRIMARY KEY NOT NULL,
          nombre TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS configuracion (
          id TEXT PRIMARY KEY NOT NULL,
          empresa_id TEXT NOT NULL,
          limite_reserva REAL DEFAULT 0 NOT NULL,
          caja_efectivo REAL DEFAULT 0 NOT NULL,
          caja_transferencia REAL DEFAULT 0 NOT NULL,
          activo_efectivo REAL DEFAULT 0 NOT NULL,
          activo_transferencia REAL DEFAULT 0 NOT NULL,
          FOREIGN KEY (empresa_id) REFERENCES empresas(id)
        );
        CREATE TABLE IF NOT EXISTS planes (
          id TEXT PRIMARY KEY NOT NULL,
          empresa_id TEXT NOT NULL,
          nombre TEXT NOT NULL,
          cuotas INTEGER NOT NULL,
          frecuencia TEXT NOT NULL,
          interes REAL NOT NULL,
          FOREIGN KEY (empresa_id) REFERENCES empresas(id)
        );
        CREATE TABLE IF NOT EXISTS clientes (
          id TEXT PRIMARY KEY NOT NULL,
          empresa_id TEXT NOT NULL,
          nombre TEXT NOT NULL,
          dni TEXT NOT NULL,
          telefono TEXT DEFAULT '' NOT NULL,
          direccion TEXT DEFAULT '' NOT NULL,
          FOREIGN KEY (empresa_id) REFERENCES empresas(id)
        );
        CREATE TABLE IF NOT EXISTS operaciones (
          id TEXT PRIMARY KEY NOT NULL,
          cliente_id TEXT NOT NULL,
          plan_id TEXT NOT NULL,
          monto REAL NOT NULL,
          modalidad TEXT NOT NULL,
          motivo TEXT DEFAULT '' NOT NULL,
          total_devolver REAL NOT NULL,
          cuota_valor REAL NOT NULL,
          fecha_inicio TEXT NOT NULL,
          pagos_realizados INTEGER DEFAULT 0 NOT NULL,
          estado TEXT DEFAULT 'al-dia' NOT NULL,
          proximo_vencimiento TEXT NOT NULL,
          FOREIGN KEY (cliente_id) REFERENCES clientes(id),
          FOREIGN KEY (plan_id) REFERENCES planes(id)
        );
        CREATE TABLE IF NOT EXISTS usuarios (
          id TEXT PRIMARY KEY NOT NULL,
          empresa_id TEXT NOT NULL,
          nombre TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          rol TEXT DEFAULT 'admin' NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (empresa_id) REFERENCES empresas(id)
        );
      `)

      // Verificar si la empresa base existe; si no, crearla
      const resEmpresa = await client.execute({
        sql: "SELECT id FROM empresas WHERE id = 'emp1' LIMIT 1",
        args: [],
      })

      if (resEmpresa.rows.length === 0) {
        await client.execute({
          sql: "INSERT INTO empresas (id, nombre, created_at) VALUES ('emp1', 'Gestión Financiera Corporativa', ?)",
          args: [new Date().toISOString()],
        })

        await client.execute({
          sql: `INSERT INTO configuracion (id, empresa_id, limite_reserva, caja_efectivo, caja_transferencia, activo_efectivo, activo_transferencia)
                VALUES ('cfg1', 'emp1', 50000, 175000, 110000, 220000, 240000)`,
          args: [],
        })

        // Planes base
        await client.execute({
          sql: `INSERT INTO planes (id, empresa_id, nombre, cuotas, frecuencia, interes) VALUES
                ('p1', 'emp1', 'Plan Corto', 3, 'Mensual', 15),
                ('p2', 'emp1', 'Plan Estándar', 6, 'Mensual', 20),
                ('p3', 'emp1', 'Plan Quincenal', 8, 'Quincenal', 18),
                ('p4', 'emp1', 'Plan Diario', 30, 'Diario', 25)`,
          args: [],
        })
      }

      // Verificar si el usuario inicial (Osmar Bonaldi) existe; si no, crearlo con hash seguro
      const resUser = await client.execute({
        sql: "SELECT id FROM usuarios WHERE username = 'osmar' LIMIT 1",
        args: [],
      })

      if (resUser.rows.length === 0) {
        const rawPassword =
          process.env.INITIAL_USER_PASSWORD || "CAMBIAR_POR_CONTRASEÑA_SEGURA"
        const passwordHash = hashPassword(rawPassword)

        await client.execute({
          sql: `INSERT INTO usuarios (id, empresa_id, nombre, username, password_hash, rol, created_at)
                VALUES ('usr_osmar', 'emp1', 'Osmar Bonaldi', 'osmar', ?, 'admin', ?)`,
          args: [passwordHash, new Date().toISOString()],
        })
      }
    } catch (err) {
      console.error("Error al inicializar esquema de base de datos:", err)
    }
  })()

  return initPromise
}
