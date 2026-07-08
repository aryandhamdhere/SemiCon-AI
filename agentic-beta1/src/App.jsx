import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SidePanel from './components/SidePanel'
import Dashboard from './pages/Dashboard'
import SupplyMap from './pages/SupplyMap'
import ProcessFlow from './pages/ProcessFlow'
import ArchDiagram from './pages/ArchDiagram'
import ExceptionDetail from './pages/ExceptionDetail'
import ExecutiveView from './pages/ExecutiveView'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <div className="flex">
        <main className="flex-1 p-6 max-w-[1600px]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<SupplyMap />} />
            <Route path="/process" element={<ProcessFlow />} />
            <Route path="/architecture" element={<ArchDiagram />} />
            <Route path="/analytics" element={<ExecutiveView />} />
            <Route path="/exception/:id" element={<ExceptionDetail />} />
          </Routes>
        </main>
        <SidePanel />
      </div>
    </div>
  )
}

export default App