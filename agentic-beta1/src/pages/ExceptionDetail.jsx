import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from '../components/StatusBadge';
import AgentTrace from '../components/AgentTrace';
import ImpactMap from '../components/ImpactMap';

const SEVERITY_CONFIG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: '🔴' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: '🟠' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: '🟡' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: '🟡' },
  low: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '🟢' },
};

function TypingEffect({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

export default function ExceptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState(null); // 'approved' | 'escalated' | 'dismissed'
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/exceptions/${id}/details`);
      if (!response.ok) throw new Error('Not found');
      const result = await response.json();
      setData(result);
      return result;
    } catch (error) {
      console.error("Error fetching details:", error);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const result = await fetchDetails();
      setLoading(false);

      // If no recommendation yet, start polling every 5 seconds
      const hasRec = result?.actions?.length > 0 && result.actions[result.actions.length - 1]?.recommendation;
      if (!hasRec) {
        setPolling(true);
        pollRef.current = setInterval(async () => {
          const fresh = await fetchDetails();
          const rec = fresh?.actions?.length > 0 && fresh.actions[fresh.actions.length - 1]?.recommendation;
          if (rec) {
            clearInterval(pollRef.current);
            setPolling(false);
          }
        }, 5000);
      }
    };
    init();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  const handleAction = async (actionType) => {
    try {
      await axios.put(`http://localhost:8000/exceptions/${id}/${actionType}`);
      setActionStatus(actionType);
      if (actionType !== 'escalate') {
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      console.error(`Error performing ${actionType}:`, err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Loading intelligence from Knowledge Graph...</p>
    </div>
  );

  if (!data) return (
    <div className="text-center p-12 text-red-400">Could not load exception. Backend may be offline.</div>
  );

  const exceptionData = data.exception;
  const latestAction = data.actions?.length > 0 ? data.actions[data.actions.length - 1] : null;
  const recommendation = latestAction?.recommendation;
  const sev = SEVERITY_CONFIG[exceptionData.severity?.toLowerCase()] || SEVERITY_CONFIG.low;
  const detectedAt = exceptionData.created_at
    ? new Date(exceptionData.created_at.endsWith('Z') ? exceptionData.created_at : exceptionData.created_at + 'Z').toLocaleString()
    : 'Just now';

  const nodeType = exceptionData.node?.startsWith('MAC_') ? 'Machine' :
                   exceptionData.node?.startsWith('SUP_') ? 'Supplier' : 'Node';

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-16">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors"
      >
        ← Back to Dashboard
      </button>

      {/* Action Status Toast */}
      {actionStatus && (
        <div className={`mb-4 p-3 rounded-lg border text-sm font-medium flex items-center gap-2 ${
          actionStatus === 'escalated' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' :
          actionStatus === 'approved' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
          'bg-slate-500/10 border-slate-500/30 text-slate-300'
        }`}>
          {actionStatus === 'escalated' ? '⬆️ Escalated to Executive Review' :
           actionStatus === 'approved' ? '✅ Resolution Approved — Redirecting...' :
           '🗑️ Exception Dismissed — Redirecting...'}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-mono text-sm text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">EX-{exceptionData.id}</span>
              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border ${sev.bg} ${sev.color}`}>
                {sev.icon} {exceptionData.severity}
              </span>
              {exceptionData.status === 'escalated' && (
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border bg-purple-500/10 text-purple-400 border-purple-500/30">⬆ Escalated</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">{exceptionData.title}</h1>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-5 border-t border-slate-700/50">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Affected {nodeType}</p>
            <p className="font-mono text-sm font-medium text-slate-200">{exceptionData.node}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Detected At</p>
            <p className="text-sm font-medium text-slate-200">{detectedAt}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Detecting Agent</p>
            <p className="text-sm font-medium text-cyan-400">{latestAction?.agent_name || 'Orchestrator'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(latestAction?.confidence || 0) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-300 font-mono">{Math.round((latestAction?.confidence || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis + AI Recommendation Side by Side */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Situation Analysis */}
        <div className="bg-slate-800/30 border border-slate-700/40 p-6 rounded-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">📋 Situation Analysis</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{exceptionData.description || 'No description provided.'}</p>
          {data.impact && (
            <div className={`p-3 rounded-lg border flex items-start gap-3 ${sev.bg}`}>
              <span className={`${sev.color} font-bold shrink-0 mt-0.5`}>⚡</span>
              <p className={`text-sm ${sev.color} leading-snug`}>{data.impact}</p>
            </div>
          )}
        </div>

        {/* AI Recommendation */}
        <div className="bg-cyan-950/30 border border-cyan-700/40 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${polling ? 'bg-yellow-400 animate-pulse' : 'bg-cyan-400'}`} />
            {polling ? 'Gemini AI Analyzing...' : 'Gemini AI Recommendation'}
          </h3>

          {recommendation ? (
            <div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                <TypingEffect text={recommendation} />
              </p>
              <div className="mt-4 pt-3 border-t border-cyan-800/30 flex items-center gap-2">
                <span className="text-[10px] text-cyan-600 uppercase tracking-wider font-bold">Powered by</span>
                <span className="text-[10px] font-mono text-cyan-500">Gemini 2.0 Flash + LangGraph + Neo4j</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-slate-400 text-sm">AI agents are analyzing the Neo4j blast radius and generating a recovery strategy...</p>
              </div>
              {/* Shimmer loading lines */}
              <div className="space-y-2 mt-2">
                <div className="h-3 bg-slate-700/50 rounded animate-pulse w-full" />
                <div className="h-3 bg-slate-700/50 rounded animate-pulse w-4/5" />
                <div className="h-3 bg-slate-700/50 rounded animate-pulse w-3/5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Flow Visualization */}
      <div className="bg-slate-800/20 border border-slate-700/30 p-6 rounded-xl mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">🏭 Semiconductor Fab Process Flow — Affected Nodes</h3>
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {[
            { id: 'SUP_WAF', label: 'Global Wafers Ltd', sub: 'Supplier', type: 'supplier' },
            { id: 'SUP_CHEM', label: 'Tokyo Ohka Kogyo', sub: 'Photoresist', type: 'supplier' },
            { id: 'MAC_ASML_1', label: 'EUV Stepper', sub: 'Photolithography', type: 'machine' },
            { id: 'MAC_ETCH_1', label: 'Plasma Etcher', sub: 'Etching', type: 'machine' },
            { id: 'MAC_CVD_1', label: 'CVD Reactor', sub: 'Deposition', type: 'machine' },
            { id: 'MAC_CMP_1', label: 'CMP Polisher', sub: 'Planarization', type: 'machine' },
            { id: 'SKU_H100', label: 'H100 AI Chip', sub: 'Final SKU', type: 'sku' },
          ].map((node, idx, arr) => {
            const isAffected = exceptionData.node === node.id;
            const nodeColors = {
              supplier: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
              machine: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
              sku: 'border-green-500/40 bg-green-500/10 text-green-300',
            };
            return (
              <div key={node.id} className="flex items-center gap-2">
                <div className={`relative px-3 py-2 rounded-lg border text-center min-w-[110px] transition-all ${
                  isAffected
                    ? `border-red-500 bg-red-500/20 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]`
                    : nodeColors[node.type]
                }`}>
                  {isAffected && (
                    <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">!</span>
                  )}
                  <p className="text-xs font-bold">{node.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{node.sub}</p>
                </div>
                {idx < arr.length - 1 && <span className="text-slate-600 text-lg font-light">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Trace & Impact Map */}
      <div className="mb-6">
        <ImpactMap />
        <AgentTrace />
      </div>

      {/* Action Buttons - RBAC Protected */}
      {['Manager', 'Executive'].includes(user?.role) ? (
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-700/50 pt-6">
          <button
            onClick={() => handleAction('dismiss')}
            disabled={!!actionStatus}
            className="px-5 py-2.5 font-semibold text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-40"
          >
            🗑️ Dismiss
          </button>
          <button
            onClick={() => handleAction('escalate')}
            disabled={!!actionStatus}
            className="px-5 py-2.5 font-semibold text-sm bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-40"
          >
            ⬆️ Escalate to Executive
          </button>
          <button
            onClick={() => handleAction('approve')}
            disabled={!!actionStatus}
            className="px-6 py-2.5 font-semibold text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all disabled:opacity-40"
          >
            ✅ Approve Resolution
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 p-4 border border-slate-700/50 rounded-lg text-slate-400 bg-slate-800/30 text-sm">
          <span className="text-cyan-500 text-lg">🔒</span>
          Your role (<strong className="text-slate-200">{user?.role}</strong>) is read-only. Only Managers & Executives can approve, escalate, or dismiss.
        </div>
      )}
    </div>
  );
}