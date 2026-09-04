const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim()
const baseApiUrl = normalizeApiBaseUrl(rawApiUrl)
/**
 * Retorna la URL completa para un endpoint de la API.
 * Si VITE_API_URL está vacía (desarrollo local con proxy Vite), utiliza rutas relativas empezando con /api.
 * Si VITE_API_URL está definida (ej. https://api.midominio.com), concatena la URL base con el path.
 */
export function getApiUrl(path) {
  const cleanPath = path
    .trim()
    .replace(/^\/+/, "")
    .replace(/^api\/?/, "")
  return cleanPath ? `${baseApiUrl}/${cleanPath}` : baseApiUrl
}
function normalizeApiBaseUrl(value) {
  const normalized = value.trim().replace(/\/+$/, "")
  if (!normalized) return "/api"
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`
}
