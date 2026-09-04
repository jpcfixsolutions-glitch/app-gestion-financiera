import assert from "node:assert/strict"
import { after, before, test } from "node:test"
let server
let baseUrl = ""
before(async () => {
  process.env.NODE_ENV = "production"
  process.env.FRONTEND_URL = ""
  const { default: app } = await import("./app.js")
  server = await new Promise((resolve) => {
    const startedServer = app.listen(0, () => resolve(startedServer))
  })
  const address = server.address()
  baseUrl = `http://127.0.0.1:${address.port}`
})
after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})
test("responde el health check desde Express", async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.ok, true)
})
test("autoriza el frontend de producción en el preflight CORS", async () => {
  const origin = "https://mis-finanzas-jpc.vercel.app"
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Headers": "content-type",
      "Access-Control-Request-Method": "POST",
    },
  })
  assert.equal(response.status, 204)
  assert.equal(response.headers.get("access-control-allow-origin"), origin)
})
test("rechaza rutas privadas sin token", async () => {
  const response = await fetch(`${baseUrl}/api/state`)
  const body = await response.json()
  assert.equal(response.status, 401)
  assert.equal(body.code, "UNAUTHORIZED")
})
test("devuelve errores JSON para rutas inexistentes", async () => {
  const response = await fetch(`${baseUrl}/api/no-existe`)
  const body = await response.json()
  assert.equal(response.status, 404)
  assert.equal(body.code, "NOT_FOUND")
})
