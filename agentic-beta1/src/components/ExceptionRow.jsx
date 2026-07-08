import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from './StatusBadge';

export default function ExceptionRow({ exception }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Local state for instant UX updates without waiting for the 5-second polling
  const [isHidden, setIsHidden] = useState(false);
  const [localStatus, setLocalStatus] = useState(exception.status);
  
  const handleApprove = async (e) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:8000/exceptions/${exception.id}/approve`);
      setIsHidden(true); // Instantly hide the row
    } catch (error) {
      console.error("Error approving exception:", error);
    }
  };

  const handleEscalate = async (e) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:8000/exceptions/${exception.id}/escalate`);
      setLocalStatus('escalated'); // Instantly show the escalated badge
    } catch (error) {
      console.error("Error escalating exception:", error);
    }
  };

  const handleDismiss = async (e) => {
    e.stopPropagation();
    try {
      await axios.put(`http://localhost:8000/exceptions/${exception.id}/dismiss`);
      setIsHidden(true); // Instantly hide the row
    } catch (error) {
      console.error("Error dismissing exception:", error);
    }
  };

  const timeString = exception.created_at
    ? new Date(exception.created_at.endsWith('Z') ? exception.created_at : exception.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  if (isHidden) return null;

  return (
    <div 
      onClick={() => navigate(`/exception/${exception.id}`)}
      className="flex flex-col xl:flex-row xl:items-center justify-between p-4 border-b border-slate-200 hover:bg-slate-50 transition-colors gap-4 cursor-pointer"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="font-mono text-xs text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">EX-{exception.id}</span>
          <span className="text-xs text-slate-500 font-medium">{timeString}</span>
          <StatusBadge status={exception.severity} />
          {localStatus === 'escalated' && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border bg-purple-500/10 text-purple-400 border-purple-500/30">
              Escalated
            </span>
          )}
        </div>
        <div className="font-semibold text-slate-800 text-base">{exception.title}</div>
        <div className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
          {/* ... icon SVG ... */}
          {exception.node}
        </div>
      </div>
      
      <div className="flex gap-2">
        {/* RBAC check for action buttons */}
        {['Manager', 'Executive'].includes(user?.role) ? (
          <>
            <button 
              onClick={handleApprove}
              className="px-3 py-1.5 text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/20 transition-colors"
            >
              Approve
            </button>
            <button 
              onClick={handleEscalate} 
              className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
            >
              Escalate
            </button>
            <button 
              onClick={handleDismiss} 
              className="px-3 py-1.5 text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded hover:bg-slate-500/20 transition-colors"
            >
              Dismiss
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded border border-slate-200">Read-Only</span>
        )}
      </div>
    </div>
  )
}