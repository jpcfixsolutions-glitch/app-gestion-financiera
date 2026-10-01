import { useFinanceState } from "@/hooks/useFinanceState"
import { AuthProvider, useAuth } from "@/features/auth/AuthContext"
import AppShell from "@/app/AppShell"
import LoginPage from "@/features/auth/LoginPage"
import { SubscriptionProvider, useSubscription } from "@/features/subscription/SubscriptionContext"
import SubscriptionGate from "@/features/subscription/SubscriptionGate"
import CreatorPanel from "@/features/subscription/CreatorPanel"
/** Only mounts after auth — avoids firing useFinanceState (and its /api/state fetch) before login. */
function BusinessApp() {
  const financeState = useFinanceState()
  return (
    <SubscriptionGate>
      <AppShell {...financeState} />
    </SubscriptionGate>
  )
}

function AuthenticatedApp() {
  const { user } = useAuth()
  
  if (user?.rol === "creator") {
    return <CreatorPanel />
  }

  return <BusinessApp />
}
function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-brand-950 via-brand-900 to-slate-925 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-brand-300 font-mono">
            Verificando sesión…
          </p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return <LoginPage />
  }
  return (
    <SubscriptionProvider>
      <AuthenticatedApp />
    </SubscriptionProvider>
  )
}
export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
