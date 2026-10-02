import React from 'react';
import { BALL_IMAGES } from '../constants/ballImages';
import { BmwBossCrown, DragonAuraIcon, Sparkles, RoyalCrownJackpotIcon } from './CustomIcons';
import { sounds } from '../utils/soundEffects';

interface JackpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: string;
  prediction: string;
  predictedNumber: number;
  actualNumber: number;
  actualSize: string;
  matchedType?: 'FAVOR' | 'OPPOSITE' | null;
}

export const JackpotModal: React.FC<JackpotModalProps> = ({
  isOpen,
  onClose,
  period,
  prediction,
  predictedNumber,
  actualNumber,
  actualSize,
  matchedType,
}) => {
  if (!isOpen) return null;

  const ballImg = BALL_IMAGES[actualNumber] || BALL_IMAGES[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#020308]/92 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Golden Supernova Ambient Flare */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-gradient-to-tr from-amber-500/35 via-yellow-400/25 to-red-600/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-ping" />
      </div>

      {/* Standalone Mega Jackpot Golden Frame */}
      <div className="relative w-full max-w-[370px] rounded-[36px] p-[2.5px] bg-gradient-to-b from-yellow-300 via-amber-500 to-red-600 shadow-[0_0_100px_rgba(251,191,36,0.65)] animate-[pop-bounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
        {/* Inner Casino Cyber-Gold Vault */}
        <div className="relative rounded-[34px] bg-gradient-to-b from-[#140f02] via-[#0d0a1b] to-[#040409] p-5 sm:p-6 text-center overflow-hidden">
          {/* Sweeping Golden Light Ray */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/25 to-transparent -translate-x-full animate-[shine-sweep_2.8s_infinite] pointer-events-none" />

          {/* Top Brand with Skull Crest */}
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <BmwBossCrown className="w-5 h-5 text-yellow-300" />
            <span className="font-orbitron font-black text-[11px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100">
              ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎
            </span>
          </div>

          {/* 777 Jackpot Crown Ribbon */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/30 via-amber-400/40 to-yellow-600/30 border-2 border-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.6)] mb-2 animate-bounce">
            <RoyalCrownJackpotIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-[11px] font-orbitron font-black tracking-widest text-yellow-200 uppercase">
              777 MEGA JACKPOT HIT!
            </span>
            <RoyalCrownJackpotIcon className="w-4 h-4 text-yellow-300 -scale-x-100" />
          </div>

          {/* Massive Jackpot Headline */}
          <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-amber-500 tracking-wider drop-shadow-[0_0_30px_rgba(251,191,36,0.9)]">
            JACKPOT 9X!
          </h1>
          <p className="text-[10px] font-rajdhani font-bold text-amber-200 tracking-widest uppercase mt-0.5">
            EXACT SINGLE NUMBER MATCH CONFIRMED
          </p>

          {/* Giant Floating 3D Ball with Double Solar Ring */}
          <div className="relative w-32 h-32 mx-auto my-3 flex items-center justify-center">
            {/* Spinning Outer Golden Corona Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/60 border-t-white border-b-amber-500 animate-spin-slow" />
            {/* Counter-Spinning Cyber Ring */}
            <div className="absolute inset-2.5 rounded-full border border-dashed border-cyan-400/70 animate-spin-reverse" />
            {/* Flare Burst */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400/40 via-amber-500/30 to-red-500/30 blur-2xl animate-pulse" />

            {/* Specular Glare */}
            <div
              className="wingo-ball-specular-glare z-20"
              style={{ width: '45%', height: '28%', top: '8%', left: '16%' }}
            />

            {/* Exact Number Ball */}
            <img
              src={ballImg}
              alt={`Jackpot Ball ${actualNumber}`}
              className="w-24 h-24 sm:w-26 sm:h-26 object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)] brightness-115 contrast-125 animate-[float-ball_2.6s_ease-in-out_infinite]"
            />

            {/* Golden Pedestal Reflection */}
            <div className="absolute -bottom-3 w-20 h-4 rounded-full bg-yellow-400/60 blur-md" />
          </div>

          {/* Golden Multiplier Telemetry */}
          <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-black/75 border border-yellow-400/40 my-3 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono tracking-widest text-amber-400 uppercase">PERIOD</span>
              <span className="font-mono font-black text-xs text-white mt-0.5">#{period.slice(-5)}</span>
            </div>

            <div className="flex flex-col border-x border-white/10 px-1">
              <span className="text-[8px] font-mono tracking-widest text-amber-400 uppercase">HIT NUMBER</span>
              <span className="font-orbitron font-black text-sm text-yellow-300 mt-0.5">
                BALL #{actualNumber}
              </span>
              <span className="text-[8px] font-mono font-bold text-emerald-400">
                {matchedType === 'OPPOSITE' ? 'OPPOSITE BALL' : 'FAVOR BALL'}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] font-mono tracking-widest text-amber-400 uppercase">PAYOUT</span>
              <span className="font-orbitron font-black text-sm text-emerald-400 mt-0.5">
                9.82×
              </span>
            </div>
          </div>

          <div className="text-[10px] font-rajdhani font-semibold text-yellow-200/90 mb-3.5">
            👑 Congratulations! Single target ball hit exactly on WinGo 1M live draw.
          </div>

          {/* Claim Mega Jackpot Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black font-orbitron font-black text-xs sm:text-sm tracking-[0.16em] uppercase shadow-[0_10px_35px_rgba(251,191,36,0.6)] hover:brightness-115 active:scale-95 transition-all duration-200 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shine-sweep_2s_infinite]" />
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <span>CLAIM MEGA JACKPOT</span>
              <Sparkles className="w-4 h-4 text-black" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
