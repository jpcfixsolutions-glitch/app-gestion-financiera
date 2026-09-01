import { db } from "./index";
import { empresas, configuracion, planes, clientes, operaciones } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Empresa ───────────────────────────────────────────────────────────────
  await db.insert(empresas).values({
    id: "emp1",
    nombre: "Empresa Demo",
    createdAt: new Date().toISOString(),
  });

  // ─── Configuración ─────────────────────────────────────────────────────────
  await db.insert(configuracion).values({
    id: "cfg1",
    empresaId: "emp1",
    limiteReserva: 50000,
    cajaEfectivo: 175000,
    cajaTransferencia: 110000,
    activoEfectivo: 220000,
    activoTransferencia: 240000,
  });

  // ─── Planes ────────────────────────────────────────────────────────────────
  await db.insert(planes).values([
    { id: "p1", empresaId: "emp1", nombre: "Plan Corto", cuotas: 3, frecuencia: "Mensual", interes: 15 },
    { id: "p2", empresaId: "emp1", nombre: "Plan Estándar", cuotas: 6, frecuencia: "Mensual", interes: 20 },
    { id: "p3", empresaId: "emp1", nombre: "Plan Quincenal", cuotas: 8, frecuencia: "Quincenal", interes: 18 },
    { id: "p4", empresaId: "emp1", nombre: "Plan Diario", cuotas: 30, frecuencia: "Diario", interes: 25 },
  ]);

  // ─── Clientes ──────────────────────────────────────────────────────────────
  await db.insert(clientes).values([
    { id: "c1", empresaId: "emp1", nombre: "Martina Rodríguez", dni: "32.847.291", telefono: "+54 11 4823-7710", direccion: "Av. Corrientes 2847, CABA" },
    { id: "c2", empresaId: "emp1", nombre: "Carlos Espinoza", dni: "27.119.480", telefono: "+54 9 351 402-8815", direccion: "Bv. Chacabuco 1452, Córdoba" },
    { id: "c3", empresaId: "emp1", nombre: "Lorena Vázquez", dni: "38.004.772", telefono: "+54 11 5522-0931", direccion: "Mitre 780, San Justo" },
    { id: "c4", empresaId: "emp1", nombre: "Diego Fuentes", dni: "30.562.198", telefono: "+54 9 11 6710-4422", direccion: "Rivadavia 3308, Lanús" },
  ]);

  // ─── Operaciones ───────────────────────────────────────────────────────────
  await db.insert(operaciones).values([
    {
      id: "op1", clienteId: "c1", planId: "p2", monto: 80000, modalidad: "Transferencia",
      motivo: "Adquisición de equipamiento comercial",
      totalDevolver: 96000, cuotaValor: 16000, fechaInicio: "2026-03-01",
      pagosRealizados: 4, estado: "vence-pronto", proximoVencimiento: "2026-09-01",
    },
    {
      id: "op2", clienteId: "c2", planId: "p1", monto: 120000, modalidad: "Efectivo",
      motivo: "Capital de trabajo para expansión",
      totalDevolver: 138000, cuotaValor: 46000, fechaInicio: "2026-06-10",
      pagosRealizados: 1, estado: "al-dia", proximoVencimiento: "2026-09-10",
    },
    {
      id: "op3", clienteId: "c3", planId: "p3", monto: 50000, modalidad: "Efectivo",
      motivo: "Refacción de local comercial",
      totalDevolver: 59000, cuotaValor: 7375, fechaInicio: "2026-05-01",
      pagosRealizados: 2, estado: "mora", proximoVencimiento: "2026-07-15",
    },
    {
      id: "op4", clienteId: "c4", planId: "p2", monto: 210000, modalidad: "Transferencia",
      motivo: "Incorporación de inventario",
      totalDevolver: 252000, cuotaValor: 42000, fechaInicio: "2026-04-15",
      pagosRealizados: 3, estado: "al-dia", proximoVencimiento: "2026-09-15",
    },
  ]);

  console.log("✅ Seed completed successfully");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
