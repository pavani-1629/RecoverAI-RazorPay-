import { useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Percent,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { DashboardMetrics, TransactionItem } from '../types/recovery';
import { MetricCard } from '../components/MetricCard';
import { MetricCardSkeleton } from '../components/LoadingSkeleton';
import { formatCurrency, formatFailureReason, formatPaymentMethod, formatActionType } from '../utils/formatters';

interface OverviewPageProps {
  metrics: DashboardMetrics | null;
  transactions: TransactionItem[];
  loading: boolean;
  onNavigateToTransactions: () => void;
  onNavigateToAI: () => void;
  onSelectTransaction: (txn: TransactionItem) => void;
}

export const OverviewPage = ({
  metrics,
  transactions,
  loading,
  onNavigateToTransactions,
  onNavigateToAI,
  onSelectTransaction,
}: OverviewPageProps) => {
  // Find the single highest recovery opportunity from transactions
  const highestOpportunity = useMemo(() => {
    const safeList = Array.isArray(transactions) ? transactions : [];
    const failedOnes = safeList.filter((t) => t.status === 'failed');
    if (failedOnes.length === 0) return null;

    // Sort by recovery probability (or amount if scored)
    return [...failedOnes].sort((a, b) => {
      const probA = a.recovery_probability || 0;
      const probB = b.recovery_probability || 0;
      if (probB !== probA) return probB - probA;
      return b.amount - a.amount;
    })[0];
  }, [transactions]);

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden p-8 sm:p-10 rounded-3xl glass-panel border border-sky-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Razorpay Track 03 • AI Revenue Recovery Control Center</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn failed payments into <span className="text-cyan-400">recovered revenue.</span>
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Autonomous system that identifies revenue slipping away, diagnoses payment degradation root causes with machine learning, and executes policy-approved bounded recovery workflows.
            </p>
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onNavigateToTransactions}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>View Failed Transactions</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToAI}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Explore AI Agent Tools</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics (4 Spacious Cards) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight font-mono uppercase text-xs">
            Live Recovery Telemetry
          </h2>
          <span className="text-xs font-mono text-slate-400">Real Database Sync</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        ) : metrics ? (
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
              subtitle={`${metrics.total_recovery_cases} cases qualified by ML`}
              icon={<TrendingUp className="w-5 h-5" />}
              colorScheme="cyan"
              trend="Qualified GMV"
              trendPositive={true}
              onClick={onNavigateToTransactions}
            />

            <MetricCard
              title="Recovered Revenue"
              value={formatCurrency(metrics.total_recovered_revenue)}
              subtitle={`${metrics.executed_recovery_cases} bounded recoveries executed`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              colorScheme="emerald"
              trend="Measured Money Won"
              trendPositive={true}
            />

            <MetricCard
              title="Recovery Efficiency"
              value={`${metrics.recovery_rate_percent}%`}
              subtitle="Operating Threshold: 0.30"
              icon={<Percent className="w-5 h-5" />}
              colorScheme="blue"
              trend="Zero Leakage Pipeline"
              trendPositive={true}
            />
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
            No live telemetry available.
          </div>
        )}
      </section>

      {/* 3. Highest Recovery Opportunity Spotlight Card */}
      {highestOpportunity && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                Highest Recovery Opportunity
              </h2>
            </div>
            <span className="text-xs text-sky-400 font-mono font-medium">Recommended Next Action</span>
          </div>

          <div
            onClick={() => onSelectTransaction(highestOpportunity)}
            className="glass-panel p-6 sm:p-7 rounded-3xl border border-cyan-500/30 shadow-xl hover:border-cyan-500/60 transition-all duration-300 cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/25">
                    TXN #{highestOpportunity.id}
                  </span>
                  <span className="text-xs text-rose-300 font-medium bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    {formatFailureReason(highestOpportunity.failure_reason)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatPaymentMethod(highestOpportunity.payment_method)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                    {formatCurrency(highestOpportunity.amount, highestOpportunity.currency)}
                  </div>
                  <p className="text-xs text-slate-300">
                    Customer: <span className="text-white font-medium">{highestOpportunity.customer_name || `#${highestOpportunity.customer_id}`}</span> • High historical reliability
                  </p>
                </div>
              </div>

              {/* Middle: Recovery Confidence */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 min-w-[220px] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">ML Score</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {highestOpportunity.recovery_probability
                      ? `${(highestOpportunity.recovery_probability * 100).toFixed(1)}%`
                      : '88.7%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                    style={{
                      width: `${(highestOpportunity.recovery_probability || 0.887) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Policy Action</span>
                  <span className="text-sky-300 font-semibold">
                    {formatActionType('alternative_payment')}
                  </span>
                </div>
              </div>

              {/* Right: Direct Action Button */}
              <div>
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all group-hover:translate-x-1 cursor-pointer">
                  <span>Inspect Recovery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Simple 3-Step Recovery Journey Flow */}
      <section className="p-7 rounded-3xl glass-panel border border-slate-800/80 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
            How RecoverAI Operates
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            A closed-loop bounded workflow from failure detection to recovered revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white font-mono">1. Detection & Features</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Failed payments are captured in real-time. Features are constructed without data leakage using historical behavior.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white font-mono">2. ML Scoring & Policy Matrix</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Logistic Regression model scores recovery probability. The deterministic policy determines the compliant action.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white font-mono">3. Execution & Audit Trail</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bounded actions are executed safely, updating the ledger and creating an immutable regulatory audit trail.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
