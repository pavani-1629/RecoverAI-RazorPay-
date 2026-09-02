import { Sparkles, Eye, Layers } from 'lucide-react';
import type { TransactionItem } from '../types/recovery';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import {
  formatCurrency,
  formatFailureReason,
  formatPaymentMethod,
  formatDate,
} from '../utils/formatters';

interface TransactionTableProps {
  transactions: TransactionItem[];
  onSelect: (txn: TransactionItem) => void;
  onRunAgent: (txnId: number) => void;
  onCreateCase: (txnId: number) => void;
}

export const TransactionTable = ({
  transactions,
  onSelect,
  onRunAgent,
  onCreateCase,
}: TransactionTableProps) => {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Transaction</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Root-Cause</th>
              <th className="px-5 py-3.5">Method</th>
              <th className="px-5 py-3.5">Recoverability</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((txn) => {
              const isFailed = txn.status === 'failed';
              return (
                <tr
                  key={txn.id}
                  onClick={() => onSelect(txn)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  {/* ID & Date */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-sky-400">TXN #{txn.id}</div>
                    <div className="text-[11px] text-slate-500">{formatDate(txn.created_at)}</div>
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-medium text-white truncate max-w-[140px]">
                      {txn.customer_name || `Customer #${txn.customer_id}`}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {txn.customer_email || 'No email provided'}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-white">
                    {formatCurrency(txn.amount, txn.currency)}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={txn.status} type="status" size="sm" />
                  </td>

                  {/* Failure Reason */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {isFailed ? (
                      <span className="text-rose-300 font-medium">
                        {formatFailureReason(txn.failure_reason)}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Payment Method */}
                  <td className="px-5 py-4 whitespace-nowrap text-slate-300">
                    {formatPaymentMethod(txn.payment_method)}
                  </td>

                  {/* Recovery Probability */}
                  <td className="px-5 py-4 whitespace-nowrap w-40">
                    {isFailed ? (
                      txn.recovery_probability !== undefined && txn.recovery_probability !== null ? (
                        <ProgressBar value={txn.recovery_probability} size="sm" showLabel={false} />
                      ) : (
                        <span className="text-[11px] font-mono text-cyan-400">Ready</span>
                      )
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-medium">Captured</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    {isFailed && (
                      <>
                        {txn.has_recovery_case ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                            <Layers className="w-3 h-3" />
                            <span>Case #{txn.recovery_case_id}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onCreateCase(txn.id)}
                            className="px-2 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-medium text-[11px] transition-colors cursor-pointer"
                          >
                            Create Case
                          </button>
                        )}

                        <button
                          onClick={() => onRunAgent(txn.id)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors inline-flex cursor-pointer"
                          title="Run AI Analysis"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onSelect(txn)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors inline-flex cursor-pointer"
                      title="Inspect Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
