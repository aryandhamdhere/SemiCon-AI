import React, { useState, useEffect } from 'react';

// Real semiconductor supply chain nodes with approximate world-map positions
const SUPPLY_NODES = [
  { id: 'SUP_WAF', name: 'Global Wafers Ltd', type: 'Supplier', country: 'Taiwan', city: 'Hsinchu', 
    x: 76, y: 42, risk: 0.15, status: 'active', detail: 'Silicon Wafer Supplier — 300mm wafers for EUV lithography' },
  { id: 'SUP_CHEM', name: 'Tokyo Ohka Kogyo', type: 'Supplier', country: 'Japan', city: 'Kawasaki',
    x: 79, y: 37, risk: 0.05, status: 'active', detail: 'Photoresist Chemical Supplier — EUV-grade photoresist' },
  { id: 'SUP_GAS', name: 'Air Liquide', type: 'Supplier', country: 'France', city: 'Paris',
    x: 48, y: 32, risk: 0.10, status: 'active', detail: 'Precursor Gas Supplier — Silane, Tungsten Hexafluoride' },
  { id: 'FAB_HQ', name: 'SemiCon Fab HQ', type: 'Fab', country: 'USA', city: 'Phoenix, AZ',
    x: 22, y: 39, risk: 0.00, status: 'active', detail: 'Main Fabrication Facility — All machines located here' },
  { id: 'MAC_ASML_1', name: 'EUV Stepper', type: 'Machine', country: 'USA', city: 'Phoenix, AZ',
    x: 22, y: 39, risk: 0.00, status: 'active', detail: 'Photolithography — patterns circuits onto silicon wafers' },
  { id: 'MAC_ETCH_1', name: 'Plasma Etcher', type: 'Machine', country: 'USA', city: 'Phoenix, AZ',
    x: 22, y: 39, risk: 0.00, status: 'active', detail: 'Etching — removes unwanted material from wafer surface' },
  { id: 'MAC_CVD_1', name: 'CVD Reactor', type: 'Machine', country: 'USA', city: 'Phoenix, AZ',
    x: 22, y: 39, risk: 0.00, status: 'active', detail: 'Deposition — deposits thin films of material on wafers' },
  { id: 'MAC_CMP_1', name: 'CMP Polisher', type: 'Machine', country: 'USA', city: 'Phoenix, AZ',
    x: 22, y: 39, risk: 0.00, status: 'active', detail: 'Planarization — smooths wafer surface between layers' },
  { id: 'DIST_APAC', name: 'APAC Distribution', type: 'Distribution', country: 'Singapore', city: 'Singapore',
    x: 72, y: 55, risk: 0.12, status: 'active', detail: 'Ships finished H100 chips to APAC server OEMs' },
  { id: 'DIST_EU', name: 'EU Distribution', type: 'Distribution', country: 'Netherlands', city: 'Amsterdam',
    x: 49, y: 30, risk: 0.08, status: 'active', detail: 'Ships finished chips to European cloud data centers' },
];

// Routes between nodes (supply chain links)
const SUPPLY_ROUTES = [
  { from: 'SUP_WAF', to: 'FAB_HQ', label: 'Silicon Wafers' },
  { from: 'SUP_CHEM', to: 'FAB_HQ', label: 'Photoresist' },
  { from: 'SUP_GAS', to: 'FAB_HQ', label: 'Precursor Gas' },
  { from: 'FAB_HQ', to: 'DIST_APAC', label: 'H100 Chips' },
  { from: 'FAB_HQ', to: 'DIST_EU', label: 'NAND Flash' },
];

