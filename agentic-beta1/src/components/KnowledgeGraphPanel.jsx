import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

/**
 * KnowledgeGraphPanel
 * Renders an interactive 2D force-directed graph from Neo4j data.
 */
export default function KnowledgeGraphPanel() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // 1. Fetch graph data from the FastAPI backend
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch('http://localhost:8000/graph/visualize');
        const data = await response.json();
        setGraphData(data);
      } catch (error) {
        console.error("Error fetching Neo4j data:", error);
        // Mock data fallback for preview purposes if backend is unreachable
        setGraphData({
          nodes: [
            { id: 'SUP_001', label: 'Supplier', name: 'Global Microchip Co' },
            { id: 'SKU_APP_01', label: 'SKU', name: 'M3 Processor' },
            { id: 'MAC_LINE_1', label: 'Machine', name: 'Precision Assembler A' }
          ],
          links: [
            { source: 'SUP_001', target: 'SKU_APP_01', type: 'SUPPLIES' },
            { source: 'MAC_LINE_1', target: 'SKU_APP_01', type: 'PRODUCES' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, []);

  // 2. Responsive Resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 400
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  // 3. Node Color Logic
  const getNodeColor = (node) => {
    switch (node.label) {
      case 'Supplier': return '#3b82f6'; // Blue
      case 'SKU':      return '#10b981'; // Green
      case 'Machine':  return '#f59e0b'; // Orange
      default:         return '#94a3b8'; // Slate
    }
  };

  return (
    <div 
      className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl mb-6" 
      ref={containerRef}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
        <div>
          <h3 className="text-slate-100 font-bold text-lg flex items-center gap-2">
            <span className="text-cyan-400">🕸️</span> Knowledge Graph Visualizer
          </h3>
          <p className="text-slate-400 text-xs">Tracing Supply Chain Dependencies (Neo4j)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Live Sync</span>
        </div>
      </div>

      {/* Graph Display Area */}
      <div className="relative bg-[#0b0f1a] h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <span className="text-slate-500 text-sm">Loading Graph Data...</span>
          </div>
        ) : (
          <ForceGraph2D
            width={dimensions.width}
            height={400}
            graphData={graphData}
            nodeLabel={(node) => `${node.label}: ${node.name}`}
            nodeColor={getNodeColor}
            nodeRelSize={8}
            linkColor={() => '#334155'}
            linkWidth={1.5}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            backgroundColor="#0b0f1a"
          />
        )}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 bg-slate-800/20 border-t border-slate-700/50 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
          <span className="text-xs font-semibold text-slate-300 uppercase">Supplier</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-xs font-semibold text-slate-300 uppercase">SKU</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
          <span className="text-xs font-semibold text-slate-300 uppercase">Machine</span>
        </div>
      </div>
    </div>
  );
}