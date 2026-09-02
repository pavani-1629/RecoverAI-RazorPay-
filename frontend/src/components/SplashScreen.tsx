import { useEffect, useState } from 'react';
import rpLogo from '../assets/RPLogo.jpg';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [brandTextVisible, setBrandTextVisible] = useState(false);
  const [subTextVisible, setSubTextVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 0.2s: Logo fades in and scales from 0.85 -> 1.0
    const tLogo = setTimeout(() => {
      setLogoVisible(true);
    }, 200);

    // 0.7s: "RazorPay" text appears with subtle upward movement
    const tBrand = setTimeout(() => {
      setBrandTextVisible(true);
    }, 700);

    // 1.0s: "RecoverAI" appears right after
    const tSub = setTimeout(() => {
      setSubTextVisible(true);
    }, 1000);

    // 2.5s: Begin exit animation (fade out, move up, scale up)
    const tExit = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // 3.2s: Complete splash and reveal main application
    const tComplete = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(tLogo);
      clearTimeout(tBrand);
      clearTimeout(tSub);
      clearTimeout(tExit);
      clearTimeout(tComplete);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070a13] text-white select-none transition-all duration-700 ease-out ${
        isExiting
          ? 'opacity-0 scale-105 -translate-y-2.5 pointer-events-none'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
    >
      {/* Soft Ambient Center Glow */}
      <div className="absolute w-80 h-80 bg-sky-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Pure Centered Brand Experience */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 px-6">
        {/* [LOGO] */}
        <div
          className={`transition-all duration-700 ease-out ${
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
          className={`transition-all duration-600 ease-out ${
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
          className={`transition-all duration-600 ease-out ${
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
            AI REVENUE RECOVERY
          </p>
        </div>
      </div>
    </div>
  );
};
