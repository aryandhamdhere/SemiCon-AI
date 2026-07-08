import React, { useState, useEffect } from 'react';

export default function SidePanel() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const pollLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/agents/logs');
        const data = await response.json();
        setLogs(data.reverse());
      } catch (e) {
        // handle error silently
      }
    };
    pollLogs();
    const interval = setInterval(pollLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-[calc(100vh-73px)] p-4 overflow-y-auto hidden 2xl:block">
      <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
        Agent Activity Log
      </h3>
      
      <div className="space-y-4">
        {logs.map((log, index) => (
          <div key={index} className="border-l-4 border-slate-200 pl-4 py-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-600 font-mono">{log.time || new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
              <span className="text-slate-500 font-bold uppercase">{log.agent}</span>
            </div>
            <p className="text-base text-slate-700 leading-relaxed">
              {log.message}
            </p>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-sm text-slate-500 italic">No agent activity yet...</p>
        )}
      </div>
    </div>
  )
}