export default function StatusBadge({ status }) {
  const colors = {
    good: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    neutral: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const colorClass = colors[status?.toLowerCase()] || colors.neutral;

  return (
    <span className={`px-2.5 py-0.5 text-[10px] rounded border ${colorClass} uppercase tracking-wider font-bold`}>
      {status}
    </span>
  )
}