import "dotenv/config"
import { client, ensureInitialized } from "./index"
import { hashPassword } from "../lib/auth"

async function main() {
  await ensureInitialized()

  const username = "osmar"
  const nombre = "Osmar Bonaldi"
  const rawPassword =
    process.env.INITIAL_USER_PASSWORD || "CAMBIAR_POR_CONTRASEÑA_SEGURA"
  const passwordHash = hashPassword(rawPassword)

  const existing = await client.execute({
    sql: "SELECT id FROM usuarios WHERE username = ? LIMIT 1",
    args: [username],
  })

  if (existing.rows.length > 0) {
    // Actualizar contraseña con hash seguro
    await client.execute({
      sql: "UPDATE usuarios SET password_hash = ?, nombre = ? WHERE username = ?",
      args: [passwordHash, nombre, username],
    })
    console.log(
      `✅ Usuario '${nombre}' (usuario: ${username}) actualizado con nuevo hash seguro.`,
    )
  } else {
    await client.execute({
      sql: "INSERT INTO usuarios (id, empresa_id, nombre, username, password_hash, rol, created_at) VALUES ('usr_osmar', 'emp1', ?, ?, ?, 'admin', ?)",
      args: [nombre, username, passwordHash, new Date().toISOString()],
    })
    console.log(
      `✅ Usuario '${nombre}' (usuario: ${username}) creado exitosamente con hash seguro.`,
    )
  }
}

main().catch((err) => {
  console.error("❌ Error al crear usuario:", err)
  process.exit(1)
})