const typeColors = {
  Supplier: { dot: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', glow: 'rgba(59,130,246,0.5)' },
  Fab: { dot: 'bg-cyan-400', border: 'border-cyan-400', text: 'text-cyan-400', glow: 'rgba(6,182,212,0.6)' },
  Machine: { dot: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400', glow: 'rgba(245,158,11,0.5)' },
  Distribution: { dot: 'bg-green-500', border: 'border-green-500', text: 'text-green-400', glow: 'rgba(34,197,94,0.5)' },
};

export default function SupplyMap() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchExceptions = async () => {
      try {
        const res = await fetch('http://localhost:8000/exceptions');
        const data = await res.json();
        setExceptions(data);
      } catch (e) { /* silent */ }
    };
    fetchExceptions();
    const interval = setInterval(fetchExceptions, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check which nodes have active exceptions
  const affectedNodeIds = new Set(exceptions.map(ex => ex.node));

  // Visible nodes based on filter
  const visibleNodes = SUPPLY_NODES.filter(n => {
    if (n.type === 'Machine') return false; // Machines are inside the Fab
    if (selectedFilter === 'all') return true;
    return n.type === selectedFilter;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">🌍 Global Supply Network</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time view of our semiconductor supply chain across the world</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 font-medium">FILTER:</span>
          {['all', 'Supplier', 'Fab', 'Distribution'].map(f => (
            <button key={f} onClick={() => setSelectedFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border font-semibold transition-all ${
                selectedFilter === f
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >{f === 'all' ? 'All Nodes' : f}</button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-[#0a0e1a] border border-slate-700/50 rounded-xl overflow-hidden" style={{ minHeight: '520px' }}>
        {/* World Map Background */}
        <div className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg")',
            backgroundSize: '95%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            filter: 'invert(1) sepia(1) saturate(5) hue-rotate(175deg)'
          }}
        />

        {/* Connecting Routes */}
        <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {SUPPLY_ROUTES.map((route, i) => {
            const from = SUPPLY_NODES.find(n => n.id === route.from);
            const to = SUPPLY_NODES.find(n => n.id === route.to);
            if (!from || !to) return null;
            const isAffected = affectedNodeIds.has(route.from) || affectedNodeIds.has(route.to);
            return (
              <line key={i}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={isAffected ? '#ef4444' : '#06b6d4'}
                strokeWidth="0.3"
                strokeDasharray={isAffected ? '1,0.5' : '0.8,0.4'}
                opacity={isAffected ? 0.8 : 0.3}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {visibleNodes.map(node => {
          const isAffected = affectedNodeIds.has(node.id);
          const colors = typeColors[node.type] || typeColors.Fab;
          return (
            <div key={node.id}
              className="absolute z-10 cursor-pointer group"
              style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Pulse ring for affected nodes */}
              {isAffected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-500/30 animate-ping" />
                </div>
              )}

              {/* Node Dot */}
              <div className={`relative w-4 h-4 rounded-full border-2 border-slate-900 ${isAffected ? 'bg-red-500' : colors.dot}`}
                style={{ boxShadow: `0 0 12px ${isAffected ? 'rgba(239,68,68,0.7)' : colors.glow}` }}
              />

              {/* Label */}
              <div className="mt-1 text-center whitespace-nowrap">
                <span className={`font-mono text-[9px] ${isAffected ? 'text-red-400 font-bold' : 'text-slate-500'} bg-slate-900/80 px-1 rounded`}>
                  {node.city}
                </span>
              </div>

              {/* Tooltip */}
              {hoveredNode === node.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isAffected ? 'bg-red-500' : colors.dot}`} />
                    <span className="font-bold text-slate-100 text-sm">{node.name}</span>
                  </div>
                  <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${isAffected ? 'text-red-400' : colors.text}`}>
                    {isAffected ? '⚠️ ACTIVE EXCEPTION' : node.type}
                  </p>
                  <p className="text-xs text-slate-400 leading-snug mb-2">{node.detail}</p>
                  <div className="text-xs text-slate-500 flex justify-between border-t border-slate-700 pt-2 mt-2">
                    <span>Risk: <strong className={isAffected ? 'text-red-400' : 'text-slate-300'}>{(node.risk * 100).toFixed(0)}%</strong></span>
                    <span>{node.country}</span>
                  </div>
                  {/* Show which exceptions affect this node */}
                  {isAffected && exceptions.filter(e => e.node === node.id).map(ex => (
                    <div key={ex.id} className="mt-2 bg-red-500/10 border border-red-500/30 rounded p-2 text-xs text-red-300">
                      EX-{ex.id}: {ex.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-6 bg-slate-800/20 border border-slate-700/50 rounded-xl p-3">
        {Object.entries(typeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors.dot}`} style={{ boxShadow: `0 0 6px ${colors.glow}` }} />
            <span className="text-xs font-semibold text-slate-300 uppercase">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 6px rgba(239,68,68,0.7)' }} />
          <span className="text-xs font-semibold text-red-400 uppercase">Active Exception</span>
        </div>
      </div>
    </div>
  );
}