import { getPendienteClienteAlert } from '../lib/pendienteClienteAlert'
import { formatDuration } from '../lib/time'

interface PendienteClienteAlertCardProps {
  pendienteDesde: string
}

// Misma caja que TimeElapsedCard (fondo lavanda), pero con el color/negrita/ícono
// escalonado y la cuenta regresiva de REQUIREMENTS.md §5 "Alerta de tiempo crítico en
// Pendiente cliente" — usada en el panel de detalle desplegable en vez del
// TimeElapsedCard genérico cuando el ticket está en "Pendiente cliente".
function PendienteClienteAlertCard({ pendienteDesde }: PendienteClienteAlertCardProps) {
  const alert = getPendienteClienteAlert(pendienteDesde)

  return (
    <div className="rounded-lg bg-lavanda px-3 py-2">
      <p className="text-xs text-navy/70">Sin respuesta</p>
      <p className={`text-sm ${alert.colorClass} ${alert.bold ? 'font-bold' : 'font-semibold'}`}>
        {alert.showIcon && <span aria-hidden="true">⚠️ </span>}
        {formatDuration(pendienteDesde)}
        {alert.showClosingSoonBadge && <span className="text-xs"> · Se cierra pronto</span>}
      </p>
      <p
        className={`mt-0.5 text-[11px] ${alert.isOverdue ? 'font-semibold text-rojo-alerta' : 'text-navy/60'}`}
      >
        {alert.countdownLabel}
      </p>
    </div>
  )
}

export default PendienteClienteAlertCard
