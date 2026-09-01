import type { View } from "@/domain/finance/types"
import { SIDEBAR_ITEMS } from "@/app/navigation"
import Icon from "@/components/ui/Icon"

export interface SidebarProps {
  view: View
  setView: (v: View) => void
}

export default function Sidebar({ view, setView }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-brand-950 text-white shrink-0">
      <div className="px-6 py-6 border-b border-brand-800">
        <p className="text-[10px] font-mono text-brand-300 tracking-[0.2em] uppercase mb-1">
          Sistema GF
        </p>
        <h1 className="text-base font-semibold leading-tight">
          Gestión Financiera
          <br />
          Corporativa
        </h1>
      </div>
      <nav className="flex-1 py-4">
        {SIDEBAR_ITEMS.map((item) => {
          const active =
            view === item.id || (view === "cliente" && item.id === "cartera")
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-800 text-white border-r-2 border-brand-400"
                  : "text-brand-300 hover:bg-brand-900 hover:text-white"
              }`}
            >
              <Icon name={item.icon} cls="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="px-6 py-4 border-t border-brand-800">
        <p className="text-[10px] text-brand-400 font-mono">
          v2.4.1 · Entorno Seguro
        </p>
      </div>
    </aside>
  )
}
