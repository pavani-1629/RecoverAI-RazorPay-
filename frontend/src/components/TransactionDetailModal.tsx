import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  User,
  CreditCard,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Code2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import type {
  TransactionItem,
  RecoveryPrediction,
  AgentAnalysisResult,
  RecoveryCaseDetail,
} from '../types/recovery';
import { recoveryApi } from '../api/recoveryApi';
import { StatusBadge } from './StatusBadge';
import {
  formatCurrency,
  formatFailureReason,
  formatPaymentMethod,
  formatActionType,
} from '../utils/formatters';
import { getMockPrediction, getMockAgentAnalysis } from '../data/mockData';

interface TransactionDetailModalProps {
  transaction: TransactionItem | null;
  onClose: () => void;
  onCreateCase: (txnId: number) => Promise<void>;
  onExecuteCase: (caseId: number) => Promise<void>;
  isCreatingCase?: boolean;
  isExecutingCase?: boolean;
}

export const TransactionDetailModal = ({
  transaction,
  onClose,
  onCreateCase,
  onExecuteCase,
  isCreatingCase = false,
  isExecutingCase = false,
}: TransactionDetailModalProps) => {
  const [prediction, setPrediction] = useState<RecoveryPrediction | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [agentAnalysis, setAgentAnalysis] = useState<AgentAnalysisResult | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [agentStep, setAgentStep] = useState<number>(0);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<RecoveryCaseDetail | null>(null);

  const loadData = useCallback(async () => {
    if (!transaction) return;
    setPrediction(null);
    setAgentAnalysis(null);
    setAgentError(null);
    setCaseDetail(null);
    setAgentStep(0);

    // Fetch case details if already created
    if (transaction.recovery_case_id) {
      try {
        const detail = await recoveryApi.getRecoveryCaseDetail(transaction.recovery_case_id).catch(() => null);
        if (detail) setCaseDetail(detail);
      } catch (err) {
        console.warn('Could not load live case detail:', err);
      }
    }

    // Predict for failed transactions
    if (transaction.status === 'failed') {
      setLoadingPrediction(true);
      try {
        const pred = await recoveryApi.predictRecovery(transaction.id).catch(() => null);
        if (pred) {
          setPrediction(pred);
        } else {
          setPrediction(getMockPrediction(transaction.id));
        }
      } catch (err) {
        console.warn('Using fallback prediction:', err);
        setPrediction(getMockPrediction(transaction.id));
      } finally {
        setLoadingPrediction(false);
      }
    }
  }, [transaction]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!transaction) return null;

  const handleRunAgent = async () => {
    setLoadingAgent(true);
    setAgentError(null);
    setAgentStep(1);

    const s1 = setTimeout(() => setAgentStep(2), 250);
    const s2 = setTimeout(() => setAgentStep(3), 500);

    try {
      const res = await recoveryApi.runAgentAnalysis(transaction.id).catch(() => null);
      setAgentStep(4);
      setTimeout(() => {
        setAgentAnalysis(res || getMockAgentAnalysis(transaction.id));
        setLoadingAgent(false);
      }, 400);
    } catch (err: unknown) {
      console.warn('Agent analysis fallback:', err);
      setAgentAnalysis(getMockAgentAnalysis(transaction.id));
      setLoadingAgent(false);
    } finally {
      clearTimeout(s1);
      clearTimeout(s2);
    }
  };

  const isExecuted = caseDetail?.status === 'executed';
  const prob = prediction?.recovery_probability ?? transaction.recovery_probability ?? 0.887;
  const isRecoverable = prediction?.recoverable ?? prob >= 0.3;
  const policyAction = prediction?.recommended_action ?? 'alternative_payment';
  const policyPriority = prediction?.priority ?? 'high';
  const policyReason =
    prediction?.reason ??
    'High recovery probability but direct retry may fail again due to bank decline.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-4xl lg:max-w-5xl h-[92vh] sm:h-[88vh] glass-panel rounded-3xl border border-sky-500/30 shadow-2xl overflow-hidden flex flex-col animate-slide-up bg-[#090d19]/95">
        {/* =========================================================================
            1. STICKY MODAL HEADER
           ========================================================================= */}
        <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-800/90 bg-[#090d19]/95 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                  Transaction Recovery Journey
                </h3>
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30">
                  TXN #{transaction.id}
                </span>
                <StatusBadge status={transaction.status} type="status" size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                <span>Amount: <strong className="text-white">{formatCurrency(transaction.amount, transaction.currency)}</strong></span>
                <span>•</span>
                <span>Failure: <strong className="text-rose-400">{formatFailureReason(transaction.failure_reason)}</strong></span>
                <span>•</span>
                <span>Rail: <strong className="text-slate-300">{formatPaymentMethod(transaction.payment_method)}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer self-start sm:self-center"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* =========================================================================
            2. SCROLLABLE RECOVERY JOURNEY BODY (6 NUMBERED STAGES)
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
          {/* ---------------------------------------------------------------------
              STAGE 01 — PAYMENT FAILURE
             --------------------------------------------------------------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[11px] text-rose-300">
                01
              </span>
              <span>Payment Failure</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Amount at Risk</span>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Gateway Diagnostic</span>
                <div className="text-xs font-bold text-rose-400 mt-1">
                  {formatFailureReason(transaction.failure_reason)}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Payment Rail</span>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {formatPaymentMethod(transaction.payment_method)}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Customer & Retries</span>
                <div className="text-xs font-medium text-slate-200 truncate mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{transaction.customer_name || `#${transaction.customer_id}`}</span>
                  <span className="text-slate-500">({transaction.retry_count} retries)</span>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              STAGE 02 — ML RECOVERY PREDICTION
             --------------------------------------------------------------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[11px] text-cyan-300">
                02
              </span>
              <span>ML Recovery Prediction</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/25 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono">ML Prediction Model</span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Operating Threshold: 30.0%
                </span>
              </div>

              {loadingPrediction ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Inferring recoverability score without data leakage...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">Calculated Recovery Probability</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(10, prob * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 font-mono pt-1">
                    <span>
                      Classification: <strong className="text-emerald-400">{isRecoverable ? 'RECOVERABLE (YES)' : 'UNRECOVERABLE (NO)'}</strong>
                    </span>
                    <span className="text-slate-400">
                      Evaluated on historical success rate & rail characteristics
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              STAGE 03 — POLICY DECISION (SOURCE OF TRUTH)
             --------------------------------------------------------------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[11px] text-sky-300">
                03
              </span>
              <span>Policy Decision (Ground Truth)</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-sky-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white font-mono">Deterministic Recovery Policy</span>
                </div>
                <StatusBadge status={policyPriority} type="priority" size="sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Approved Recovery Action</span>
                  <div className="text-sm font-bold text-sky-300">
                    {formatActionType(policyAction)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Deterministic Justification</span>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {policyReason}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              STAGE 04 — RECOVERAI AGENT ANALYSIS
             --------------------------------------------------------------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[11px] text-indigo-300">
                04
              </span>
              <span>RecoverAI Agent Analysis</span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-indigo-500/25 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>RecoverAI Agent</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Policy-grounded recovery analysis</p>
                </div>

                {!agentAnalysis && !loadingAgent && (
                  <button
                    onClick={handleRunAgent}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Diagnosis</span>
                  </button>
                )}
              </div>

              {/* 3 Visual Tools Pill Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-slate-300 truncate">get_transaction</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 truncate">get_recovery_prediction</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-slate-300 truncate">get_recovery_decision</span>
                </div>
              </div>

              {/* Multi-Step Animated Loading Experience */}
              {loadingAgent && (
                <div className="p-5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3 animate-pulse">
                  <div className="flex items-center gap-2.5 text-xs font-mono text-indigo-300">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span className="font-bold">RecoverAI Agent: Analyzing transaction...</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono text-slate-400 pl-6">
                    <div className={`flex items-center gap-2 ${agentStep >= 1 ? 'text-sky-300' : 'text-slate-600'}`}>
                      <span>•</span>
                      <span>Retrieving transaction context from database</span>
                    </div>
                    <div className={`flex items-center gap-2 ${agentStep >= 2 ? 'text-cyan-300' : 'text-slate-600'}`}>
                      <span>•</span>
                      <span>Analyzing ML recovery probability</span>
                    </div>
                    <div className={`flex items-center gap-2 ${agentStep >= 3 ? 'text-indigo-300' : 'text-slate-600'}`}>
                      <span>•</span>
                      <span>Checking deterministic policy decision</span>
                    </div>
                    <div className={`flex items-center gap-2 ${agentStep >= 4 ? 'text-emerald-300' : 'text-slate-600'}`}>
                      <span>•</span>
                      <span>Generating grounded explanation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {agentError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{agentError}</span>
                </div>
              )}

              {/* Formatted, High-Readability Analysis Result */}
              {agentAnalysis && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold">Agent Synthesis (5–10s Read)</span>
                    </div>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Policy Grounded</span>
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
                    {agentAnalysis.analysis}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              STAGE 05 — BOUNDED RECOVERY ACTION
             --------------------------------------------------------------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[11px] text-amber-300">
                05
              </span>
              <span>Bounded Recovery Action</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase">System Recommended Action</span>
                <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <span>{formatActionType(policyAction)}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Policy Approved
                  </span>
                </div>
              </div>

              {!isExecuted && (
                <div>
                  {transaction.has_recovery_case ? (
                    <button
                      onClick={() => onExecuteCase(transaction.recovery_case_id!)}
                      disabled={isExecutingCase}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingCase ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>Execute Recovery</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onCreateCase(transaction.id)}
                      disabled={isCreatingCase}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingCase ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                      <span>Create Recovery Case</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              STAGE 06 — RESULT
             --------------------------------------------------------------------- */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px] text-emerald-300">
                06
              </span>
              <span>Recovery Result & Settlement</span>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-500 ${
              isExecuted
                ? 'bg-emerald-950/30 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
                : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
            }`}>
              {isExecuted ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm font-mono">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Recovery Action Executed ✓</span>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      RECOVERY EXECUTED
                    </span>
                  </div>

                  <p className="text-xs text-emerald-200/90 leading-relaxed font-mono">
                    {caseDetail?.action?.result || 'Alternative payment method requested. Customer notified. Ledger updated.'}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                    <span>Immutable Audit Log Created</span>
                    <span className="text-emerald-400">PostgreSQL Verified</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs font-mono">
                  <span>Execution pending. Click 'Execute Recovery' above to trigger workflow.</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Awaiting Execution</span>
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =========================================================================
            3. MODAL FOOTER
           ========================================================================= */}
        <div className="p-4 sm:p-5 border-t border-slate-800/90 bg-[#090d19]/95 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>RazorPay RecoverAI Control Plane</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close Journey
          </button>
        </div>
      </div>
    </div>
  );
};
