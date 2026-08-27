interface TimeElapsedCardProps {
  label: string
  value: string
}

function TimeElapsedCard({ label, value }: TimeElapsedCardProps) {
  return (
    <div className="rounded-lg bg-lavanda px-3 py-2">
      <p className="text-xs text-navy/70">{label}</p>
      <p className="text-sm font-semibold text-navy">{value}</p>
    </div>
  )
}

export default TimeElapsedCard
