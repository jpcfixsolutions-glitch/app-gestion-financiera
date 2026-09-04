export type AppErrorStatus = 400 | 401 | 403 | 404 | 409 | 422

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: AppErrorStatus = 400,
    public readonly code = "BAD_REQUEST",
  ) {
    super(message)
    this.name = "AppError"
  }
}
