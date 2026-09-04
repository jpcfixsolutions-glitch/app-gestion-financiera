const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
})

export function formatCurrency(value) {
  return currencyFormatter.format(value)
}
export function formatShortDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return shortDateFormatter.format(date)
}
