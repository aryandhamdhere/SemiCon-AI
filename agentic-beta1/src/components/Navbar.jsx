import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Target, Globe, Factory, Building2, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { user, login } = useAuth();

  const navLinks = [
    { name: 'Command Center', icon: <Target className="w-4 h-4" />, path: '/' },
    { name: 'World Map', icon: <Globe className="w-4 h-4" />, path: '/map' },
    { name: 'Process Flow', icon: <Factory className="w-4 h-4" />, path: '/process' },
    { name: 'Architecture', icon: <Building2 className="w-4 h-4" />, path: '/architecture' },
    { name: 'Analytics', icon: <BarChart2 className="w-4 h-4" />, path: '/analytics' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-3 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">SemiCon AI</h1>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded ml-1 border border-slate-200">BETA 4</span>
        </div>
        
        <div className="flex gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 text-base font-semibold px-4 py-2 rounded-lg transition-all ${
                location.pathname === link.path 
                  ? 'text-blue-700 bg-blue-50 border border-blue-200' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.icon} {link.name}
            </Link>
          ))}
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-3 border-l border-slate-300 pl-4 ml-2">
          <span className="text-sm text-slate-500 uppercase tracking-widest">Role:</span>
          <select 
            value={user?.role || 'Manager'} 
            onChange={(e) => login(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-base rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 transition-colors shadow-sm"
          >
            <option value="Operator">Operator</option>
            <option value="Manager">Manager</option>
            <option value="Executive">Executive</option>
            <option value="Auditor">Auditor</option>
          </select>
        </div>
      </div>
    </nav>
  )
}