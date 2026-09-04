import { useState } from "react"
import { useAuth } from "@/features/auth/AuthContext"
import Icon from "@/components/ui/Icon"
export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ username: false, password: false })
  const usernameError =
    touched.username && !username.trim() ? "Ingresá tu usuario" : ""
  const passwordError =
    touched.password && !password.trim() ? "Ingresá tu contraseña" : ""
  const canSubmit = username.trim() && password.trim() && !isLoading
  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ username: true, password: true })
    if (!username.trim() || !password.trim()) return
    await login(username.trim(), password.trim())
  }
  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-gradient-to-br from-brand-950 via-brand-900 to-slate-925 font-sans relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-brand-500/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-700/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 backdrop-blur-sm border border-brand-500/20 mb-5 shadow-lg shadow-brand-600/10">
            <Icon name="lock" cls="w-7 h-7 text-brand-300" />
          </div>
          <p className="text-[10px] font-mono text-brand-400 tracking-[0.25em] uppercase mb-2">
            Sistema GF
          </p>
          <h1 className="text-2xl font-semibold text-white leading-tight">
            Gestión Financiera
            <br />
            <span className="text-brand-300">Corporativa</span>
          </h1>
        </div>

        {/* Login card */}
        <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-danger-600/15 border border-danger-600/25 animate-[fadeIn_0.2s_ease-out]">
                <Icon name="alert" cls="w-4 h-4 text-danger-600 shrink-0" />
                <p className="text-sm text-danger-100 font-medium">{error}</p>
              </div>
            )}

            {/* Username field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block text-xs font-medium text-brand-200 tracking-wide uppercase"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon name="user" cls="w-4 h-4 text-brand-400" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  placeholder="Ingresá tu usuario"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.07] border text-sm text-white placeholder:text-brand-400/60 font-medium transition-all duration-200 outline-none focus:bg-white/[0.1] focus:ring-2 focus:ring-brand-500/40 ${
                    usernameError
                      ? "border-danger-600/60"
                      : "border-white/10 hover:border-white/20"
                  }`}
                />
              </div>
              {usernameError && (
                <p className="text-xs text-danger-600 font-medium pl-1">
                  {usernameError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-brand-200 tracking-wide uppercase"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon name="lock" cls="w-4 h-4 text-brand-400" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="Ingresá tu contraseña"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.07] border text-sm text-white placeholder:text-brand-400/60 font-medium transition-all duration-200 outline-none focus:bg-white/[0.1] focus:ring-2 focus:ring-brand-500/40 ${
                    passwordError
                      ? "border-danger-600/60"
                      : "border-white/10 hover:border-white/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-brand-400 hover:text-brand-200 hover:bg-white/10 transition-colors"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} cls="w-4 h-4" />
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-danger-600 font-medium pl-1">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                canSubmit
                  ? "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30 active:scale-[0.98]"
                  : "bg-brand-600/30 text-brand-300/50 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión…
                </>
              ) : (
                <>
                  <Icon name="lock" cls="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-brand-400/40 font-mono mt-6">
          v2.4.1 · Entorno Seguro
        </p>
      </div>
    </div>
  )
}
