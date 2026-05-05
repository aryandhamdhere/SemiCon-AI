import React from 'react';
// Import the image from the assets folder
import archImg from '../assets/architecture-diagram.png';

export default function ArchDiagram() {
  return (
    <div className="animate-fade-in flex flex-col h-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-slate-100 tracking-tight">System Architecture</h2>
      <p className="text-slate-400 mb-6">High-level overview of the Agentic Supply Chain data flow and AI integration.</p>

      {/* Image Container */}
      <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 flex items-center justify-center min-h-[500px]">
        
        {/* The actual image */}
        <img 
          src={archImg} 
          alt="System Architecture Diagram" 
          className="max-w-full h-auto rounded-lg shadow-2xl border border-slate-600" 
        />

      </div>
    </div>
  );
}