export class AppError extends Error {
  status
  code
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message)
    this.status = status
    this.code = code
    this.name = "AppError"
  }
}
