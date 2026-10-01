import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"

test("no existe un seed ejecutable ni comandos que puedan invocarlo", async () => {
  await assert.rejects(access(new URL("./seed.js", import.meta.url)), {
    code: "ENOENT",
  })

  const backendPackage = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8"),
  )
  const rootPackage = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  )

  for (const packageJson of [backendPackage, rootPackage]) {
    assert.equal(packageJson.scripts["db:seed"], undefined)
    assert.equal(packageJson.scripts["db:setup"], undefined)
  }
})
