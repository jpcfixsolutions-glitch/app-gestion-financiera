// ─── API Configuration & Centralized Helper ─────────────────────────────────

const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim()

/**
 * Retorna la URL completa para un endpoint de la API.
 * Si VITE_API_URL está vacía (desarrollo local con proxy Vite), utiliza rutas relativas empezando con /api.
 * Si VITE_API_URL está definida (ej. https://api.midominio.com), concatena la URL base con el path.
 */
export function getApiUrl(path: string): string {
  // Asegurar que el path comience con /
  const cleanPath = path.startsWith("/") ? path : `/${path}`

  // Si el path no incluye /api, anteponerlo
  const apiPath = cleanPath.startsWith("/api") ? cleanPath : `/api${cleanPath}`

  if (!rawApiUrl) {
    return apiPath
  }

  const baseUrl = rawApiUrl.replace(/\/+$/, "")
  return `${baseUrl}${apiPath}`
}
