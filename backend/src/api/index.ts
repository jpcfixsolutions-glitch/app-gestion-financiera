import { Hono } from "hono"
import { cors } from "hono/cors"
import { eq } from "drizzle-orm"
import { db, ensureInitialized } from "../db/index"
import * as schema from "../db/schema"
import { verifyPassword, signAuthToken, verifyAuthToken, type AuthTokenPayload } from "../lib/auth"

import type {
  AppState,
  Cliente,
  Frecuencia,
  Modalidad,
  Operacion,
  Plan,
} from "../types"

type Variables = {
  authUser: AuthTokenPayload
}

const DEFAULT_EMPRESA_ID = "emp1"

const api = new Hono<{ Variables: Variables }>().basePath("/api")

const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN

api.use(
  "/*",
  cors({
    origin: (origin) => {
      if (!origin) return "*"
      if (frontendUrl) {
        const allowedOrigins = frontendUrl.split(",").map((o) => o.trim())
        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          return origin
        }
      }
      return origin
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
)

// Garantizar esquema antes de procesar peticiones
api.use("/*", async (c, next) => {
  await ensureInitialized()
  return next()
})

// ─── Helper de Autenticación ──────────────────────────────────────────────────

function extractAuthUser(c: any) {
  const authHeader =
    c.req.header("Authorization") || c.req.header("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  const token = authHeader.substring(7).trim()
  return verifyAuthToken(token)
}

// ─── Rutas de Autenticación ──────────────────────────────────────────────────

api.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json<{
      username?: string
      password?: string
    }>()
    const username = body.username?.trim().toLowerCase()
    const password = body.password?.trim()

    if (!username || !password) {
      return c.json({ error: "Usuario y contraseña requeridos" }, 400)
    }

    // Buscar usuario en base de datos
    const [user] = await db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.username, username))

    if (!user) {
      return c.json({ error: "Usuario o contraseña incorrectos" }, 401)
    }

    const isValid = verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return c.json({ error: "Usuario o contraseña incorrectos" }, 401)
    }

    const token = signAuthToken({
      sub: user.id,
      username: user.username,
      name: user.nombre,
      empresaId: user.empresaId,
      rol: user.rol,
    })

    return c.json({
      ok: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.nombre,
        empresaId: user.empresaId,
      },
    })
  } catch (err) {
    console.error("Error en login:", err)
    return c.json(
      { error: "Error interno del servidor durante la autenticación" },
      500,
    )
  }
})

api.get("/auth/me", async (c) => {
  const authUser = extractAuthUser(c)
  if (!authUser) {
    return c.json({ error: "Sesión no válida o expirada" }, 401)
  }

  const [user] = await db
    .select()
    .from(schema.usuarios)
    .where(eq(schema.usuarios.id, authUser.sub))

  if (!user) {
    return c.json({ error: "Usuario no encontrado" }, 401)
  }

  return c.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.nombre,
      empresaId: user.empresaId,
    },
  })
})

api.post("/auth/logout", async (c) => {
  return c.json({ ok: true })
})

// ─── Middleware de Protección para Rutas de Datos ────────────────────────────

api.use("/state/*", async (c, next) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  c.set("authUser", user)
  return next()
})

api.use("/operaciones/*", async (c, next) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  c.set("authUser", user)
  return next()
})

api.use("/configuracion/*", async (c, next) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  c.set("authUser", user)
  return next()
})

api.use("/planes/*", async (c, next) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  c.set("authUser", user)
  return next()
})

// ─── Helper: build full AppState from DB ─────────────────────────────────────

