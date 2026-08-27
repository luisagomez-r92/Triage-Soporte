interface SectionGroupHeaderProps {
  label: string
  count: number
}

function SectionGroupHeader({ label, count }: SectionGroupHeaderProps) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between first:mt-0">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </h2>
      <span className="text-xs font-medium text-gray-400">{count}</span>
    </div>
  )
}

export default SectionGroupHeader
