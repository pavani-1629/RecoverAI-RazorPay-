import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import type { TransactionItem } from '../types/recovery';
import { TransactionCard } from './TransactionCard';
import { TransactionTable } from './TransactionTable';
import { TableRowSkeleton } from './LoadingSkeleton';

interface TransactionSectionProps {
  transactions: TransactionItem[];
  loading: boolean;
  onSelectTransaction: (txn: TransactionItem) => void;
  onRunAgent: (txnId: number) => void;
  onCreateCase: (txnId: number) => void;
}

export const TransactionSection = ({
  transactions,
  loading,
  onSelectTransaction,
  onRunAgent,
  onCreateCase,
}: TransactionSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'failed' | 'success'>('failed');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy] = useState<'id' | 'amount' | 'probability'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((txn) => {
        // Status filter
        if (statusFilter !== 'all' && txn.status !== statusFilter) return false;

        // Payment method filter
        if (methodFilter !== 'all' && txn.payment_method.toLowerCase() !== methodFilter.toLowerCase()) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = txn.id.toString().includes(q);
          const matchName = (txn.customer_name || '').toLowerCase().includes(q);
          const matchEmail = (txn.customer_email || '').toLowerCase().includes(q);
          const matchReason = (txn.failure_reason || '').toLowerCase().includes(q);
          const matchMethod = txn.payment_method.toLowerCase().includes(q);
          return matchId || matchName || matchEmail || matchReason || matchMethod;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'id') diff = a.id - b.id;
        else if (sortBy === 'amount') diff = a.amount - b.amount;
        else if (sortBy === 'probability') {
          diff = (a.recovery_probability || 0) - (b.recovery_probability || 0);
        }
        return sortOrder === 'desc' ? -diff : diff;
      });
  }, [transactions, searchQuery, statusFilter, methodFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-sky-400" />
            <span>Live Failed Transactions Feed</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time failed payments automatically identified with zero-leakage ML recoverability scores.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/90 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TXN ID, customer, error code..."
              className="w-full bg-slate-900/80 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'failed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Failed Only
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('success')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Settled
              </button>
            </div>

            {/* Payment Method Selector */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Payment Rails</option>
              <option value="upi">UPI AutoPay</option>
              <option value="card">Cards</option>
              <option value="netbanking">NetBanking</option>
              <option value="wallet">Wallets</option>
            </select>

            {/* Sort Controls */}
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs text-slate-300 hover:text-white cursor-pointer"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span className="capitalize">{sortOrder}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <TableRowSkeleton rows={6} />
      ) : filteredTransactions.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <Filter className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No transactions match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your filters or search keywords to view other transactions.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTransactions.map((txn, idx) => (
            <TransactionCard
              key={txn.id}
              transaction={txn}
              onSelect={onSelectTransaction}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          onSelect={onSelectTransaction}
          onRunAgent={onRunAgent}
          onCreateCase={onCreateCase}
        />
      )}
    </div>
  );
};
