import StatusBadge from './StatusBadge'

export default function KPICard({ label, value, status }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-xl flex flex-col justify-between hover:bg-slate-800/60 transition-colors">
      <div className="text-slate-400 text-sm font-medium mb-3">{label}</div>
      <div className="flex justify-between items-end">
        <div className="text-3xl font-bold text-slate-100 tracking-tight">{value}</div>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}