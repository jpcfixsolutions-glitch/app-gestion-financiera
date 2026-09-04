import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"

export const empresas = sqliteTable("empresas", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  createdAt: text("created_at").notNull(),
})

export const configuracion = sqliteTable(
  "configuracion",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresas.id),
    limiteReserva: real("limite_reserva").notNull().default(0),
    cajaEfectivo: real("caja_efectivo").notNull().default(0),
    cajaTransferencia: real("caja_transferencia").notNull().default(0),
    activoEfectivo: real("activo_efectivo").notNull().default(0),
    activoTransferencia: real("activo_transferencia").notNull().default(0),
  },
  (table) => [index("configuracion_empresa_idx").on(table.empresaId)],
)

export const planes = sqliteTable(
  "planes",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresas.id),
    nombre: text("nombre").notNull(),
    cuotas: integer("cuotas").notNull(),
    frecuencia: text("frecuencia").notNull(),
    interes: real("interes").notNull(),
  },
  (table) => [index("planes_empresa_idx").on(table.empresaId)],
)

export const clientes = sqliteTable(
  "clientes",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresas.id),
    nombre: text("nombre").notNull(),
    dni: text("dni").notNull(),
    telefono: text("telefono").notNull().default(""),
    direccion: text("direccion").notNull().default(""),
  },
  (table) => [
    index("clientes_empresa_idx").on(table.empresaId),
    index("clientes_empresa_dni_idx").on(table.empresaId, table.dni),
  ],
)

export const operaciones = sqliteTable(
  "operaciones",
  {
    id: text("id").primaryKey(),
    clienteId: text("cliente_id")
      .notNull()
      .references(() => clientes.id),
    planId: text("plan_id")
      .notNull()
      .references(() => planes.id),
    monto: real("monto").notNull(),
    modalidad: text("modalidad").notNull(),
    motivo: text("motivo").notNull().default(""),
    totalDevolver: real("total_devolver").notNull(),
    cuotaValor: real("cuota_valor").notNull(),
    fechaInicio: text("fecha_inicio").notNull(),
    pagosRealizados: integer("pagos_realizados").notNull().default(0),
    estado: text("estado").notNull().default("al-dia"),
    proximoVencimiento: text("proximo_vencimiento").notNull(),
  },
  (table) => [
    index("operaciones_cliente_idx").on(table.clienteId),
    index("operaciones_plan_idx").on(table.planId),
  ],
)

export const usuarios = sqliteTable(
  "usuarios",
  {
    id: text("id").primaryKey(),
    empresaId: text("empresa_id")
      .notNull()
      .references(() => empresas.id),
    nombre: text("nombre").notNull(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    rol: text("rol").notNull().default("admin"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("usuarios_empresa_idx").on(table.empresaId)],
)

export type EmpresaModel = typeof empresas.$inferSelect
export type ConfiguracionModel = typeof configuracion.$inferSelect
export type PlanModel = typeof planes.$inferSelect
export type ClienteModel = typeof clientes.$inferSelect
export type OperacionModel = typeof operaciones.$inferSelect
export type UsuarioModel = typeof usuarios.$inferSelect
