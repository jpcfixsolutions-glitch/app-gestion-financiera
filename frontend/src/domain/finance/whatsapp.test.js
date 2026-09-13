import assert from "node:assert/strict"
import test from "node:test"
import {
  buildWhatsAppLoanMessage,
  buildWhatsAppUrl,
  normalizeWhatsAppPhone,
} from "./whatsapp.js"

const client = {
  nombre: "Ana Pérez",
  telefono: "+54 9 3512 11-2543",
  operaciones: [
    {
      motivo: "Capital de trabajo",
      plan: { nombre: "Mensual", cuotas: 6 },
      pagosRealizados: 2,
      cuotaValor: 20_000,
      totalDevolver: 120_000,
      proximoVencimiento: "2026-09-20",
      estado: "al-dia",
    },
  ],
}

test("normaliza números argentinos e internacionales para wa.me", () => {
  assert.equal(normalizeWhatsAppPhone("+54 9 3512 11-2543"), "5493512112543")
  assert.equal(normalizeWhatsAppPhone("+54 3512 11-2543"), "5493512112543")
  assert.equal(normalizeWhatsAppPhone("03512 11-2543"), "5493512112543")
  assert.equal(normalizeWhatsAppPhone("0351 15 123-4567"), "5493511234567")
  assert.equal(normalizeWhatsAppPhone("+1 (202) 555-0123"), "12025550123")
})

test("rechaza teléfonos incompletos o con caracteres inválidos", () => {
  assert.equal(normalizeWhatsAppPhone("3512-112"), null)
  assert.equal(normalizeWhatsAppPhone("sin teléfono"), null)
  assert.equal(normalizeWhatsAppPhone(""), null)
})

test("resume cuotas e importes pendientes con datos reales", () => {
  const message = buildWhatsAppLoanMessage(client)

  assert.match(message, /Próxima cuota: 3 de 6/)
  assert.match(message, /Cuotas restantes: 4/)
  assert.match(message, /Importe a abonar: \$\s?20\.000/)
  assert.match(message, /Total abonado: \$\s?40\.000/)
  assert.match(message, /Saldo restante: \$\s?80\.000/)
  assert.doesNotMatch(message, /undefined|null|NaN/)
})

test("genera el enlace para el destinatario con el mensaje codificado", () => {
  const url = buildWhatsAppUrl(client)

  assert.ok(url.startsWith("https://wa.me/5493512112543?text="))
  assert.match(decodeURIComponent(url), /Hola Ana Pérez/)
})

test("informa cuando el cliente ya no tiene préstamos pendientes", () => {
  const message = buildWhatsAppLoanMessage({
    ...client,
    operaciones: [
      {
        ...client.operaciones[0],
        pagosRealizados: 6,
      },
    ],
  })

  assert.match(message, /completamente abonados/)
})
