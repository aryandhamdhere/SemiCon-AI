import React, { useState, useEffect } from 'react';

const PROCESS_STEPS = [
  {
    id: 'SUP_WAF', label: 'Silicon Wafers', sub: 'Global Wafers Ltd', type: 'supplier',
    icon: '📦', description: 'Ultra-pure 300mm silicon wafers shipped from Taiwan. Forms the base substrate for all chip manufacturing.',
    metrics: { 'Lead Time': '14 days', 'Safety Stock': '200 units', 'Cost/Unit': '$450' }
  },
  {
    id: 'SUP_CHEM', label: 'Photoresist', sub: 'Tokyo Ohka Kogyo', type: 'supplier',
    icon: '🧪', description: 'EUV-grade photoresist chemical from Japan. Light-sensitive coating applied before lithography.',
    metrics: { 'Lead Time': '7 days', 'Purity': '99.999%', 'Shelf Life': '90 days' }
  },
  {
    id: 'MAC_ASML_1', label: 'Photolithography', sub: 'EUV Stepper (ASML)', type: 'machine',
    icon: '🔬', description: 'Projects circuit patterns onto photoresist-coated wafers using extreme ultraviolet light (13.5nm wavelength). This is the most critical and expensive step.',
    metrics: { 'OEE Target': '95%', 'Resolution': '5nm', 'Cost': '$150M machine' }
  },
  {
    id: 'MAC_ETCH_1', label: 'Plasma Etching', sub: 'Plasma Etch Chamber', type: 'machine',
    icon: '⚡', description: 'Uses ionized gas plasma to selectively remove material from the wafer surface, creating the circuit pathways.',
    metrics: { 'OEE Target': '92%', 'Etch Rate': '200nm/min', 'Selectivity': '10:1' }
  },
  {
    id: 'SUP_GAS', label: 'Precursor Gas', sub: 'Air Liquide (France)', type: 'supplier',
    icon: '💨', description: 'Silane and Tungsten Hexafluoride gases from France. Used to deposit thin conductive and insulating films.',
    metrics: { 'Lead Time': '21 days', 'Purity': '99.9999%', 'Storage': 'Pressurized' }
  },
  {
    id: 'MAC_CVD_1', label: 'CVD Deposition', sub: 'Chemical Vapor Deposition', type: 'machine',
    icon: '🌡️', description: 'Deposits thin films of silicon dioxide, metals, or other materials onto the wafer in a high-temperature chamber.',
    metrics: { 'OEE Target': '90%', 'Temp': '400-800°C', 'Thickness': '5-500nm' }
  },
  {
    id: 'MAC_CMP_1', label: 'CMP Polishing', sub: 'Chemical Mechanical Polisher', type: 'machine',
    icon: '💎', description: 'Flattens the wafer surface between layers using a chemical slurry and mechanical polishing pad. Ensures layer uniformity.',
    metrics: { 'OEE Target': '88%', 'Flatness': '<1nm', 'Removal Rate': '100nm/min' }
  },
  {
    id: 'SKU_H100', label: 'H100 AI Chip', sub: 'Final Product', type: 'sku',
    icon: '🧠', description: 'The finished H100 Tensor Core GPU — the most advanced AI training chip in the world. Each wafer yields ~800 chips.',
    metrics: { 'Yield': '~70%', 'Price': '$25,000', 'Stock': '50 units' }
  },
  {
    id: 'SKU_NAND', label: '3D NAND Flash', sub: 'Final Product', type: 'sku',
    icon: '💾', description: '256-layer 3D NAND flash memory for enterprise SSDs. Used in cloud data center storage.',
    metrics: { 'Yield': '~85%', 'Price': '$12/GB', 'Stock': '500 units' }
  }
];

const typeColors = {
  supplier: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400', accent: '#3b82f6' },
  machine: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-400', accent: '#06b6d4' },
  sku: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400', accent: '#10b981' },
};

export default function ProcessFlow() {
  const [selectedStep, setSelectedStep] = useState(null);
  const [exceptions, setExceptions] = useState([]);

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

  const affectedNodeIds = new Set(exceptions.map(ex => ex.node));

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">🏭 Semiconductor Fab Process Flow</h2>
        <p className="text-sm text-slate-400 mt-1">
          Click on any step to see detailed information. Nodes with active exceptions are highlighted in red.
        </p>
      </div>

      {/* Main Process Flow */}
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-center gap-1">
          {PROCESS_STEPS.map((step, idx) => {
            const isAffected = affectedNodeIds.has(step.id);
            const isSelected = selectedStep?.id === step.id;
            const colors = typeColors[step.type];
            const relatedExceptions = exceptions.filter(e => e.node === step.id);

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Card */}
                <div
                  onClick={() => setSelectedStep(isSelected ? null : step)}
                  className={`relative cursor-pointer transition-all duration-300 rounded-xl p-4 min-w-[130px] text-center border-2 ${
                    isAffected
                      ? 'border-red-500 bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-105'
                      : isSelected
                        ? `${colors.border} ${colors.bg} shadow-lg scale-105`
                        : `border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:scale-[1.02]`
                  }`}
                >
                  {/* Exception Badge */}
                  {isAffected && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                      {relatedExceptions.length}
                    </span>
                  )}

                  <div className="text-2xl mb-1">{step.icon}</div>
                  <p className={`text-xs font-bold ${isAffected ? 'text-red-400' : colors.text}`}>{step.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{step.sub}</p>

                  {/* Type Tag */}
                  <div className={`mt-2 inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    isAffected ? 'bg-red-500/20 text-red-400' : `${colors.bg} ${colors.text}`
                  }`}>
                    {step.type}
                  </div>
                </div>

                {/* Arrow */}
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="text-slate-600 text-lg px-1 font-light flex-shrink-0">→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedStep && (
        <div className={`border rounded-xl p-6 mb-6 transition-all animate-fade-in ${
          affectedNodeIds.has(selectedStep.id)
            ? 'bg-red-500/5 border-red-500/30'
            : `${typeColors[selectedStep.type].bg} ${typeColors[selectedStep.type].border}`
        }`}>
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedStep.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedStep.label}</h3>
                  <p className={`text-xs font-bold uppercase tracking-wider ${typeColors[selectedStep.type].text}`}>
                    {selectedStep.sub} — {selectedStep.type}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{selectedStep.description}</p>
            </div>
            <span className="font-mono text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{selectedStep.id}</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {Object.entries(selectedStep.metrics).map(([key, val]) => (
              <div key={key} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{key}</p>
                <p className="text-sm font-bold text-slate-200">{val}</p>
              </div>
            ))}
          </div>

          {/* Active Exceptions on this node */}
          {exceptions.filter(e => e.node === selectedStep.id).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">⚠️ Active Exceptions on this Node</h4>
              {exceptions.filter(e => e.node === selectedStep.id).map(ex => (
                <div key={ex.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-2 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs text-red-400 mr-2">EX-{ex.id}</span>
                    <span className="text-sm text-red-200">{ex.title}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    {ex.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 bg-slate-800/20 border border-slate-700/50 rounded-xl p-3">
        {Object.entries(typeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors.accent }} />
            <span className="text-xs font-semibold text-slate-300 uppercase">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-400 uppercase">Exception Active</span>
        </div>
      </div>
    </div>
  );
}
