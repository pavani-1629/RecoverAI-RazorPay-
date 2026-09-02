import rpLogo from '../assets/RPLogo.jpg';
import {
  Activity,
  ShieldAlert,
  Layers,
  Sparkles,
  Zap,
  History,
  RotateCw,
  Mail,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isLiveBackend?: boolean;
  caseCount?: number;
  failedTxnCount?: number;
}

export const Sidebar = ({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing = false,
  isLiveBackend = false,
  caseCount = 0,
  failedTxnCount = 0,
}: SidebarProps) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: failedTxnCount > 0 ? `${failedTxnCount} Failed` : undefined,
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
    {
      id: 'cases',
      label: 'Recovery Cases',
      icon: <Layers className="w-4 h-4" />,
      badge: caseCount > 0 ? caseCount.toString() : undefined,
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'ai-insights',
      label: 'AI Intelligence',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'architecture',
      label: 'Architecture',
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#090d19] border-r border-slate-800/80 flex flex-col justify-between p-5 select-none h-screen sticky top-0 shrink-0 overflow-y-auto">
      {/* Top: Brand Header & Navigation */}
      <div className="space-y-6">
        <div
          onClick={() => onTabChange('overview')}
          className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-2xl hover:bg-slate-900/50 transition-colors"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-sky-400/30 shadow-md shadow-sky-500/15 p-0.5 shrink-0">
            <img
              src={rpLogo}
              alt="Razorpay Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider text-sky-400 uppercase bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20 font-mono">
                Razorpay
              </span>
            </div>
            <div className="text-base font-bold text-white tracking-tight leading-tight">
              Recover<span className="text-cyan-400">AI</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls & Creator Attribution */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        {/* Live System Status Card */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLiveBackend ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`text-[11px] font-mono font-semibold ${isLiveBackend ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isLiveBackend ? 'Supabase Live' : 'Demo Dataset'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">v1.0</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Threshold: 0.30</span>
            <span className="text-sky-400 font-medium">Policy Bound</span>
          </div>
        </div>

        {/* Sync Live DB Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : 'text-slate-400'}`}
          />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Database'}</span>
        </button>

        {/* Creator Attribution */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-left">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            Built by
          </div>
          <div className="text-xs font-semibold text-slate-200">
            Pavani Parla
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 truncate pt-0.5">
            <Mail className="w-2.5 h-2.5 text-slate-500 shrink-0" />
            <span className="truncate">pavaniparla19@gmail.com</span>
          </div>
          <div className="text-[9px] font-mono text-cyan-400/90 pt-0.5">
            Razorpay AI Buildathon 2026
          </div>
        </div>
      </div>
    </aside>
  );
};
