import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center text-rose-500">Please log in.</div>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-slate-400">
        <div className="text-center bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-xl">
          <span className="text-4xl block mb-4">🛑</span>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Denied</h2>
          <p>Your role ({user.role}) does not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
