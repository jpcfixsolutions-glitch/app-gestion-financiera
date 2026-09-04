import { getApiUrl } from "@/lib/apiConfig"
import { clearAuthSession, getAuthToken } from "@/lib/authStorage"
export class ApiError extends Error {
  status
  code
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
    this.name = "ApiError"
  }
}
export async function apiRequest(path, options = {}) {
  const { auth = true, headers: customHeaders, ...requestOptions } = options
  const headers = new Headers(customHeaders)
  const token = auth ? getAuthToken() : null
  if (requestOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (token) headers.set("Authorization", `Bearer ${token}`)
  const response = await fetch(getApiUrl(path), {
    ...requestOptions,
    headers,
  })
  const data = await parseResponse(response)
  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearAuthSession()
      window.dispatchEvent(new Event("gf:unauthorized"))
    }
    const errorBody = isRecord(data) ? data : null
    throw new ApiError(
      typeof errorBody?.error === "string"
        ? errorBody.error
        : `La API respondió con estado ${response.status}`,
      response.status,
      typeof errorBody?.code === "string" ? errorBody.code : undefined,
    )
  }
  return data
}
async function parseResponse(response) {
  if (response.status === 204) return undefined
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }
  const text = await response.text()
  return text || null
}
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}
