import { formatCurrency, formatShortDate } from "./formatters.js"

const MIN_INTERNATIONAL_DIGITS = 8
const MAX_INTERNATIONAL_DIGITS = 15

const operationStatusLabels = {
  "al-dia": "Al día",
  "vence-pronto": "Vence pronto",
  mora: "En mora",
}

function isValidInternationalLength(phone) {
  return (
    phone.length >= MIN_INTERNATIONAL_DIGITS &&
    phone.length <= MAX_INTERNATIONAL_DIGITS
  )
}

function removeLegacyArgentinaMobileMarker(phone) {
  const match = phone.match(/^(\d{2,4}?)15(\d{6,8})$/)
  if (!match) return phone

  const normalizedPhone = `${match[1]}${match[2]}`
  return normalizedPhone.length === 10 ? normalizedPhone : phone
}

/**
 * Returns a wa.me-compatible phone number or null when the stored value is not
 * complete enough to identify a recipient. Local numbers are interpreted as
 * Argentine numbers because this application uses the es-AR locale.
 */
export function normalizeWhatsAppPhone(value) {
  if (typeof value !== "string") return null

  const rawPhone = value.trim()
  if (!rawPhone || !/^\+?[\d\s().-]+$/.test(rawPhone)) return null

  const plusSigns = rawPhone.match(/\+/g)?.length ?? 0
  if (plusSigns > 1 || (plusSigns === 1 && !rawPhone.startsWith("+"))) {
    return null
  }

  const hasInternationalPrefix =
    rawPhone.startsWith("+") || rawPhone.startsWith("00")
  let digits = rawPhone.replace(/\D/g, "")
  if (rawPhone.startsWith("00")) digits = digits.slice(2)

  if (!isValidInternationalLength(digits)) return null

  if (digits.startsWith("54")) {
    let nationalNumber = digits.slice(2).replace(/^0/, "")

    if (/^9\d{10}$/.test(nationalNumber)) return `54${nationalNumber}`
    nationalNumber = removeLegacyArgentinaMobileMarker(nationalNumber)
    if (/^\d{10}$/.test(nationalNumber)) return `549${nationalNumber}`
    return null
  }

  if (!hasInternationalPrefix) {
    const nationalNumber = removeLegacyArgentinaMobileMarker(
      digits.replace(/^0/, ""),
    )
    return /^\d{10}$/.test(nationalNumber) ? `549${nationalNumber}` : null
  }

  return digits
}

function safeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function operationDescription(operation, index, operationCount) {
  const description = operation.motivo?.trim() || operation.plan?.nombre?.trim()
  if (operationCount === 1) return description || "Préstamo"
  return `Préstamo ${index + 1}${description ? ` — ${description}` : ""}`
}

function buildOperationSummary(operation, index, operationCount) {
  const totalInstallments = Math.max(0, safeNumber(operation.plan?.cuotas))
  const paidInstallments = Math.min(
    totalInstallments,
    Math.max(0, safeNumber(operation.pagosRealizados)),
  )
  const remainingInstallments = totalInstallments - paidInstallments
  const totalToRepay = Math.max(0, safeNumber(operation.totalDevolver))
  const installmentValue = Math.max(0, safeNumber(operation.cuotaValor))
  const paidAmount = Math.min(totalToRepay, installmentValue * paidInstallments)
  const remainingBalance = Math.max(0, totalToRepay - paidAmount)
  const amountDue = Math.min(installmentValue, remainingBalance)
  const lines = [
    `*${operationDescription(operation, index, operationCount)}*`,
    `• Próxima cuota: ${paidInstallments + 1} de ${totalInstallments}`,
    `• Cuotas restantes: ${remainingInstallments}`,
    `• Importe a abonar: ${formatCurrency(amountDue)}`,
    `• Total abonado: ${formatCurrency(paidAmount)}`,
    `• Saldo restante: ${formatCurrency(remainingBalance)}`,
  ]

  if (operation.proximoVencimiento) {
    lines.push(
      `• Próximo vencimiento: ${formatShortDate(operation.proximoVencimiento)}`,
    )
  }
  if (operationStatusLabels[operation.estado]) {
    lines.push(`• Estado: ${operationStatusLabels[operation.estado]}`)
  }

  return lines.join("\n")
}

export function buildWhatsAppLoanMessage(client) {
  const clientName = client?.nombre?.trim() || ""
  const operations = Array.isArray(client?.operaciones)
    ? client.operaciones
    : []
  const pendingOperations = operations.filter((operation) => {
    const installments = safeNumber(operation.plan?.cuotas)
    return installments > safeNumber(operation.pagosRealizados)
  })

  if (pendingOperations.length === 0) {
    return [
      `Hola${clientName ? ` ${clientName}` : ""}.`,
      "",
      "Te comparto el estado actualizado: tus préstamos figuran completamente abonados.",
      "",
      "Si tenés alguna consulta, podés responder a este mensaje. Muchas gracias.",
    ].join("\n")
  }

  const loanLabel = pendingOperations.length === 1 ? "préstamo" : "préstamos"
  const summaries = pendingOperations.map((operation, index) =>
    buildOperationSummary(operation, index, pendingOperations.length),
  )

  return [
    `Hola${
      clientName ? ` ${clientName}` : ""
    }, te comparto el estado actualizado de tu ${loanLabel}:`,
    "",
    summaries.join("\n\n"),
    "",
    "Si tenés alguna consulta, podés responder a este mensaje. Muchas gracias.",
  ].join("\n")
}

export function buildWhatsAppUrl(client) {
  const phone = normalizeWhatsAppPhone(client?.telefono)
  if (!phone) return null

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    buildWhatsAppLoanMessage(client),
  )}`
}