async function buildAppState(empresaId: string): Promise<AppState> {
  const [cfg] = await db
    .select()
    .from(schema.configuracion)
    .where(eq(schema.configuracion.empresaId, empresaId))

  const dbPlanes = await db
    .select()
    .from(schema.planes)
    .where(eq(schema.planes.empresaId, empresaId))

  const dbClientes = await db
    .select()
    .from(schema.clientes)
    .where(eq(schema.clientes.empresaId, empresaId))

  const dbOps = await db.select().from(schema.operaciones)

  // Build plan lookup
  const planMap = new Map<string, Plan>()
  for (const p of dbPlanes) {
    planMap.set(p.id, {
      id: p.id,
      nombre: p.nombre,
      cuotas: p.cuotas,
      frecuencia: p.frecuencia as Frecuencia,
      interes: p.interes,
    })
  }

  // Build clientes with embedded operaciones
  const clienteMap = new Map<string, Cliente>()
  for (const c of dbClientes) {
    clienteMap.set(c.id, {
      id: c.id,
      nombre: c.nombre,
      dni: c.dni,
      telefono: c.telefono,
      direccion: c.direccion,
      operaciones: [],
    })
  }

  for (const op of dbOps) {
    const cliente = clienteMap.get(op.clienteId)
    const plan = planMap.get(op.planId)
    if (!cliente || !plan) continue

    const operacion: Operacion = {
      id: op.id,
      clienteId: op.clienteId,
      monto: op.monto,
      modalidad: op.modalidad as Modalidad,
      motivo: op.motivo,
      plan,
      totalDevolver: op.totalDevolver,
      cuotaValor: op.cuotaValor,
      fechaInicio: op.fechaInicio,
      pagosRealizados: op.pagosRealizados,
      estado: op.estado as Operacion["estado"],
      proximoVencimiento: op.proximoVencimiento,
    }
    cliente.operaciones.push(operacion)
  }

  return {
    caja: {
      efectivo: cfg?.cajaEfectivo ?? 0,
      transferencia: cfg?.cajaTransferencia ?? 0,
    },
    activo: {
      efectivo: cfg?.activoEfectivo ?? 0,
      transferencia: cfg?.activoTransferencia ?? 0,
    },
    limiteReserva: cfg?.limiteReserva ?? 0,
    planes: Array.from(planMap.values()),
    clientes: Array.from(clienteMap.values()),
  }
}

// ─── GET /api/state ──────────────────────────────────────────────────────────

api.get("/state", async (c) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  const empresaId = user.empresaId || DEFAULT_EMPRESA_ID
  const state = await buildAppState(empresaId)
  return c.json(state)
})

// ─── POST /api/operaciones ───────────────────────────────────────────────────

api.post("/operaciones", async (c) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  const empresaId = user.empresaId || DEFAULT_EMPRESA_ID

  const body = await c.req.json<{
    cliente: {
      nombre: string
      dni: string
      telefono: string
      direccion: string
    }
    operacion: {
      monto: number
      modalidad: Modalidad
      motivo: string
      planId: string
      planCustom?: {
        nombre: string
        cuotas: number
        frecuencia: Frecuencia
        interes: number
      }
      totalDevolver: number
      cuotaValor: number
    }
  }>()

  const clienteId = "c" + Date.now()
  const opId = "op" + Date.now()
  const key =
    body.operacion.modalidad === "Efectivo" ? "efectivo" : "transferencia"

  // Determine plan: custom or existing
  let planId = body.operacion.planId
  if (body.operacion.planCustom) {
    planId = "pcustom" + Date.now()
    await db.insert(schema.planes).values({
      id: planId,
      empresaId,
      nombre: body.operacion.planCustom.nombre,
      cuotas: body.operacion.planCustom.cuotas,
      frecuencia: body.operacion.planCustom.frecuencia,
      interes: body.operacion.planCustom.interes,
    })
  }

  // Insert cliente
  await db.insert(schema.clientes).values({
    id: clienteId,
    empresaId,
    nombre: body.cliente.nombre,
    dni: body.cliente.dni,
    telefono: body.cliente.telefono,
    direccion: body.cliente.direccion,
  })

  // Insert operacion
  await db.insert(schema.operaciones).values({
    id: opId,
    clienteId,
    planId,
    monto: body.operacion.monto,
    modalidad: body.operacion.modalidad,
    motivo: body.operacion.motivo,
    totalDevolver: body.operacion.totalDevolver,
    cuotaValor: body.operacion.cuotaValor,
    fechaInicio: new Date().toISOString().split("T")[0],
    pagosRealizados: 0,
    estado: "al-dia",
    proximoVencimiento: new Date(Date.now() + 30 * 86400000)
      .toISOString()
      .split("T")[0],
  })

  // Update caja/activo
  const [cfg] = await db
    .select()
    .from(schema.configuracion)
    .where(eq(schema.configuracion.empresaId, empresaId))

  if (cfg) {
    const cajaKey = key === "efectivo" ? "cajaEfectivo" : "cajaTransferencia"
    const activoKey =
      key === "efectivo" ? "activoEfectivo" : "activoTransferencia"
    await db
      .update(schema.configuracion)
      .set({
        [cajaKey]: cfg[cajaKey] - body.operacion.monto,
        [activoKey]: cfg[activoKey] + body.operacion.monto,
      })
      .where(eq(schema.configuracion.id, cfg.id))
  }

  return c.json({ ok: true })
})

