import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { createClient } from "@libsql/client"

test("reconcilia el capital pendiente por la modalidad original", async () => {
  const client = createClient({ url: "file::memory:" })
  try {
    await client.executeMultiple(`
      CREATE TABLE configuracion (
        empresa_id TEXT PRIMARY KEY,
        activo_efectivo REAL NOT NULL,
        activo_transferencia REAL NOT NULL
      );
      CREATE TABLE clientes (id TEXT PRIMARY KEY, empresa_id TEXT NOT NULL);
      CREATE TABLE planes (id TEXT PRIMARY KEY, empresa_id TEXT NOT NULL, cuotas INTEGER NOT NULL);
      CREATE TABLE operaciones (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        monto REAL NOT NULL,
        modalidad TEXT NOT NULL,
        pagos_realizados INTEGER NOT NULL
      );
      INSERT INTO configuracion VALUES ('empresa-1', 1, 1);
      INSERT INTO clientes VALUES ('cliente-1', 'empresa-1');
      INSERT INTO planes VALUES ('plan-6', 'empresa-1', 6);
      INSERT INTO planes VALUES ('plan-3', 'empresa-1', 3);
      INSERT INTO operaciones VALUES (
        'op-transferencia', 'cliente-1', 'plan-6', 100000, 'Transferencia', 1
      );
      INSERT INTO operaciones VALUES (
        'op-efectivo', 'cliente-1', 'plan-3', 90000, 'Efectivo', 1
      );
    `)
    const migration = await readFile(
      new URL("../../drizzle/0006_reconcile_outstanding_capital.sql", import.meta.url),
      "utf8",
    )
    await client.executeMultiple(migration)
    const result = await client.execute(
      "SELECT activo_efectivo, activo_transferencia FROM configuracion",
    )
    assert.deepEqual(result.rows[0], {
      activo_efectivo: 60_000,
      activo_transferencia: 83_333.33,
    })
  } finally {
    client.close()
  }
})
