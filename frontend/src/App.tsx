import { useState } from 'react'
import Tabs from './components/Tabs'
import TableroGeneral from './features/tablero/TableroGeneral'
import NivelUnoRevision from './features/n1/NivelUnoRevision'
import NivelDosEspecialistas from './features/n2/NivelDosEspecialistas'
import PendienteCliente from './features/pendiente/PendienteCliente'
import { useTickets } from './hooks/useTickets'

type TabId = 'tablero' | 'n1' | 'n2' | 'pendiente'

const TABS: { id: TabId; label: string }[] = [
  { id: 'tablero', label: 'Tablero general' },
  { id: 'n1', label: 'Nivel 1 – Revisión' },
  { id: 'n2', label: 'Nivel 2 – Especialistas' },
  { id: 'pendiente', label: 'Pendiente cliente' },
]

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('tablero')
  const { tickets, loading, error, refetch } = useTickets()

  return (
    <div className="min-h-screen bg-fondo">
      <Tabs
        tabs={TABS}
        activeTabId={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      {loading && (
        <div className="p-6 text-sm text-gray-500">Cargando tickets desde Jira…</div>
      )}

      {!loading && error && (
        <div className="p-6">
          <div className="rounded-lg border border-naranja/30 bg-naranja/10 px-4 py-3 text-sm text-naranja">
            <p className="font-medium">No se pudieron cargar los tickets desde Jira.</p>
            <p className="mt-1 text-xs">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-3 rounded-full border border-naranja px-3 py-1 text-xs font-medium hover:bg-naranja/10"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === 'tablero' && <TableroGeneral tickets={tickets} />}
          {activeTab === 'n1' && <NivelUnoRevision tickets={tickets} />}
          {activeTab === 'n2' && <NivelDosEspecialistas tickets={tickets} />}
          {activeTab === 'pendiente' && <PendienteCliente tickets={tickets} />}
        </>
      )}
    </div>
  )
}

export default App
