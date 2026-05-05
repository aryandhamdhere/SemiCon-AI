import React from 'react';

export default function AgentTrace({ trace = [] }) {
  if (!trace || trace.length === 0) {
    trace = [
      { agent: 'Orchestrator', action: 'Received Exception EX-101', time: '11:15 AM' },
      { agent: 'Supply Agent', action: 'Queried Graph for affected SKUs', time: '11:16 AM' },
      { agent: 'Quality Agent', action: 'Verified machine OEE targets on Line 4', time: '11:16 AM' },
      { agent: 'Supply Agent', action: 'Proposed rerouting shipment from Node C', time: '11:17 AM' },
    ];
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl mt-6">
      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="text-indigo-400">🧠</span> Agent Reasoning Trace
      </h3>
      <div className="relative border-l border-slate-600 ml-3">
        {trace.map((step, index) => (
          <div key={index} className="mb-6 ml-6 relative">
            <span className="absolute -left-8 top-1 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-slate-800"></span>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{step.agent}</p>
                <p className="text-sm text-slate-300 mt-1">{step.action}</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">{step.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
