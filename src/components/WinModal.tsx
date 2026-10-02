import React from 'react';
import { BALL_IMAGES } from '../constants/ballImages';
import { BmwBossCrown, TrophyVipIcon, Sparkles } from './CustomIcons';
import { sounds } from '../utils/soundEffects';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: string;
  prediction: string;
  predictedNumber: number;
  actualNumber: number;
  actualSize: string;
  isJackpot: boolean;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  onClose,
  period,
  prediction,
  predictedNumber,
  actualNumber,
  actualSize,
  isJackpot,
}) => {
  if (!isOpen) return null;

  const ballImg = BALL_IMAGES[actualNumber] || BALL_IMAGES[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#02040b]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-[fadeIn_0.25s_ease-out]">
      {/* Background radial rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-gradient-to-tr from-emerald-500/20 via-amber-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Main Holographic Crystal Card */}
      <div className="relative w-full max-w-[360px] rounded-[30px] p-[2px] bg-gradient-to-b from-amber-300 via-emerald-400 to-cyan-400 shadow-[0_0_80px_rgba(16,224,127,0.5)] animate-[pop-bounce_0.5s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
        {/* Inner Card Container */}
        <div className="relative rounded-[28px] bg-gradient-to-b from-[#0e1635] via-[#070c20] to-[#030611] p-5 sm:p-6 text-center overflow-hidden">
          {/* Animated Sweeping Light Beam */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shine-sweep_3.5s_infinite] pointer-events-none" />

          {/* Top Brand & Victory Crest */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <BmwBossCrown className="w-5 h-5 text-amber-400" />
            <span className="font-orbitron font-black text-[11px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎
            </span>
          </div>

          {/* Victory Main Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/25 to-teal-500/25 border border-emerald-400/80 shadow-[0_0_15px_rgba(16,224,127,0.4)] mb-2">
            <TrophyVipIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-orbitron font-black tracking-wider text-emerald-300 uppercase">
              {isJackpot ? '🎰 EXACT NUMBER JACKPOT!' : '⚡ VIP SIGNAL VICTORY'}
            </span>
          </div>

          {/* Big Victory Heading */}
          <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-300 to-emerald-500 tracking-wider drop-shadow-[0_0_20px_rgba(16,224,127,0.6)]">
            {isJackpot ? 'JACKPOT STRIKE!' : 'WIN CONFIRMED!'}
          </h2>

          {/* 3D Floating Wingo Ball Holographic Pedestal */}
          <div className="relative w-28 h-28 mx-auto my-3 flex items-center justify-center">
            {/* Multi-layered Rotating Energy Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 border-t-amber-400 border-r-cyan-400 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full border border-dashed border-emerald-300/40 animate-spin-reverse" />
            
            {/* Glowing Aura Halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400/35 via-teal-300/25 to-amber-400/30 blur-xl animate-pulse" />

            {/* Specular Glare Arc */}
            <div className="wingo-ball-specular-glare" style={{ width: '42%', height: '26%', top: '8%', left: '16%' }} />

            {/* Actual Polished 3D Ball */}
            <img
              src={ballImg}
              alt={`Win Ball ${actualNumber}`}
              className="w-20 h-20 sm:w-22 sm:h-22 object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] brightness-110 contrast-115 animate-[float-ball_2.8s_ease-in-out_infinite]"
            />

            {/* Pedestal Glow Reflection Base */}
            <div className="absolute -bottom-2 w-16 h-3 rounded-full bg-emerald-400/40 blur-sm" />
          </div>

          {/* Holographic Matrix Breakdown */}
          <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-black/60 border border-white/15 my-3 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">PERIOD</span>
              <span className="font-mono font-black text-xs text-white mt-0.5">#{period.slice(-5)}</span>
            </div>

            <div className="flex flex-col border-x border-white/10 px-1">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">PREDICTED</span>
              <span className="font-orbitron font-extrabold text-[11px] text-amber-300 mt-0.5">
                {prediction} (#{predictedNumber})
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">ACTUAL</span>
              <span className="font-orbitron font-extrabold text-[11px] text-emerald-400 mt-0.5">
                {actualSize} (#{actualNumber})
              </span>
            </div>
          </div>

          {/* Success Status Notice */}
          <div className="text-[10px] font-rajdhani font-semibold text-emerald-300/90 mb-3.5">
            ✓ Result verified on official WinGo 1M live stream. Anti-trap protocol confirmed.
          </div>

          {/* Collect Profit Neon Action Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 text-black font-orbitron font-black text-xs sm:text-sm tracking-[0.14em] uppercase shadow-[0_10px_30px_rgba(16,224,127,0.45)] hover:brightness-110 active:scale-95 transition-all duration-200 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine-sweep_2.5s_infinite]" />
            <span className="relative z-10">COLLECT PROFIT ✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};
