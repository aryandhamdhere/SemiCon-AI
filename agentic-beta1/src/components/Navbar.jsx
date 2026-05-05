import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, login } = useAuth();

  const navLinks = [
    { name: '🎯 Command Center', path: '/' },
    { name: '🌍 World Map', path: '/map' },
    { name: '🏭 Process Flow', path: '/process' },
    { name: '🏗️ Architecture', path: '/architecture' },
    { name: '📊 Analytics', path: '/analytics' },
  ];

  return (
    <nav className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-bold text-cyan-400 tracking-tight">SemiCon AI</h1>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded ml-1">BETA 4</span>
        </div>
        
        <div className="flex gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                location.pathname === link.path 
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-3 border-l border-slate-700 pl-4 ml-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Role:</span>
          <select 
            value={user?.role || 'Manager'} 
            onChange={(e) => login(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-400 text-xs rounded-lg px-2 py-1 outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="Operator">👷 Operator</option>
            <option value="Manager">👔 Manager</option>
            <option value="Executive">🏢 Executive</option>
            <option value="Auditor">📋 Auditor</option>
          </select>
        </div>
      </div>
    </nav>
  )
}