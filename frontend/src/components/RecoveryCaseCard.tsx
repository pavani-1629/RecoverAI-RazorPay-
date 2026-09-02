import { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import type { RecoveryCaseItem, RecoveryCaseDetail, RecoveryActionHistory } from '../types/recovery';
import { recoveryApi } from '../api/recoveryApi';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import {
  formatCurrency,
  formatActionType,
  formatDate,
} from '../utils/formatters';

interface RecoveryCaseCardProps {
  recoveryCase: RecoveryCaseItem;
  onExecute: (caseId: number) => Promise<void>;
  isExecuting?: boolean;
  onInspectTransaction?: (txnId: number) => void;
}

export const RecoveryCaseCard = ({
  recoveryCase,
  onExecute,
  isExecuting = false,
  onInspectTransaction,
}: RecoveryCaseCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<RecoveryCaseDetail | null>(null);
  const [actions, setActions] = useState<RecoveryActionHistory[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const isExecuted = recoveryCase.status === 'executed';

  const handleToggleExpand = async () => {
    if (!expanded && !detail) {
      setLoadingDetails(true);
      try {
        const [caseRes, actRes] = await Promise.all([
          recoveryApi.getRecoveryCaseDetail(recoveryCase.recovery_case_id),
          recoveryApi.getRecoveryCaseActions(recoveryCase.recovery_case_id),
        ]);
        setDetail(caseRes);
        setActions(actRes);
      } catch (err) {
        console.error('Failed to load case actions', err);
      } finally {
        setLoadingDetails(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div
      className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${
        isExecuted
          ? 'border-emerald-500/25 bg-slate-900/60'
          : 'border-sky-500/20 hover:border-sky-500/40 bg-slate-900/80'
      }`}
    >
      {/* Top Banner */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                CASE #{recoveryCase.recovery_case_id}
              </span>
              <span
                onClick={() => onInspectTransaction?.(recoveryCase.transaction_id)}
                className="font-mono text-xs text-sky-400 hover:text-sky-300 underline cursor-pointer"
              >
                TXN #{recoveryCase.transaction_id}
              </span>
              <StatusBadge status={recoveryCase.status} type="status" size="sm" />
            </div>

            <p className="text-xs text-slate-300 font-medium mt-1">{recoveryCase.reason}</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 uppercase font-mono">Salvaged GMV</span>
            <div className="text-lg sm:text-xl font-bold text-white font-mono">
              {formatCurrency(recoveryCase.estimated_revenue)}
            </div>
          </div>
        </div>

        {/* Progress Bar & Probability */}
        <div className="pt-2">
          <ProgressBar value={recoveryCase.recovery_probability} size="sm" />
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleToggleExpand}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <span>{expanded ? 'Hide History' : 'View Action Details'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {!isExecuted ? (
            <button
              onClick={() => onExecute(recoveryCase.recovery_case_id)}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>Execute Recovery</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recovery Won & Logged</span>
            </span>
          )}
        </div>
      </div>

      {/* Expanded Accordion Details */}
      {expanded && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800 bg-slate-950/60 space-y-4">
          {loadingDetails ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading action history & audit trail...</span>
            </div>
          ) : (
            <>
              {/* Latest Action Info */}
              {detail?.action && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono uppercase">Intervention Strategy</span>
                    <StatusBadge status={detail.action.status} type="status" size="sm" />
                  </div>
                  <div className="text-xs font-bold text-sky-300">
                    {formatActionType(detail.action.action_type)}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{detail.action.reason}</p>
                  {detail.action.result && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-xs text-emerald-300 font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Result: {detail.action.result}</span>
                    </div>
                  )}
                </div>
              )}

              {/* History Timeline */}
              {actions.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                    Action Execution Log
                  </h5>
                  <div className="space-y-2">
                    {actions.map((act) => (
                      <div
                        key={act.action_id}
                        className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white">
                            {formatActionType(act.action_type)}
                          </div>
                          <p className="text-slate-400 text-[11px]">{act.result || act.reason}</p>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-mono shrink-0">
                          {act.executed_at ? formatDate(act.executed_at) : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
