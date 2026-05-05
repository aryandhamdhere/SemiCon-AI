import React from 'react';

export default function ImpactMap({ data }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl mt-6">
      <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="text-rose-400">💥</span> Impact Cascade
      </h3>
      
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between mt-4 p-6 bg-slate-900/50 rounded-lg overflow-x-auto">
        <div className="flex flex-col items-center">
          <div className="bg-blue-500/20 border border-blue-500 p-4 rounded-lg text-center min-w-[140px] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <span className="block text-xs text-blue-300 uppercase mb-1 font-semibold">Supplier</span>
            <span className="font-bold text-white">Global Steel</span>
          </div>
        </div>
        
        <div className="text-slate-500 text-2xl font-bold animate-pulse">→</div>
        
        <div className="flex flex-col items-center">
          <div className="bg-emerald-500/20 border border-emerald-500 p-4 rounded-lg text-center min-w-[140px] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="block text-xs text-emerald-300 uppercase mb-1 font-semibold">Affected SKU</span>
            <span className="font-bold text-white">Steel Sheet</span>
          </div>
        </div>
        
        <div className="text-slate-500 text-2xl font-bold animate-pulse">→</div>

        <div className="flex flex-col items-center">
          <div className="bg-amber-500/20 border border-amber-500 p-4 rounded-lg text-center min-w-[140px] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="block text-xs text-amber-300 uppercase mb-1 font-semibold">Machine</span>
            <span className="font-bold text-white">Line 4</span>
          </div>
        </div>
        
        <div className="text-slate-500 text-2xl font-bold animate-pulse">→</div>

        <div className="flex flex-col items-center">
          <div className="bg-rose-500/20 border border-rose-500 p-4 rounded-lg text-center min-w-[140px] shadow-[0_0_15px_rgba(243,64,122,0.2)]">
            <span className="block text-xs text-rose-300 uppercase mb-1 font-semibold">At Risk Order</span>
            <span className="font-bold text-white">ORD-5592</span>
          </div>
        </div>
      </div>
    </div>
  );
}
