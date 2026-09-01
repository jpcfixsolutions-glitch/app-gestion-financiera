import { useFinanceState } from "@/hooks/useFinanceState"
import AppShell from "@/app/AppShell"

export default function App() {
  const financeState = useFinanceState()
  return <AppShell {...financeState} />
}
