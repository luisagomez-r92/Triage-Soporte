interface ProgressRingProps {
  percent: number
}

const SIZE = 28
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// REQUIREMENTS.md — círculo de progreso tipo dona junto al número de ticket, exclusivo del
// Tablero general. Es adicional a ProgressBar (barra lineal), no la reemplaza — mismo dato
// de porcentaje, solo una representación compacta distinta.
function ProgressRing({ percent }: ProgressRingProps) {
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE

  return (
    <span
      className="relative inline-flex flex-shrink-0 items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-gray-200"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-accent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[7px] font-bold text-navy">{percent}%</span>
    </span>
  )
}

export default ProgressRing
