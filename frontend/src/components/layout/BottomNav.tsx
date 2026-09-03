import type { View } from "@/domain/finance/types"

import { BOTTOM_NAV_ITEMS } from "@/app/navigation"

import { useAuth } from "@/features/auth/AuthContext"

import Icon from "@/components/ui/Icon"

export interface BottomNavProps {
  view: View

  setView: (v: View) => void
}

export default function BottomNav({ view, setView }: BottomNavProps) {
  const { logout } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex lg:hidden">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const active = view === item.id

        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium tracking-wide uppercase transition-colors ${
              active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon name={item.icon} cls="w-5 h-5" />
            {item.label}
          </button>
        )
      })}
      <div className="w-px my-2 bg-slate-200" />
      <button
        onClick={logout}
        className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium tracking-wide uppercase text-slate-400 hover:text-danger-600 transition-colors"
      >
        <Icon name="logout" cls="w-5 h-5" />
        Salir
      </button>
    </nav>
  )
}
