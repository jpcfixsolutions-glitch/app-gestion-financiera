import { db, client } from "./index"
import {
  empresas,
  configuracion,
  planes,
  clientes,
  operaciones,
  usuarios,
} from "./schema"
import { hashPassword } from "../lib/auth"

async function seed() {
  console.log("🌱 Inicializando datos en la base de datos...")

  // ─── Empresa ───────────────────────────────────────────────────────────────
  const resEmpresa = await client.execute({
    sql: "SELECT id FROM empresas WHERE id = 'emp1' LIMIT 1",
    args: [],
  })

  if (resEmpresa.rows.length === 0) {
    await db.insert(empresas).values({
      id: "emp1",
      nombre: "Gestión Financiera Corporativa",
      createdAt: new Date().toISOString(),
    })
  }

  // ─── Usuario Osmar Bonaldi ─────────────────────────────────────────────────
  const resUser = await client.execute({
    sql: "SELECT id FROM usuarios WHERE username = 'osmar' LIMIT 1",
    args: [],
  })

  if (resUser.rows.length === 0) {
    const rawPassword =
      process.env.INITIAL_USER_PASSWORD || "CAMBIAR_POR_CONTRASEÑA_SEGURA"
    const passwordHash = hashPassword(rawPassword)

    await db.insert(usuarios).values({
      id: "usr_osmar",
      empresaId: "emp1",
      nombre: "Osmar Bonaldi",
      username: "osmar",
      passwordHash,
      rol: "admin",
      createdAt: new Date().toISOString(),
    })
    console.log(
      "✅ Usuario 'Osmar Bonaldi' (username: osmar) registrado exitosamente con hash seguro.",
    )
  } else {
    console.log("ℹ️ El usuario 'Osmar Bonaldi' (username: osmar) ya existe.")
  }

  // ─── Configuración ─────────────────────────────────────────────────────────
  const resCfg = await client.execute({
    sql: "SELECT id FROM configuracion WHERE id = 'cfg1' LIMIT 1",
    args: [],
  })

  if (resCfg.rows.length === 0) {
    await db.insert(configuracion).values({
      id: "cfg1",
      empresaId: "emp1",
      limiteReserva: 50000,
      cajaEfectivo: 175000,
      cajaTransferencia: 110000,
      activoEfectivo: 220000,
      activoTransferencia: 240000,
    })
  }

  // ─── Planes ────────────────────────────────────────────────────────────────
  const resPlanes = await client.execute({
    sql: "SELECT COUNT(*) as count FROM planes WHERE empresa_id = 'emp1'",
    args: [],
  })

  if (Number(resPlanes.rows[0]?.count ?? 0) === 0) {
    await db.insert(planes).values([
      {
        id: "p1",
        empresaId: "emp1",
        nombre: "Plan Corto",
        cuotas: 3,
        frecuencia: "Mensual",
        interes: 15,
      },
      {
        id: "p2",
        empresaId: "emp1",
        nombre: "Plan Estándar",
        cuotas: 6,
        frecuencia: "Mensual",
        interes: 20,
      },
      {
        id: "p3",
        empresaId: "emp1",
        nombre: "Plan Quincenal",
        cuotas: 8,
        frecuencia: "Quincenal",
        interes: 18,
      },
      {
        id: "p4",
        empresaId: "emp1",
        nombre: "Plan Diario",
        cuotas: 30,
        frecuencia: "Diario",
        interes: 25,
      },
    ])
  }

  // ─── Clientes ──────────────────────────────────────────────────────────────
  const resClientes = await client.execute({
    sql: "SELECT COUNT(*) as count FROM clientes WHERE empresa_id = 'emp1'",
    args: [],
  })

  if (Number(resClientes.rows[0]?.count ?? 0) === 0) {
    await db.insert(clientes).values([
      {
        id: "c1",
        empresaId: "emp1",
        nombre: "Martina Rodríguez",
        dni: "32.847.291",
        telefono: "+54 11 4823-7710",
        direccion: "Av. Corrientes 2847, CABA",
      },
      {
        id: "c2",
        empresaId: "emp1",
        nombre: "Carlos Espinoza",
        dni: "27.119.480",
        telefono: "+54 9 351 402-8815",
        direccion: "Bv. Chacabuco 1452, Córdoba",
      },
      {
        id: "c3",
        empresaId: "emp1",
        nombre: "Lorena Vázquez",
        dni: "38.004.772",
        telefono: "+54 11 5522-0931",
        direccion: "Mitre 780, San Justo",
      },
      {
        id: "c4",
        empresaId: "emp1",
        nombre: "Diego Fuentes",
        dni: "30.562.198",
        telefono: "+54 9 11 6710-4422",
        direccion: "Rivadavia 3308, Lanús",
      },
    ])

    // ─── Operaciones ─────────────────────────────────────────────────────────
    await db.insert(operaciones).values([
      {
        id: "op1",
        clienteId: "c1",
        planId: "p2",
        monto: 80000,
        modalidad: "Transferencia",
        motivo: "Adquisición de equipamiento comercial",
        totalDevolver: 96000,
        cuotaValor: 16000,
        fechaInicio: "2026-03-01",
        pagosRealizados: 4,
        estado: "vence-pronto",
        proximoVencimiento: "2026-09-01",
      },
      {
        id: "op2",
        clienteId: "c2",
        planId: "p1",
        monto: 120000,
        modalidad: "Efectivo",
        motivo: "Capital de trabajo para expansión",
        totalDevolver: 138000,
        cuotaValor: 46000,
        fechaInicio: "2026-06-10",
        pagosRealizados: 1,
        estado: "al-dia",
        proximoVencimiento: "2026-09-10",
      },
      {
        id: "op3",
        clienteId: "c3",
        planId: "p3",
        monto: 50000,
        modalidad: "Efectivo",
        motivo: "Refacción de local comercial",
        totalDevolver: 59000,
        cuotaValor: 7375,
        fechaInicio: "2026-05-01",
        pagosRealizados: 2,
        estado: "mora",
        proximoVencimiento: "2026-07-15",
      },
      {
        id: "op4",
        clienteId: "c4",
        planId: "p2",
        monto: 210000,
        modalidad: "Transferencia",
        motivo: "Incorporación de inventario",
        totalDevolver: 252000,
        cuotaValor: 42000,
        fechaInicio: "2026-04-15",
        pagosRealizados: 3,
        estado: "al-dia",
        proximoVencimiento: "2026-09-15",
      },
    ])
  }

  console.log("✅ Inicialización de base de datos completada.")
}

seed().catch((err) => {
  console.error("❌ Falló la inicialización:", err)
  process.exit(1)
})
