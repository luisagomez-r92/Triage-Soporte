import { useState } from 'react'
import Tabs from './components/Tabs'
import TableroGeneral from './features/tablero/TableroGeneral'
import NivelUnoRevision from './features/n1/NivelUnoRevision'
import NivelDosEspecialistas from './features/n2/NivelDosEspecialistas'
import PendienteCliente from './features/pendiente/PendienteCliente'

type TabId = 'tablero' | 'n1' | 'n2' | 'pendiente'

const TABS: { id: TabId; label: string }[] = [
  { id: 'tablero', label: 'Tablero general' },
  { id: 'n1', label: 'Nivel 1 – Revisión' },
  { id: 'n2', label: 'Nivel 2 – Especialistas' },
  { id: 'pendiente', label: 'Pendiente cliente' },
]

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('tablero')

  return (
    <div className="min-h-screen bg-fondo">
      <Tabs
        tabs={TABS}
        activeTabId={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />
      {activeTab === 'tablero' && <TableroGeneral />}
      {activeTab === 'n1' && <NivelUnoRevision />}
      {activeTab === 'n2' && <NivelDosEspecialistas />}
      {activeTab === 'pendiente' && <PendienteCliente />}
    </div>
  )
}

export default App
