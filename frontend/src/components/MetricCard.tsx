import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  colorScheme?: 'blue' | 'cyan' | 'emerald' | 'rose' | 'amber';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
  colorScheme = 'blue',
  onClick,
}) => {
  const schemeStyles = {
    blue: {
      border: 'border-sky-500/20 hover:border-sky-500/40',
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      glow: 'hover:shadow-sky-500/10',
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      glow: 'hover:shadow-cyan-500/10',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      glow: 'hover:shadow-emerald-500/10',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'hover:shadow-rose-500/10',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'hover:shadow-amber-500/10',
    },
  }[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 sm:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl ${schemeStyles.border} ${schemeStyles.glow} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${schemeStyles.iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
          {value}
        </h3>
        {subtitle && <p className="text-xs text-slate-400 leading-relaxed">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">Benchmark</span>
          <span
            className={`font-medium ${
              trendPositive ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
