import Icon from "@/components/ui/Icon"
export default function ModalidadToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 gap-1">
      {["Efectivo", "Transferencia"].map((m) => {
        const active = value === m
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              active
                ? "bg-white text-brand-700 shadow-sm border border-slate-200"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon name={m === "Efectivo" ? "cash" : "transfer"} cls="w-4 h-4" />
            {m}
          </button>
        )
      })}
    </div>
  )
}
