import StatusBadge from './StatusBadge'

export default function AgentCard({ agent }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg hover:border-cyan-500/30 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${agent.status === 'active' || agent.status === 'processing' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
          <h3 className="font-medium text-sm text-slate-200">{agent.role}</h3>
        </div>
        <StatusBadge status={agent.status} />
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Task</p>
      <p className="text-sm font-medium text-cyan-400 truncate">{agent.task}</p>
    </div>
  )
}