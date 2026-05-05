import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import KnowledgeGraphPanel from '../components/KnowledgeGraphPanel';
import ExceptionRow from '../components/ExceptionRow';
import { DEMO_EXCEPTIONS, DEMO_AGENT_LOGS } from '../data/demoData';

/**
 * AgentActivityLog — Real-time feed of AI agent "thoughts"
 */
const AgentActivityLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const pollLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/agents/logs');
        const data = await response.json();
        setLogs(data.reverse());
      } catch (e) {
        if (logs.length === 0) {
          setLogs(DEMO_AGENT_LOGS);
        }
      }
    };
    const interval = setInterval(pollLogs, 2000);
    return () => clearInterval(interval);
  }, [logs.length]);

  const agentIcons = {
    'Supply Agent': '📦',
    'Quality Agent': '🔬',
    'Orchestrator': '🧠',
    'System': '⚙️',
  };

  return (
    <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4 shadow-xl flex flex-col h-[320px]">
      <h3 className="text-slate-100 font-bold text-sm mb-1 flex items-center gap-2 tracking-tight">
        <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
        AI Agent Live Feed
      </h3>
      <p className="text-[10px] text-slate-500 mb-3">What the AI agents are thinking right now</p>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className="border-l-2 border-cyan-500/40 pl-3 py-1">
            <p className="text-[10px] font-black text-cyan-400 uppercase leading-none mb-1">
              {agentIcons[log.agent] || '🤖'} {log.agent}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * KPI Card with tooltip for beginners
 */
const KPICard = ({ label, value, status, tooltip }) => (
  <div className="relative group bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl shadow-lg hover:border-slate-600 transition-colors">
    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      {label}
      <span className="text-slate-600 text-[10px] cursor-help" title={tooltip}>ⓘ</span>
    </p>
    <p className={`text-2xl font-bold ${
      status === 'critical' ? 'text-rose-500' : 
      status === 'warning' ? 'text-amber-400' : 
      'text-slate-100'
    }`}>{value}</p>
    {/* Tooltip */}
    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-700 border border-slate-600 rounded-lg p-2 text-[11px] text-slate-300 shadow-xl z-50">
      {tooltip}
    </div>
  </div>
);

/**
 * Mini Process Flow on Dashboard — shows at-a-glance where problems are
 */
const MiniProcessFlow = ({ exceptions }) => {
  const affectedNodes = new Set(exceptions.map(e => e.node));
  const steps = [
    { id: 'SUP_WAF', icon: '📦', label: 'Wafers' },
    { id: 'SUP_CHEM', icon: '🧪', label: 'Chemicals' },
    { id: 'MAC_ASML_1', icon: '🔬', label: 'Lithography' },
    { id: 'MAC_ETCH_1', icon: '⚡', label: 'Etching' },
    { id: 'MAC_CVD_1', icon: '🌡️', label: 'CVD' },
    { id: 'MAC_CMP_1', icon: '💎', label: 'CMP' },
    { id: 'SKU_H100', icon: '🧠', label: 'H100 Chip' },
  ];

  return (
    <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4 mb-6">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        🏭 Fab Status — Quick View
        <span className="text-[10px] text-slate-600 font-normal normal-case">(red = active problem)</span>
      </h3>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const isAffected = affectedNodes.has(step.id);
          return (
            <div key={step.id} className="flex items-center">
              <div className={`text-center px-2 py-2 rounded-lg transition-all min-w-[65px] ${
                isAffected
                  ? 'bg-red-500/15 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'bg-slate-800/40 border border-slate-700/30'
              }`}>
                <div className="text-lg">{step.icon}</div>
                <p className={`text-[9px] font-bold mt-0.5 ${isAffected ? 'text-red-400' : 'text-slate-400'}`}>{step.label}</p>
              </div>
              {idx < steps.length - 1 && <span className="text-slate-700 text-xs px-0.5">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---

export default function App() {
  const { user } = useAuth();
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('time');

  useEffect(() => {
    const fetchExceptions = async () => {
      try {
        const response = await fetch('http://localhost:8000/exceptions');
        const data = await response.json();
        setExceptions(data);
      } catch (e) {
        setExceptions(DEMO_EXCEPTIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchExceptions();
    const interval = setInterval(fetchExceptions, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamic KPIs based on active exceptions
  const criticalCount = exceptions.filter(e => e.severity === 'critical').length;
  const highCount = exceptions.filter(e => e.severity === 'high').length;
  
  // OEE drops ~2% per critical exception, ~1% per high exception
  const oeeBase = 95;
  const oeeValue = Math.max(60, oeeBase - (criticalCount * 2.5) - (highCount * 1.2) - (exceptions.length * 0.3));
  const oeeStatus = oeeValue < 80 ? 'critical' : oeeValue < 88 ? 'warning' : 'good';
  
  // OTIF drops ~1.5% per exception
  const otifBase = 98;
  const otifValue = Math.max(70, otifBase - (criticalCount * 2) - (highCount * 1) - (exceptions.length * 0.5));
  const otifStatus = otifValue < 90 ? 'critical' : otifValue < 95 ? 'warning' : 'good';

  const kpis = [
    { label: 'Fab OEE', value: `${oeeValue.toFixed(1)}%`, status: oeeStatus, tooltip: 'Overall Equipment Effectiveness — measures how efficiently our fab machines are running. Degrades when critical machine exceptions are active. Target: >85%' },
    { label: 'On-Time Delivery', value: `${otifValue.toFixed(1)}%`, status: otifStatus, tooltip: 'Percentage of chips shipped on time to customers. Drops when supplier or machine exceptions delay production. Target: >95%' },
    { label: 'Active Exceptions', value: exceptions.length.toString(), status: exceptions.length > 5 ? 'critical' : exceptions.length > 0 ? 'warning' : 'good', tooltip: 'Number of unresolved supply chain problems that need human or AI attention. Approve or dismiss exceptions to bring this down.' },
    { label: 'AI Agents Online', value: '3', status: 'active', tooltip: 'Your 3 LangGraph agents: Orchestrator (routes problems), Supply Agent (handles logistics), Quality Agent (handles machine failures).' },
  ];

  // Sorting Logic
  const sortedExceptions = [...exceptions].sort((a, b) => {
    if (sortBy === 'severity') {
      const weight = { critical: 4, high: 3, warning: 2, medium: 2, low: 1 };
      const weightA = weight[a.severity?.toLowerCase()] || 0;
      const weightB = weight[b.severity?.toLowerCase()] || 0;
      if (weightA !== weightB) return weightB - weightA;
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-slate-800/20 border border-cyan-800/30 rounded-xl p-5">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            Welcome to SemiCon AI Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            This dashboard monitors your semiconductor fab in real-time. When a problem occurs, AI agents automatically analyze the impact and recommend solutions.
          </p>
        </div>

        {/* KPI Section - Visible to Manager and Executive */}
        {['Manager', 'Executive'].includes(user?.role) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            {kpis.map((kpi, i) => (
              <KPICard key={i} label={kpi.label} value={kpi.value} status={kpi.status} tooltip={kpi.tooltip} />
            ))}
          </div>
        )}

        {/* Mini Process Flow */}
        <MiniProcessFlow exceptions={exceptions} />

        {/* Knowledge Graph Panel - Hidden for Auditor */}
        {user?.role !== 'Auditor' && <KnowledgeGraphPanel />}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Main Feed Section */}
          <div className="xl:col-span-2 bg-slate-800/20 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/40 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg text-slate-100 flex items-center gap-2 tracking-tight">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Active Exceptions
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Problems detected by AI — click any row to see full details and AI recommendation</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="time">Newest First</option>
                  <option value="severity">Most Critical</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col min-h-[400px]">
              {loading && sortedExceptions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 gap-3">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm">Connecting to Simulation Engine...</p>
                </div>
              ) : sortedExceptions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
                  <span className="text-4xl mb-3">✅</span>
                  <p className="text-sm font-medium">All clear! No active exceptions.</p>
                  <p className="text-xs text-slate-600 mt-1">The simulation engine creates a new exception every 30 seconds.</p>
                </div>
              ) : (
                sortedExceptions.map(exc => <ExceptionRow key={exc.id} exception={exc} />)
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <AgentActivityLog />

            <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-4 shadow-xl">
              <h2 className="font-bold text-slate-400 mb-1 tracking-widest uppercase text-[10px]">AI Agent Status</h2>
              <p className="text-[10px] text-slate-600 mb-3">These agents run 24/7 monitoring your fab</p>
              <div className="flex flex-col gap-3">
                {[
                  { role: 'Orchestrator', status: 'active', task: 'Routes exceptions to the right agent', icon: '🧠' },
                  { role: 'Supply Agent', status: 'active', task: 'Handles logistics & supplier delays', icon: '📦' },
                  { role: 'Quality Agent', status: 'active', task: 'Handles machine failures & defects', icon: '🔬' },
                ].map(agent => (
                  <div key={agent.role} className="bg-slate-800/30 border border-slate-700/30 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-200">{agent.icon} {agent.role}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                        ONLINE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{agent.task}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}