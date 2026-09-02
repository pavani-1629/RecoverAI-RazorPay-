import { useEffect, useState, useCallback } from 'react';
import rpLogo from '../assets/RPLogo.jpg';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [brandTextVisible, setBrandTextVisible] = useState(false);
  const [subTextVisible, setSubTextVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  }, [onComplete]);

  useEffect(() => {
    // 0.15s: Logo fades in and scales from 0.85 -> 1.0
    const tLogo = setTimeout(() => {
      setLogoVisible(true);
    }, 150);

    // 0.4s: "RazorPay" text appears
    const tBrand = setTimeout(() => {
      setBrandTextVisible(true);
    }, 400);

    // 0.65s: "RecoverAI" appears right after
    const tSub = setTimeout(() => {
      setSubTextVisible(true);
    }, 650);

    // 2.0s: Begin exit animation (fade out, move up, scale up)
    const tExit = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // 2.5s: Complete splash and reveal main application
    const tComplete = setTimeout(() => {
      onComplete();
    }, 2500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(tLogo);
      clearTimeout(tBrand);
      clearTimeout(tSub);
      clearTimeout(tExit);
      clearTimeout(tComplete);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete, handleDismiss]);

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070a13] text-white select-none transition-all duration-500 ease-out cursor-pointer ${
        isExiting
          ? 'opacity-0 scale-105 -translate-y-2.5 pointer-events-none'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
    >
      {/* Skip Button in Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono transition-all shadow-lg"
      >
        <span>Skip Intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Soft Ambient Center Glow */}
      <div className="absolute w-80 h-80 bg-sky-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Pure Centered Brand Experience */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 px-6">
        {/* [LOGO] */}
        <div
          className={`transition-all duration-500 ease-out ${
            logoVisible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-[0.85] translate-y-2'
          }`}
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 border border-sky-400/30 p-1.5 shadow-2xl shadow-sky-500/15">
            <img
              src={rpLogo}
              alt="Razorpay Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* RazorPay */}
        <div
          className={`transition-all duration-500 ease-out ${
            brandTextVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <span className="text-sm sm:text-base font-bold tracking-widest text-sky-400 uppercase font-mono">
            RazorPay
          </span>
        </div>

        {/* RecoverAI */}
        <div
          className={`transition-all duration-500 ease-out ${
            subTextVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
            <span>Recover</span>
            <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono tracking-wider pt-2">
            AI REVENUE RECOVERY CONTROL PLANE
          </p>
        </div>

        <p className="text-[10px] text-slate-500 font-mono pt-4 animate-pulse">
          Click anywhere to continue
        </p>
      </div>
    </div>
  );
};

