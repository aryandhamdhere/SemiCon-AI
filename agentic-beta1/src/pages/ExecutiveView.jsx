import React from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const mttrData = [
  { name: 'Mon', MTTR: 45, Benchmark: 60 },
  { name: 'Tue', MTTR: 42, Benchmark: 60 },
  { name: 'Wed', MTTR: 38, Benchmark: 60 },
  { name: 'Thu', MTTR: 25, Benchmark: 60 },
  { name: 'Fri', MTTR: 18, Benchmark: 60 },
  { name: 'Sat', MTTR: 15, Benchmark: 60 },
  { name: 'Sun', MTTR: 12, Benchmark: 60 },
];

const exceptionVolumeData = [
  { category: 'Weather', Volume: 12 },
  { category: 'Machine Failure', Volume: 8 },
  { category: 'Supplier Delay', Volume: 24 },
  { category: 'Quality', Volume: 5 },
];

export default function ExecutiveView() {
  const { user } = useAuth();

  if (user?.role !== 'Executive') {
    return (
      <div className="flex h-full items-center justify-center p-12 text-slate-400">
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-xl text-center">
          <span className="text-4xl mb-4 block">📈</span>
          <h2 className="text-xl font-bold text-slate-100">Executive Analytics</h2>
          <p className="mt-2 text-sm">Please select the Executive role to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-400">System-wide performance and AI resolution metrics.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">Avg MTTR</p>
            <p className="text-2xl font-bold text-cyan-400">12m</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase">AI Auto-Resolve %</p>
            <p className="text-2xl font-bold text-emerald-400">74%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MTTR Trend */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl shadow-lg">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">Mean Time to Resolve (Minutes)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mttrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Line type="monotone" dataKey="MTTR" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="dashed" dataKey="Benchmark" stroke="#64748b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exception Volume */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl shadow-lg">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">Exception Volume by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exceptionVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                <Bar dataKey="Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
