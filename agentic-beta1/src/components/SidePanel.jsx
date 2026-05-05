export default function SidePanel() {
  const logs = [
    { id: 1, time: '12:40:02', agent: 'Procurement-Bot', action: 'Scanning supplier lead times...' },
    { id: 2, time: '12:41:15', agent: 'Logistics-AI', action: 'Rerouting Shipment #4492 due to weather.' },
    { id: 3, time: '12:42:01', agent: 'Inventory-Agent', action: 'Safety stock threshold reached for Part A-12.' },
  ];

  return (
    <div className="w-80 bg-slate-900/50 border-l border-slate-700 h-[calc(100vh-73px)] p-4 overflow-y-auto hidden 2xl:block">
      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
        Agent Activity Log
      </h3>
      
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border-l-2 border-slate-700 pl-3 py-1">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-cyan-500 font-mono">{log.time}</span>
              <span className="text-slate-500 font-bold uppercase">{log.agent}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {log.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}