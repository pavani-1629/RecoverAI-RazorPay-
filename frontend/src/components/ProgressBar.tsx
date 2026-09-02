import React from 'react';

interface ProgressBarProps {
  value: number | null | undefined;
  threshold?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  threshold = 0.3,
  showLabel = true,
  size = 'md',
}) => {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="text-xs text-slate-500 font-mono">Unscored</span>;
  }

  const percent = Math.min(100, Math.max(0, Math.round(value * 100)));
  const isRecoverable = value >= threshold;

  let barColor = 'bg-rose-500';
  let textColor = 'text-rose-400';

  if (percent >= 75) {
    barColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';
    textColor = 'text-emerald-400';
  } else if (percent >= 55) {
    barColor = 'bg-gradient-to-r from-cyan-500 to-sky-400';
    textColor = 'text-cyan-400';
  } else if (percent >= 30) {
    barColor = 'bg-gradient-to-r from-amber-500 to-yellow-400';
    textColor = 'text-amber-400';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Recovery Confidence</span>
          <span className={`font-mono font-bold ${textColor}`}>
            {percent}% {isRecoverable ? '✓' : '✗'}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${heightClass} p-0.5 border border-slate-700/50`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
