export function healthController(_request, response) {
  response.json({
    ok: true,
    service: "app-gestion-financiera-backend",
    timestamp: new Date().toISOString(),
  })
}
