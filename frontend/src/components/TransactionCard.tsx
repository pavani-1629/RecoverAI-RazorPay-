import { ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import type { TransactionItem } from '../types/recovery';
import { StatusBadge } from './StatusBadge';
import {
  formatCurrency,
  formatFailureReason,
  formatPaymentMethod,
  formatActionType,
} from '../utils/formatters';

interface TransactionCardProps {
  transaction: TransactionItem;
  onSelect: (txn: TransactionItem) => void;
  index?: number;
}

export const TransactionCard = ({
  transaction,
  onSelect,
  index = 0,
}: TransactionCardProps) => {
  const isFailed = transaction.status === 'failed';
  const prob = transaction.recovery_probability ?? 0.887;
  const isRecoverable = prob >= 0.3;

  // Stagger animation delay based on card index in view
  const staggerDelay = `${(index % 8) * 60}ms`;

  return (
    <div
      onClick={() => onSelect(transaction)}
      style={{ animationDelay: staggerDelay }}
      className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800/90 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-1 animate-slide-up"
    >
      {/* Top Banner: Transaction ID & Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-lg border border-sky-500/20">
              TXN #{transaction.id}
            </span>
            <StatusBadge status={transaction.status} type="status" size="sm" />
            {isFailed && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {formatFailureReason(transaction.failure_reason)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono pt-0.5">
            {transaction.customer_name || `Customer #${transaction.customer_id}`} • {formatPaymentMethod(transaction.payment_method)}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
        </div>
      </div>

      {/* Middle: ML Recovery Prediction & Policy Action (Spacious Layout) */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
        {isFailed ? (
          <>
            {/* Probability Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recovery Probability</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(8, prob * 100))}%` }}
                />
              </div>
            </div>

            {/* Policy Action & Priority Badges */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Policy Action</span>
                <div className="font-semibold text-sky-300">
                  {formatActionType(isRecoverable ? 'alternative_payment' : 'no_action')}
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Priority</span>
                <div>
                  <StatusBadge status={isRecoverable ? 'high' : 'low'} type="priority" size="sm" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between font-mono">
            <span>Payment Captured Successfully</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Bottom CTA: View Recovery */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 font-mono">
          {transaction.has_recovery_case
            ? `Case #${transaction.recovery_case_id} ${transaction.recovery_case_status || 'Open'}`
            : isFailed
            ? 'Action Pending'
            : 'Settled'}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(transaction);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all group-hover:translate-x-0.5 cursor-pointer"
        >
          <span>View Recovery</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
