interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTabId: string
  onChange: (id: string) => void
}

function Tabs({ tabs, activeTabId, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-gray-200 bg-white px-4">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-t-md border-b-[2.5px] px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-navy bg-lavanda text-navy'
                : 'border-transparent text-gray-500 hover:text-navy'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
