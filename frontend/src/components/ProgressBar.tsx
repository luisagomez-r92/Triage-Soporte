interface ProgressBarProps {
  percent: number
}

function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-accent transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default ProgressBar
