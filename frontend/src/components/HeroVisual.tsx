import React, { useState, useEffect } from 'react';
import { AlertCircle, Cpu, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export const HeroVisual: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 0,
      title: 'Payment Failed',
      subtitle: 'TXN #1003 • Bank Declined',
      amount: '₹1,250.00',
      tag: 'Revenue at Risk',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      borderColor: activeStep === 0 ? 'border-rose-500/50 shadow-rose-500/20' : 'border-slate-800',
    },
    {
      id: 1,
      title: 'ML Prediction',
      subtitle: 'Operating Threshold: 0.30',
      amount: '88.74% Score',
      tag: 'High Recoverability',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      borderColor: activeStep === 1 ? 'border-cyan-500/50 shadow-cyan-500/20' : 'border-slate-800',
    },
    {
      id: 2,
      title: 'Policy Decision',
      subtitle: 'Deterministic Guardrails',
      amount: 'Alternative Payment',
      tag: 'HIGH Priority',
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
      tagColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      borderColor: activeStep === 2 ? 'border-sky-500/50 shadow-sky-500/20' : 'border-slate-800',
    },
    {
      id: 3,
      title: 'Recovered Revenue',
      subtitle: 'Executed & Audited',
      amount: '₹1,250.00 Won Back',
      tag: 'Recovery Ready',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      borderColor: activeStep === 3 ? 'border-emerald-500/50 shadow-emerald-500/20' : 'border-slate-800',
    },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Soft Ambient Glows */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative glass-panel rounded-3xl p-6 lg:p-7 border border-sky-500/20 shadow-2xl">
        {/* Header Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
              Autonomous Recovery Loop
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 font-mono">
            <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
            <span>Simulated Pipeline</span>
          </div>
        </div>

        {/* Step Cards Sequence */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCurrent = activeStep === index;
            const isPast = activeStep > index;

            return (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-6 transition-colors duration-500 z-0 ${
                      isPast || isCurrent ? 'bg-gradient-to-b from-sky-400 to-cyan-400' : 'bg-slate-800'
                    }`}
                  />
                )}

                <div
                  onClick={() => setActiveStep(index)}
                  className={`relative z-10 flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-500 cursor-pointer ${
                    isCurrent
                      ? `bg-slate-800/90 shadow-lg ${step.borderColor} scale-[1.02]`
                      : 'bg-slate-900/50 border-slate-800/70 hover:bg-slate-800/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isCurrent
                          ? 'bg-slate-900 border-sky-500/40 shadow-sm'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white tracking-tight">
                          {step.title}
                        </h4>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${step.tagColor}`}
                        >
                          {step.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white tracking-tight">
                      {step.amount}
                    </span>
                    {isCurrent && (
                      <div className="flex items-center justify-end gap-1 text-[10px] text-cyan-400 font-mono mt-0.5">
                        <span>Active</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">Zero Hallucinations • Policy Bound</span>
          <span className="text-sky-400 font-medium">100% Audit Tracked</span>
        </div>
      </div>
    </div>
  );
};
