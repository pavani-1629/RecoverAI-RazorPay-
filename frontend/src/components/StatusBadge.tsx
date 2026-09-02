import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'action' | 'method';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  size = 'md',
}) => {
  const normalized = (status || '').toLowerCase();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700/60';

  if (type === 'status') {
    if (normalized === 'success' || normalized === 'executed' || normalized === 'recovered') {
      colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    } else if (normalized === 'failed') {
      colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    } else if (normalized === 'open' || normalized === 'pending' || normalized === 'recommended') {
      colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  } else if (type === 'priority') {
    if (normalized === 'high') {
      colorClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-semibold';
    } else if (normalized === 'medium') {
      colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold';
    } else {
      colorClasses = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  } else if (type === 'action') {
    if (normalized.includes('retry')) {
      colorClasses = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    } else if (normalized.includes('alternative')) {
      colorClasses = 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    } else if (normalized.includes('notification')) {
      colorClasses = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
    } else if (normalized.includes('manual')) {
      colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    } else {
      colorClasses = 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  } else if (type === 'method') {
    colorClasses = 'bg-sky-500/10 text-sky-300 border-sky-500/25';
  }

  const label = status
    ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Unknown';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${colorClasses} tracking-wide transition-colors`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
};
