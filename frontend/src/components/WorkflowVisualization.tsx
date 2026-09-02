import { useState } from 'react';
import {
  AlertCircle,
  Database,
  Cpu,
  ShieldCheck,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
} from 'lucide-react';

export const WorkflowVisualization = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const pipelineSteps = [
    {
      id: 0,
      title: 'Payment Failure',
      short: 'Payment Failure',
      subtitle: 'Degradation Detected',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/30 text-rose-300',
      description: 'A transaction fails across payment rails with a specific gateway error code.',
      whatHappens: 'Real-time telemetry catches failure events (e.g. bank decline, timeout, insufficient funds).',
    },
    {
      id: 1,
      title: 'Transaction Data',
      short: 'Transaction Data',
      subtitle: 'Feature Extraction',
      icon: <Database className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/30 text-sky-300',
      description: 'Historical behavior features are assembled with zero data leakage.',
      whatHappens: 'Extracts customer success rate, retry history, payment method, and amount prior to the event.',
    },
    {
      id: 2,
      title: 'ML Recovery Prediction',
      short: 'ML Prediction',
      subtitle: 'Scikit-Learn Model',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30 text-cyan-300',
      description: 'Trained model calculates the exact probability that the payment is recoverable.',
      whatHappens: 'Balances True Positive recovered GMV against retry costs at a 30% operating threshold.',
    },
    {
      id: 3,
      title: 'Recovery Policy',
      short: 'Policy Decision',
      subtitle: 'Source of Truth',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/30 text-blue-300',
      description: 'Deterministic rules choose the compliant, cost-effective recovery action.',
      whatHappens: 'Enforces hard guardrails: alternate payment method, retry sequencer, or no action.',
    },
    {
      id: 4,
      title: 'Recovery Case',
      short: 'Recovery Case',
      subtitle: 'State Persistence',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/30 text-indigo-300',
      description: 'Creates an idempotent case record preventing duplicate recovery attempts.',
      whatHappens: 'Guarantees transaction-level uniqueness and bounded action states.',
    },
    {
      id: 5,
      title: 'RecoverAI Agent',
      short: 'AI Agent',
      subtitle: 'LLM Explainability',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 text-purple-300',
      description: 'Multi-turn agent gathers context via function tools to explain the decision.',
      whatHappens: 'Generates human-readable, grounded explainability without altering policy rules.',
    },
    {
      id: 6,
      title: 'Recovery Action',
      short: 'Execution',
      subtitle: 'Bounded Workflow',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 text-amber-300',
      description: 'Executes the approved intervention safely with status notifications.',
      whatHappens: 'Dispatches alternate payment requests or retries, updating ledger state.',
    },
    {
      id: 7,
      title: 'Recovered Revenue',
      short: 'Revenue Won',
      subtitle: 'Audit Recorded',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 text-emerald-300',
      description: 'Measured money recovered across the batch with immutable audit trail.',
      whatHappens: 'Logs complete regulatory record to PostgreSQL audit_events with actor and timestamp.',
    },
  ];

  const current = pipelineSteps[activeStep];

  return (
    <div className="space-y-10 max-w-5xl animate-fade-in">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-cyan-400" />
          <span>RecoverAI End-to-End Architecture</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          A closed-loop system: from detecting payment degradation to executing bounded recovery.
        </p>
      </div>

      {/* 2. Core Architectural Principle Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 shadow-xl space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
          Core Architectural Principle
        </span>
        <div className="text-base sm:text-lg font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2 font-mono">
          <span className="text-cyan-300">ML predicts.</span>
          <span className="text-slate-500">→</span>
          <span className="text-sky-300">Policy decides.</span>
          <span className="text-slate-500">→</span>
          <span className="text-indigo-300">AI explains.</span>
          <span className="text-slate-500">→</span>
          <span className="text-emerald-300">Executor executes.</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          The deterministic Recovery Policy is the sole source of truth. The LLM provides explainability and does not invent or override policy actions.
        </p>
      </div>

      {/* 3. Visual Pipeline Flow (Interactive Blocks) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase font-mono text-slate-400 tracking-wider">
            1. Visual Recovery Pipeline (Click / Hover to Inspect)
          </h3>
          <span className="text-xs text-cyan-400 font-mono">Stage {activeStep + 1} of 8</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {pipelineSteps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                onMouseEnter={() => setActiveStep(idx)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 relative cursor-pointer ${
                  isSelected
                    ? `glass-panel ${step.color} shadow-lg scale-105 z-10 bg-slate-900`
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    {step.icon}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">0{idx + 1}</span>
                </div>
                <h4 className="text-[11px] font-bold text-white mt-2.5 leading-tight truncate">
                  {step.short}
                </h4>
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate">
                  {step.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Card */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-sky-500/25 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-900 border border-sky-500/30 text-sky-400">
              {current.icon}
            </div>
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase">
                Stage {activeStep + 1}: {current.subtitle}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {current.title}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Purpose</span>
              <p className="text-xs text-slate-200 leading-relaxed">{current.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">What Happens Here</span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">{current.whatHappens}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. "How RecoverAI Makes the Decision" Step-by-Step */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
        <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
          2. How RecoverAI Makes Decisions
        </h3>

        <div className="space-y-3">
          {[
            'Transaction data is captured immediately when a failure occurs.',
            'ML model computes recovery probability without future data leakage.',
            'Deterministic recovery policy determines the approved action using cost-sensitive guardrails.',
            'RecoverAI Agent gathers required context using specific function-calling tools.',
            'The agent produces grounded, human-readable explainability for merchants.',
            'The recovery action is executed through the bounded executor workflow.',
            'The result is recorded in an immutable regulatory audit trail in PostgreSQL.',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                {idx + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Collapsible Technical Implementation (Judge Tools Detail) */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-6 bg-slate-900/60 hover:bg-slate-900 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                3. Technical Implementation • Agent Function Tools
              </h3>
              <p className="text-xs text-slate-400">
                Click to inspect tool definitions used by the multi-turn LLM agent
              </p>
            </div>
          </div>

          <div className="p-1.5 rounded-xl bg-slate-800 text-slate-300">
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-6 border-t border-slate-800 space-y-4 bg-slate-950/50">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-xs font-mono font-bold text-cyan-400">
                get_transaction(transaction_id)
              </div>
              <p className="text-xs text-slate-300">
                Retrieves transaction information, payment method, customer history, and failure reason from PostgreSQL.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-xs font-mono font-bold text-sky-400">
                get_recovery_prediction(transaction_id)
              </div>
              <p className="text-xs text-slate-300">
                Retrieves the Scikit-learn ML model's recovery probability score and operating threshold (0.30).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-xs font-mono font-bold text-indigo-400">
                get_recovery_decision(transaction_id)
              </div>
              <p className="text-xs text-slate-300">
                Retrieves the deterministic recovery policy's approved action and justification rule.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