// ─── POST /api/operaciones/:id/pago ──────────────────────────────────────────

api.post("/operaciones/:id/pago", async (c) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  const empresaId = user.empresaId || DEFAULT_EMPRESA_ID

  const opId = c.req.param("id")
  const body = await c.req.json<{ modalidad: Modalidad }>()

  const [op] = await db
    .select()
    .from(schema.operaciones)
    .where(eq(schema.operaciones.id, opId))

  if (!op) return c.json({ error: "Operación no encontrada" }, 404)

  const key = body.modalidad === "Efectivo" ? "efectivo" : "transferencia"

  // Update pagos
  await db
    .update(schema.operaciones)
    .set({ pagosRealizados: op.pagosRealizados + 1 })
    .where(eq(schema.operaciones.id, opId))

  // Update caja/activo
  const [cfg] = await db
    .select()
    .from(schema.configuracion)
    .where(eq(schema.configuracion.empresaId, empresaId))

  if (cfg) {
    const cajaKey = key === "efectivo" ? "cajaEfectivo" : "cajaTransferencia"
    const activoKey =
      key === "efectivo" ? "activoEfectivo" : "activoTransferencia"
    await db
      .update(schema.configuracion)
      .set({
        [cajaKey]: cfg[cajaKey] + op.cuotaValor,
        [activoKey]: Math.max(0, cfg[activoKey] - op.cuotaValor),
      })
      .where(eq(schema.configuracion.id, cfg.id))
  }

  return c.json({ ok: true })
})

// ─── PUT /api/configuracion/limite ───────────────────────────────────────────

api.put("/configuracion/limite", async (c) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  const empresaId = user.empresaId || DEFAULT_EMPRESA_ID

  const body = await c.req.json<{ limiteReserva: number }>()

  await db
    .update(schema.configuracion)
    .set({ limiteReserva: body.limiteReserva })
    .where(eq(schema.configuracion.empresaId, empresaId))

  return c.json({ ok: true })
})

// ─── POST /api/planes ────────────────────────────────────────────────────────

api.post("/planes", async (c) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)
  const empresaId = user.empresaId || DEFAULT_EMPRESA_ID

  const body = await c.req.json<{
    nombre: string
    cuotas: number
    frecuencia: Frecuencia
    interes: number
  }>()

  const id = "p" + Date.now()
  await db.insert(schema.planes).values({
    id,
    empresaId,
    ...body,
  })

  return c.json({ ok: true, id })
})

// ─── DELETE /api/planes/:id ──────────────────────────────────────────────────

api.delete("/planes/:id", async (c) => {
  const user = extractAuthUser(c)
  if (!user) return c.json({ error: "No autorizado. Inicie sesión." }, 401)

  const id = c.req.param("id")
  await db.delete(schema.planes).where(eq(schema.planes.id, id))
  return c.json({ ok: true })
})

export default api
export type ApiType = typeof api
