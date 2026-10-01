// Ícono compacto para el botón "Abrir en Slack" del Kanban (Tablero) — mismo estilo de
// trazo que los íconos del sidebar (viewBox 20x20, currentColor), no el logo oficial de
// Slack a color, para mantener consistencia visual con el resto de la app.
function SlackIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-3.5 w-3.5 flex-shrink-0"
    >
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.6" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.6" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.6" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.6" />
    </svg>
  )
}

export default SlackIcon
