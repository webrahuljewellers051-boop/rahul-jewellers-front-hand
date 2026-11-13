
import React, { useEffect, useState } from "react";
import { Crown, Sparkles } from "lucide-react";

export default function IntroSplash({ onFinish }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 2200);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#080707] transition-all duration-700 ${
        exiting
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      <style>{`
        @keyframes introFadeUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes introGlow {
          0%, 100% { opacity: 0.35; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }

        @keyframes introShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .intro-content {
          animation: introFadeUp 1.1s ease-out both;
        }

        .intro-monogram {
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
          animation: introShine 4s linear infinite;
        }

        .intro-glow {
          animation: introGlow 4s ease-in-out infinite;
        }
      `}</style>

      <div className="intro-glow absolute h-[380px] w-[380px] rounded-full bg-[#a77b35]/10 blur-[100px]" />

      <div className="intro-content relative z-10 flex flex-col items-center px-6 text-center">
        <div className="mb-7 flex items-center gap-3 text-[#c9a45c]">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a45c]" />
          <Sparkles size={15} />
          <span className="text-[9px] font-semibold uppercase tracking-[5px]">
            Since Generations
          </span>
          <Sparkles size={15} />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a45c]" />
        </div>

        <div className="relative mb-7 flex h-32 w-32 items-center justify-center rounded-full border border-[#c9a45c]/50 shadow-[0_0_55px_rgba(201,164,92,0.12)]">
          <div className="absolute inset-2 rounded-full border border-[#c9a45c]/20" />

          <Crown
            size={22}
            strokeWidth={1.2}
            className="absolute top-4 text-[#e8cd91]"
          />

          <span className="intro-monogram mt-4 font-serif text-6xl font-medium tracking-[-5px]">
            RJ
          </span>
        </div>

        <h1 className="font-serif text-3xl font-medium tracking-[4px] text-[#f4e6c7] sm:text-5xl">
          RAHUL JEWELLERS
        </h1>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px w-10 bg-[#c9a45c]/60" />
          <span className="text-[10px] uppercase tracking-[4px] text-[#c9a45c]">
            Elegance. Heritage. Trust.
          </span>
          <span className="h-px w-10 bg-[#c9a45c]/60" />
        </div>

        <p className="text-xs tracking-[2px] text-[#a99b83]">
          SHEOGANJ EXCLUSIVE COLLECTION
        </p>

        <div className="mt-12 h-[2px] w-36 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[introProgress_2.2s_ease-in-out_forwards] bg-gradient-to-r from-[#9d773b] via-[#fff0bd] to-[#c49a52]" />
        </div>
      </div>

      <style>{`
        @keyframes introProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      <div className="absolute bottom-7 text-[9px] tracking-[3px] text-white/30">
        AN EXPERIENCE OF FINE JEWELLERY
      </div>
    </div>
  );
}
