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
      className="h-4 w-4 flex-shrink-0"
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
      className="h-4 w-4 flex-shrink-0"
    >
      <path d="M4 15.5V10" strokeLinecap="round" />
      <path d="M10 15.5V4.5" strokeLinecap="round" />
      <path d="M16 15.5v-7" strokeLinecap="round" />
    </svg>
  )
}

// REQUIREMENTS.md §7 "Layout general — encabezado de marca, sidebar y título de página":
// dos ítems de navegación (reestructuración confirmada) — "Tablero" (las 4 pestañas ya
// existentes, sin cambios de funcionalidad) y "Triage de Soporte" (nueva vista resumen,
// placeholder por ahora). Estilo por ítem: activo = fondo blanco, texto/ícono navy;
// inactivo = blanco sobre el fondo del sidebar.
function Sidebar({ activeSection, onChange }: SidebarProps) {
  return (
    <aside className="flex w-fit flex-shrink-0 flex-col bg-sidebar px-3 py-4">
      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => {
          const isActive = item.id === activeSection

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium ${
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
