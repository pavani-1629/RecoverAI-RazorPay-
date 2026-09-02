import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-800/60 rounded-lg border border-slate-700/30 ${className}`}
        />
      ))}
    </>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="w-10 h-10 rounded-xl bg-slate-800" />
      </div>
      <div className="h-8 bg-slate-800 rounded w-2/3" />
      <div className="h-3 bg-slate-800/60 rounded w-1/2" />
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4 animate-pulse"
        >
          <div className="h-5 bg-slate-800 rounded w-20" />
          <div className="h-5 bg-slate-800 rounded w-32" />
          <div className="h-5 bg-slate-800 rounded w-24" />
          <div className="h-5 bg-slate-800 rounded w-28" />
          <div className="h-5 bg-slate-800 rounded w-24" />
        </div>
      ))}
    </div>
  );
};
