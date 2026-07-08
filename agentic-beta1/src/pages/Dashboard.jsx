import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import KnowledgeGraphPanel from '../components/KnowledgeGraphPanel';
import ExceptionRow from '../components/ExceptionRow';
import { DEMO_EXCEPTIONS, DEMO_AGENT_LOGS } from '../data/demoData';
import { Package, Microscope, BrainCircuit, Settings, Bot, Factory, TestTube, Zap, Thermometer, Gem, CheckCircle } from 'lucide-react';

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
    'Supply Agent': <Package className="w-3 h-3 inline-block" />,
    'Quality Agent': <Microscope className="w-3 h-3 inline-block" />,
    'Orchestrator': <BrainCircuit className="w-3 h-3 inline-block" />,
    'System': <Settings className="w-3 h-3 inline-block" />,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-[320px]">
      <h3 className="text-slate-900 font-bold text-base mb-1 flex items-center gap-2 tracking-tight">
        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        AI Agent Live Feed
      </h3>
      <p className="text-xs text-slate-500 mb-3">What the AI agents are thinking right now</p>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {logs.map((log, i) => (
          <div key={i} className="border-l-2 border-blue-500/40 pl-3 py-1">
            <p className="text-xs font-black text-blue-600 uppercase leading-none mb-1 flex items-center gap-1">
              {agentIcons[log.agent] || <Bot className="w-3 h-3 inline-block" />} {log.agent}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{log.message}</p>
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
  <div className="relative group bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
      {label}
      <span className="text-slate-400 text-xs cursor-help" title={tooltip}>ⓘ</span>
    </p>
    <p className={`text-3xl font-bold ${
      status === 'critical' ? 'text-rose-600' : 
      status === 'warning' ? 'text-amber-500' : 
      'text-slate-900'
    }`}>{value}</p>
    {/* Tooltip */}
    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white border border-slate-200 rounded-lg p-2 text-[11px] text-slate-700 shadow-xl z-50">
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
    { id: 'SUP_WAF', icon: <Package className="w-6 h-6 mx-auto" />, label: 'Wafers' },
    { id: 'SUP_CHEM', icon: <TestTube className="w-6 h-6 mx-auto" />, label: 'Chemicals' },
    { id: 'MAC_ASML_1', icon: <Microscope className="w-6 h-6 mx-auto" />, label: 'Lithography' },
    { id: 'MAC_ETCH_1', icon: <Zap className="w-6 h-6 mx-auto" />, label: 'Etching' },
    { id: 'MAC_CVD_1', icon: <Thermometer className="w-6 h-6 mx-auto" />, label: 'CVD' },
    { id: 'MAC_CMP_1', icon: <Gem className="w-6 h-6 mx-auto" />, label: 'CMP' },
    { id: 'SKU_H100', icon: <BrainCircuit className="w-6 h-6 mx-auto" />, label: 'H100 Chip' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Factory className="w-4 h-4" /> Fab Status — Quick View
        <span className="text-xs text-slate-400 font-normal normal-case">(red = active problem)</span>
      </h3>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const isAffected = affectedNodes.has(step.id);
          return (
            <div key={step.id} className="flex items-center">
              <div className={`text-center px-2 py-2 rounded-lg transition-all min-w-[80px] ${
                isAffected
                  ? 'bg-red-50 border border-red-200 shadow-sm'
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                <div className="text-lg">{step.icon}</div>
                <p className={`text-[11px] font-bold mt-1 ${isAffected ? 'text-red-600' : 'text-slate-600'}`}>{step.label}</p>
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
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans selection:bg-blue-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">

        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to SemiCon AI Command Center
          </h1>
          <p className="text-base text-slate-600 mt-2">
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
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg text-slate-900 flex items-center gap-2 tracking-tight">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Active Exceptions
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Problems detected by AI — click any row to see full details and AI recommendation</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-300 text-xs text-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 transition-colors shadow-sm"
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
                  <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                  <p className="text-sm font-medium">All clear! No active exceptions.</p>
                  <p className="text-xs text-slate-600 mt-1">The simulation engine creates a new exception every 30 seconds.</p>
                </div>
              ) : (
                sortedExceptions.map(exc => <ExceptionRow key={exc.id} exception={exc} />)
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <AgentActivityLog />

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-slate-600 mb-1 tracking-widest uppercase text-xs">AI Agent Status</h2>
              <p className="text-xs text-slate-500 mb-3">These agents run 24/7 monitoring your fab</p>
              <div className="flex flex-col gap-3">
                {[
                  { role: 'Orchestrator', status: 'active', task: 'Routes exceptions to the right agent', icon: <BrainCircuit className="w-3 h-3" /> },
                  { role: 'Supply Agent', status: 'active', task: 'Handles logistics & supplier delays', icon: <Package className="w-3 h-3" /> },
                  { role: 'Quality Agent', status: 'active', task: 'Handles machine failures & defects', icon: <Microscope className="w-3 h-3" /> },
                ].map(agent => (
                  <div key={agent.role} className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">{agent.icon} {agent.role}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border text-green-700 border-green-200 bg-green-50">
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