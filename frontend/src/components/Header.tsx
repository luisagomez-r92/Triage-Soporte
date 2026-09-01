// REQUIREMENTS.md §7 "Layout general — encabezado de marca y sidebar": logo en la
// esquina superior izquierda, visible en todas las pantallas de la app (no solo una
// pestaña) — por eso vive en App.tsx envolviendo todo, no dentro de una pestaña.
function Header() {
  return (
    <header className="flex h-14 flex-shrink-0 items-center border-b border-gray-200 bg-white px-4">
      <span className="text-lg font-bold tracking-tight text-navy">
        finkargo<span className="align-super text-[10px]">®</span>
      </span>
    </header>
  )
}

export default Header
