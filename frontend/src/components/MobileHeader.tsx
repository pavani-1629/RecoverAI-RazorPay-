import { useState } from 'react';
import rpLogo from '../assets/RPLogo.jpg';
import {
  Menu,
  X,
  Activity,
  ShieldAlert,
  Layers,
  Sparkles,
  Zap,
  History,
  Mail,
} from 'lucide-react';

interface MobileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  caseCount?: number;
}

export const MobileHeader = ({
  activeTab,
  onTabChange,
  caseCount = 0,
}: MobileHeaderProps) => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <ShieldAlert className="w-4 h-4" /> },
    {
      id: 'cases',
      label: 'Recovery Cases',
      icon: <Layers className="w-4 h-4" />,
      badge: caseCount > 0 ? caseCount.toString() : undefined,
    },
    { id: 'ai-insights', label: 'AI Intelligence', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <header className="md:hidden sticky top-0 z-40 w-full bg-[#070a13]/90 backdrop-blur-xl border-b border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <div
          onClick={() => onTabChange('overview')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-sky-400/30 p-0.5">
            <img src={rpLogo} alt="Logo" className="w-full h-full object-cover rounded-md" />
          </div>
          <span className="text-base font-bold text-white">
            Razorpay <span className="text-cyan-400">RecoverAI</span>
          </span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="pt-4 pb-2 space-y-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium ${
                  activeTab === item.id
                    ? 'bg-sky-500/20 text-sky-300 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Creator Attribution */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-left space-y-0.5 pt-2 mt-2">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Built by Pavani Parla</div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Mail className="w-2.5 h-2.5 text-slate-500" />
              <span>pavaniparla19@gmail.com</span>
            </div>
            <div className="text-[9px] font-mono text-cyan-400/80">Razorpay AI Buildathon 2026</div>
          </div>
        </div>
      )}
    </header>
  );
};
