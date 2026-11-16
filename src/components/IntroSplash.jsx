
import React, { useEffect, useRef, useState } from 'react';
import { Crown, Sparkles } from 'lucide-react';

export default function IntroSplash({ onFinish }) {
  const [exiting, setExiting] = useState(false);
  const onFinishRef = useRef(onFinish);

  // Keep the latest callback without restarting the splash timers.
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const exitDelay = reduceMotion ? 250 : 2200;
    const finishDelay = reduceMotion ? 350 : 2950;

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, exitDelay);

    const finishTimer = window.setTimeout(() => {
      if (typeof onFinishRef.current === 'function') {
        onFinishRef.current();
      }
    }, finishDelay);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#080707] transition-all duration-700 ${
        exiting
          ? 'pointer-events-none scale-105 opacity-0'
          : 'scale-100 opacity-100'
      }`}
      role="status"
      aria-label="Welcome to Rahul Jewellers Sheoganj"
    >
      <style>{`
        @keyframes rjIntroFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rjIntroGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.08);
          }
        }

        @keyframes rjIntroShine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes rjIntroProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .rj-intro-content {
          animation: rjIntroFadeUp 1.1s ease-out both;
        }

        .rj-intro-monogram {
          background: linear-gradient(
            110deg,
            #9d773b,
            #fff0bd,
            #c49a52,
            #fff1c5,
            #9d773b
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: rjIntroShine 4s linear infinite;
        }

        .rj-intro-glow {
          animation: rjIntroGlow 4s ease-in-out infinite;
        }

        .rj-intro-progress {
          animation: rjIntroProgress 2.2s ease-in-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .rj-intro-content,
          .rj-intro-monogram,
          .rj-intro-glow,
          .rj-intro-progress {
            animation: none !important;
          }

          .rj-intro-progress {
            transform: scaleX(1);
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="rj-intro-glow absolute h-[300px] w-[300px] rounded-full bg-[#a77b35]/10 blur-[100px] sm:h-[380px] sm:w-[380px]"
      />

      <div className="rj-intro-content relative z-10 flex w-full flex-col items-center px-4 text-center sm:px-6">
        <div className="mb-7 flex items-center gap-2 text-[#c9a45c] sm:gap-3">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#c9a45c] sm:w-12" />

          <Sparkles
            size={15}
            aria-hidden="true"
          />

          <span className="text-[9px] font-semibold uppercase tracking-[3px] sm:tracking-[5px]">
            Since Generations
          </span>

          <Sparkles
            size={15}
            aria-hidden="true"
          />

          <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#c9a45c] sm:w-12" />
        </div>

        <div className="relative mb-7 flex h-32 w-32 items-center justify-center rounded-full border border-[#c9a45c]/50 shadow-[0_0_55px_rgba(201,164,92,0.12)]">
          <div className="absolute inset-2 rounded-full border border-[#c9a45c]/20" />

          <Crown
            size={22}
            strokeWidth={1.2}
            aria-hidden="true"
            className="absolute top-4 text-[#e8cd91]"
          />

          <span className="rj-intro-monogram mt-4 font-serif text-6xl font-medium tracking-[-5px]">
            RJ
          </span>
        </div>

        <h1 className="font-serif text-2xl font-medium tracking-[2px] text-[#f4e6c7] sm:text-5xl sm:tracking-[4px]">
          RAHUL JEWELLERS
        </h1>

        <div className="my-5 flex items-center gap-2 sm:gap-3">
          <span className="h-px w-5 bg-[#c9a45c]/60 sm:w-10" />

          <span className="text-[9px] uppercase tracking-[2px] text-[#c9a45c] sm:text-[10px] sm:tracking-[4px]">
            Elegance. Heritage. Trust.
          </span>

          <span className="h-px w-5 bg-[#c9a45c]/60 sm:w-10" />
        </div>

        <p className="text-[11px] tracking-[1.5px] text-[#a99b83] sm:text-xs sm:tracking-[2px]">
          SHEOGANJ EXCLUSIVE COLLECTION
        </p>

        <div className="mt-12 h-[2px] w-36 overflow-hidden rounded-full bg-white/10">
          <div className="rj-intro-progress h-full w-full origin-left bg-gradient-to-r from-[#9d773b] via-[#fff0bd] to-[#c49a52]" />
        </div>
      </div>

      <div className="absolute bottom-7 px-4 text-center text-[9px] tracking-[2px] text-white/30 sm:tracking-[3px]">
        AN EXPERIENCE OF FINE JEWELLERY
      </div>
    </div>
  );
}
