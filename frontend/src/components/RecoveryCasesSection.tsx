import { useState, useMemo } from 'react';
import {
  Layers,
  CheckCircle2,
  Filter,
  TrendingUp,
} from 'lucide-react';
import type { RecoveryCaseItem } from '../types/recovery';
import { RecoveryCaseCard } from './RecoveryCaseCard';
import { TableRowSkeleton } from './LoadingSkeleton';
import { formatCurrency } from '../utils/formatters';

interface RecoveryCasesSectionProps {
  cases: RecoveryCaseItem[];
  loading: boolean;
  onExecuteCase: (caseId: number) => Promise<void>;
  executingCaseId: number | null;
  onInspectTransaction: (txnId: number) => void;
}

export const RecoveryCasesSection = ({
  cases,
  loading,
  onExecuteCase,
  executingCaseId,
  onInspectTransaction,
}: RecoveryCasesSectionProps) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'executed'>('all');

  const filteredCases = useMemo(() => {
    if (filterStatus === 'all') return cases;
    return cases.filter((c) => c.status === filterStatus);
  }, [cases, filterStatus]);

  const openCases = useMemo(() => cases.filter((c) => c.status === 'open'), [cases]);
  const executedCases = useMemo(() => cases.filter((c) => c.status === 'executed'), [cases]);

  const totalOpenRevenue = useMemo(
    () => openCases.reduce((acc, c) => acc + (c.estimated_revenue || 0), 0),
    [openCases]
  );

  const totalRecoveredRevenue = useMemo(
    () => executedCases.reduce((acc, c) => acc + (c.estimated_revenue || 0), 0),
    [executedCases]
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Recovery Cases Control</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bounded recovery cases ready for automated execution or manual intervention.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-sky-500/20 text-sky-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Cases ({cases.length})
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === 'open'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ready to Recover ({openCases.length})
          </button>
          <button
            onClick={() => setFilterStatus('executed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === 'executed'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recovered ({executedCases.length})
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Pending Recovery GMV</span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">
              {formatCurrency(totalOpenRevenue)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Total Won Back</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {formatCurrency(totalRecoveredRevenue)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Execution Rate</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {cases.length > 0 ? Math.round((executedCases.length / cases.length) * 100) : 0}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Case Cards Grid */}
      {loading ? (
        <TableRowSkeleton rows={4} />
      ) : filteredCases.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <Filter className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No recovery cases found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You can create new recovery cases from failed transactions in the Transactions tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCases.map((caseItem) => (
            <RecoveryCaseCard
              key={caseItem.recovery_case_id}
              recoveryCase={caseItem}
              onExecute={onExecuteCase}
              isExecuting={executingCaseId === caseItem.recovery_case_id}
              onInspectTransaction={onInspectTransaction}
            />
          ))}
        </div>
      )}
    </div>
  );
};
