import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ─── Empresas ────────────────────────────────────────────────────────────────

export const empresas = sqliteTable("empresas", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  createdAt: text("created_at").notNull(),
});

// ─── Configuración por empresa ───────────────────────────────────────────────

export const configuracion = sqliteTable("configuracion", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id")
    .notNull()
    .references(() => empresas.id),
  limiteReserva: real("limite_reserva").notNull().default(0),
  cajaEfectivo: real("caja_efectivo").notNull().default(0),
  cajaTransferencia: real("caja_transferencia").notNull().default(0),
  activoEfectivo: real("activo_efectivo").notNull().default(0),
  activoTransferencia: real("activo_transferencia").notNull().default(0),
});

// ─── Planes de financiación ──────────────────────────────────────────────────

export const planes = sqliteTable("planes", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id")
    .notNull()
    .references(() => empresas.id),
  nombre: text("nombre").notNull(),
  cuotas: integer("cuotas").notNull(),
  frecuencia: text("frecuencia").notNull(), // "Diario" | "Quincenal" | "Mensual"
  interes: real("interes").notNull(),
});

// ─── Clientes ────────────────────────────────────────────────────────────────

export const clientes = sqliteTable("clientes", {
  id: text("id").primaryKey(),
  empresaId: text("empresa_id")
    .notNull()
    .references(() => empresas.id),
  nombre: text("nombre").notNull(),
  dni: text("dni").notNull(),
  telefono: text("telefono").notNull().default(""),
  direccion: text("direccion").notNull().default(""),
});

// ─── Operaciones ─────────────────────────────────────────────────────────────

export const operaciones = sqliteTable("operaciones", {
  id: text("id").primaryKey(),
  clienteId: text("cliente_id")
    .notNull()
    .references(() => clientes.id),
  planId: text("plan_id")
    .notNull()
    .references(() => planes.id),
  monto: real("monto").notNull(),
  modalidad: text("modalidad").notNull(), // "Efectivo" | "Transferencia"
  motivo: text("motivo").notNull().default(""),
  totalDevolver: real("total_devolver").notNull(),
  cuotaValor: real("cuota_valor").notNull(),
  fechaInicio: text("fecha_inicio").notNull(),
  pagosRealizados: integer("pagos_realizados").notNull().default(0),
  estado: text("estado").notNull().default("al-dia"), // "al-dia" | "vence-pronto" | "mora"
  proximoVencimiento: text("proximo_vencimiento").notNull(),
});
