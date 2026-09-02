import React, { useState } from 'react';
import {
  ShieldAlert,
  Layers,
  Sparkles,
  Activity,
  History,
  RotateCw,
  Menu,
  X,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onOpenAudit: () => void;
  caseCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing = false,
  onOpenAudit,
  caseCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <ShieldAlert className="w-4 h-4" /> },
    {
      id: 'cases',
      label: 'Recovery Cases',
      icon: <Layers className="w-4 h-4" />,
      badge: caseCount > 0 ? caseCount : undefined,
    },
    { id: 'ai-insights', label: 'AI Intelligence', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-500/10 bg-[#070a13]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Mark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('overview')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-lg shadow-sky-500/20 border border-sky-400/30">
              <span className="font-extrabold text-white text-lg tracking-tighter">R</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-[#070a13] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider text-sky-400 uppercase bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                  Razorpay
                </span>
                <span className="text-base font-bold text-white tracking-tight">
                  Recover<span className="text-cyan-400">AI</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-mono hidden sm:block">
                REVENUE RECOVERY CONTROL PLANE
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Live Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AGENT LIVE</span>
            </div>

            {/* Audit Trail Button */}
            <button
              onClick={onOpenAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
              title="View Immutable Audit Trail"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Audit Trail</span>
            </button>

            {/* Refresh Data Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Live Data"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-800 bg-[#070a13] space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                activeTab === item.id
                  ? 'bg-sky-500/20 text-sky-300 font-medium'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-300">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
