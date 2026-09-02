import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Percent,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { DashboardMetrics } from '../types/recovery';
import { MetricCard } from './MetricCard';
import { MetricCardSkeleton } from './LoadingSkeleton';
import { formatCurrency, formatFailureReason, formatPaymentMethod } from '../utils/formatters';

interface OverviewMetricsProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  onNavigateToCases: () => void;
  onNavigateToTransactions: () => void;
}

export const OverviewMetrics = ({
  metrics,
  loading,
  onNavigateToCases,
  onNavigateToTransactions,
}: OverviewMetricsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center border border-slate-800">
        <p className="text-slate-400 text-sm">No live metric data available from backend.</p>
      </div>
    );
  }

  const failureReasonsList = Object.entries(metrics.failure_reasons_breakdown || {}).sort(
    (a, b) => b[1] - a[1]
  );

  const paymentMethodsList = Object.entries(metrics.payment_methods_breakdown || {}).sort(
    (a, b) => b[1] - a[1]
  );

  const totalFailures = metrics.total_failed_transactions || 1;

  return (
    <div className="space-y-8">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Executive Recovery Summary</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
              Live DB Sync
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry measuring revenue leakage, ML recoverability potential, and executed recoveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToCases}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium transition-colors"
          >
            <span>View Active Cases</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Revenue at Risk"
          value={formatCurrency(metrics.total_revenue_at_risk)}
          subtitle={`${metrics.total_failed_transactions} failed transactions detected`}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorScheme="rose"
          trend="Total Slipping GMV"
          onClick={onNavigateToTransactions}
        />

        <MetricCard
          title="Potential Recoverable"
          value={formatCurrency(metrics.total_recoverable_revenue)}
          subtitle={`${metrics.total_recovery_cases} cases qualified by ML model`}
          icon={<TrendingUp className="w-5 h-5" />}
          colorScheme="cyan"
          trend="Qualified GMV"
          trendPositive={true}
          onClick={onNavigateToCases}
        />

        <MetricCard
          title="Recovered Revenue"
          value={formatCurrency(metrics.total_recovered_revenue)}
          subtitle={`${metrics.executed_recovery_cases} bounded recovery actions executed`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorScheme="emerald"
          trend="Measured Money Won"
          trendPositive={true}
        />

        <MetricCard
          title="Recovery Efficiency"
          value={`${metrics.recovery_rate_percent}%`}
          subtitle={`${metrics.executed_recovery_cases} of ${metrics.total_recovery_cases} cases recovered`}
          icon={<Percent className="w-5 h-5" />}
          colorScheme="blue"
          trend="Operating Threshold: 0.30"
          trendPositive={true}
        />
      </div>

      {/* Deep-Dive Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failure Reason Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Root-Cause Failure Distribution</h3>
                <p className="text-xs text-slate-400">Classification of payment degradation reasons</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">{metrics.total_failed_transactions} failures</span>
          </div>

          <div className="space-y-3.5">
            {failureReasonsList.map(([reason, count]) => {
              const share = Math.round((count / totalFailures) * 100);
              return (
                <div key={reason} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{formatFailureReason(reason)}</span>
                    <span className="font-mono text-slate-400">
                      {count} <span className="text-slate-500">({share}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Payment Method Volume</h3>
                <p className="text-xs text-slate-400">Transaction volume across rails</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {(metrics.total_failed_transactions || 0) + (metrics.total_successful_transactions || 0)} total
            </span>
          </div>

          <div className="space-y-3.5">
            {paymentMethodsList.map(([method, count]) => {
              const totalAll =
                (metrics.total_failed_transactions || 0) +
                (metrics.total_successful_transactions || 0) || 1;
              const share = Math.round((count / totalAll) * 100);
              return (
                <div key={method} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{formatPaymentMethod(method)}</span>
                    <span className="font-mono text-slate-400">
                      {count} <span className="text-slate-500">({share}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
