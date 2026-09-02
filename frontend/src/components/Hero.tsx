import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Database } from 'lucide-react';
import { HeroVisual } from './HeroVisual';

interface HeroProps {
  onExplore: () => void;
  onViewTransactions: () => void;
  totalAtRisk?: number;
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onViewTransactions,
}) => {
  const [displayedTitle, setDisplayedTitle] = useState('');
  const fullTitle = 'Turn failed payments into recovered revenue.';

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullTitle.length) {
        setDisplayedTitle(fullTitle.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 28);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-sky-600/15 via-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/15 to-cyan-500/15 border border-sky-400/30 text-xs text-sky-300 font-mono tracking-wide shadow-sm shadow-sky-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Razorpay AI Hackathon • Track 03: Revenue Recovery</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-bold tracking-widest text-cyan-400 uppercase font-mono">
                RazorPay RecoverAI Control Plane
              </h2>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] min-h-[72px] sm:min-h-[120px]">
                {displayedTitle}
                <span className="inline-block w-1.5 h-8 sm:h-12 bg-cyan-400 ml-1.5 animate-pulse align-middle" />
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Autonomous payment recovery that detects revenue at risk, diagnoses root causes with machine learning, applies deterministic policy guardrails, and executes bounded interventions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExplore}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-sky-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Explore Recovery</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewTransactions}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white border border-slate-700/80 font-medium text-sm transition-all duration-200 cursor-pointer"
              >
                <span>View Live Transactions</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Data Leakage Pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Sub-ms ML Inference</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-sky-400" />
                <span>Complete Audit Trail</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
};
