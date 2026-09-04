export type SidebarSection = 'tablero' | 'triage'

interface SidebarItem {
  id: SidebarSection
  label: string
}

// REQUIREMENTS.md §7: orden confirmado — "Triage de Soporte" primero (arriba), "Tablero"
// segundo (debajo).
const ITEMS: SidebarItem[] = [
  { id: 'triage', label: 'Triage de Soporte' },
  { id: 'tablero', label: 'Tablero' },
]

interface SidebarProps {
  activeSection: SidebarSection
  onChange: (section: SidebarSection) => void
}

function TableroIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-5 w-5 flex-shrink-0"
    >
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.6" />
      <path d="M2.5 8h15" strokeLinecap="round" />
      <path d="M6 11.2h4" strokeLinecap="round" />
    </svg>
  )
}

function TriageIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-5 w-5 flex-shrink-0"
    >
      <path d="M4 15.5V10" strokeLinecap="round" />
      <path d="M10 15.5V4.5" strokeLinecap="round" />
      <path d="M16 15.5v-7" strokeLinecap="round" />
    </svg>
  )
}

// REQUIREMENTS.md §7 "Sidebar de navegación lateral — diseño compacto": ancho angosto
// fijo, cada ítem con el ícono arriba (suficientemente diciente por sí solo) y la
// etiqueta en texto pequeño debajo — no ícono+texto en la misma línea. Estilo por ítem:
// activo = fondo blanco, texto/ícono navy; inactivo = blanco sobre el fondo del sidebar.
function Sidebar({ activeSection, onChange }: SidebarProps) {
  return (
    <aside className="flex w-16 flex-shrink-0 flex-col bg-sidebar px-1.5 py-4">
      <nav className="flex flex-col gap-1.5">
        {ITEMS.map((item) => {
          const isActive = item.id === activeSection

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 rounded-md px-1 py-2.5 text-center text-[10px] font-medium leading-tight ${
                isActive ? 'bg-white text-navy' : 'text-white hover:bg-white/10'
              }`}
            >
              {item.id === 'tablero' ? <TableroIcon /> : <TriageIcon />}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
