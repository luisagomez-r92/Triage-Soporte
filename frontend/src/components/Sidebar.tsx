// REQUIREMENTS.md §7 "Layout general — encabezado de marca y sidebar": columna fija a
// la izquierda, pensada como espacio para futuros módulos de Finkargo en la misma barra
// — hoy solo tiene el ítem del módulo actual, ya en su estado "activo" (regla de la
// sección 7: ítem activo = fondo blanco, texto/ícono navy; inactivo = blanco sobre el
// fondo del sidebar) porque es el único módulo disponible ahora mismo.
function Sidebar() {
  return (
    <aside className="flex w-fit flex-shrink-0 flex-col bg-sidebar px-3 py-4">
      <nav className="flex flex-col gap-1">
        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-navy">
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
          <span>Triage de Soporte</span>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
