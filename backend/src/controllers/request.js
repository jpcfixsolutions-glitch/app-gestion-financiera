export function getRouteParam(request, name) {
  const value = request.params[name]
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}
