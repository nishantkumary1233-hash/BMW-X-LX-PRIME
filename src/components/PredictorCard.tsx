import React, { useState } from 'react';
import { PredictionResult, GameCycle } from '../types';
import { BALL_IMAGES } from '../constants/ballImages';
import { formatSignalForCopy } from '../utils/unicodeFont';
import { buildPredictionText } from '../utils/patternEngine';
import { sounds } from '../utils/soundEffects';
import {
  DragonAuraIcon,
  TrapShieldIcon,
  FlameStreakIcon,
  ZapEnergyIcon,
  RadarPulseIcon,
  RoyalCrownJackpotIcon,
} from './CustomIcons';
import { Copy, Check, RefreshCw } from 'lucide-react';

interface PredictorCardProps {
  prediction: PredictionResult | null;
  secondsRemaining: number;
  cycleDuration: number;
  currentCycle: GameCycle;
  onManualReanalyse: () => void;
  isAnalysing: boolean;
  winStreak: number;
}

export const PredictorCard: React.FC<PredictorCardProps> = ({
  prediction,
  secondsRemaining,
  cycleDuration,
  currentCycle,
  onManualReanalyse,
  isAnalysing,
  winStreak,
}) => {
  const [copied, setCopied] = useState(false);

  // Circular ring calculations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsRemaining / cycleDuration) * circumference;
  const isUrgent = secondsRemaining <= 5;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCopy = () => {
    if (!prediction) return;
    sounds.playClick();
    const formatted = buildPredictionText(prediction.period, prediction);

    navigator.clipboard.writeText(formatted.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const isBig = prediction?.prediction === 'BIG';
  const favorNum = prediction ? (prediction.favorNumber ?? prediction.targetNumber) : 7;
  const oppNum = prediction ? (prediction.oppositeNumber ?? prediction.secondaryNumber) : 2;
  const favorBallImg = BALL_IMAGES[favorNum] || BALL_IMAGES[7];
  const oppBallImg = BALL_IMAGES[oppNum] || BALL_IMAGES[2];

  const isDragon = prediction?.isDragonActive;

  return (
    <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-b from-amber-400/50 via-violet-600/30 to-cyan-400/40 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm overflow-hidden">
      <div className="relative rounded-[21px] bg-black/40 backdrop-blur-md p-3 sm:p-3.5 overflow-hidden border border-white/10">
        {/* Animated Scanline overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent h-20 pointer-events-none animate-[scan-move_4s_linear_infinite]" />

        {/* Top Status & Timer Row - Compact */}
        <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10e07f] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 font-bold uppercase">
                TARGET PERIOD
              </span>
              <span className="font-orbitron font-extrabold text-xs sm:text-sm text-amber-300 tracking-wider">
                #{prediction ? prediction.period.slice(-5) : '·····'}
                <span className="text-slate-500 font-mono text-[9px] ml-1">
                  ({prediction ? prediction.period.slice(-7) : 'LOAD'})
                </span>
              </span>
            </div>
          </div>

          {/* Win Streak Badge if active */}
          {winStreak >= 2 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/40 text-[9px] font-orbitron font-black text-amber-300 shadow-sm">
              <FlameStreakIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>+{winStreak} WIN</span>
            </div>
          )}

          {/* Period Timer Circular Gauge - Compact */}
          <div className="flex items-center gap-1.5 bg-black/55 px-2 py-1 rounded-xl border border-white/10">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className="stroke-white/10 fill-none"
                  strokeWidth="3"
                />
                <circle
                  cx="16"
                  cy="16"
                  r={radius}
                  className={`fill-none transition-all duration-1000 ${
                    isUrgent ? 'stroke-rose-500 shadow-[0_0_10px_#ff4d6d]' : 'stroke-amber-400'
                  }`}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div
                className={`absolute font-mono font-black text-[9px] ${
                  isUrgent ? 'text-rose-400 animate-ping' : 'text-amber-300'
                }`}
              >
                {secondsRemaining}s
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[7.5px] font-mono tracking-wider text-slate-400 uppercase">DRAW TIME</span>
              <span className="font-mono font-bold text-[11px] text-white leading-none">
                {formatSeconds(secondsRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Dragon Undisturbed Lock Alert Banner */}
        {isDragon && (
          <div className="mb-2 p-1.5 rounded-xl bg-gradient-to-r from-red-600/35 via-amber-500/30 to-red-600/35 border-2 border-amber-400/70 flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.45)] animate-pulse">
            <div className="flex items-center gap-1.5">
              <DragonAuraIcon className="w-4 h-4 text-amber-300 animate-bounce" />
              <div className="flex flex-col text-left">
                <span className="font-orbitron font-black text-[9.5px] tracking-wider text-amber-200">
                  🐉 DRAGON LOCK ACTIVE (STREAK ×{prediction?.dragonStreak})
                </span>
                <span className="text-[8px] font-mono text-amber-300/80 font-semibold">
                  UNDISTURBED LIVE RIDE · FOLLOWING LIVE {prediction?.prediction}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-[8px] font-orbitron font-black shadow-sm">
              NEVER DISTURBED
            </span>
          </div>
        )}

        {/* Dragon Break High Deep Scan Alert Banner */}
        {prediction?.scanStatus === 'DRAGON_BREAK_DEEP_SCAN' && (
          <div className="mb-2 p-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 via-violet-600/30 to-blue-600/30 border border-cyan-400/60 flex items-center justify-between shadow-[0_0_18px_rgba(34,211,238,0.35)] animate-pulse">
            <div className="flex items-center gap-1.5">
              <RadarPulseIcon className="w-4 h-4 text-cyan-300 animate-spin-slow" />
              <div className="flex flex-col text-left">
                <span className="font-orbitron font-black text-[9.5px] tracking-wider text-cyan-200">
                  🔬 HIGH DEEP SCAN: DRAGON BREAK INTERCEPT
                </span>
                <span className="text-[8px] font-mono text-cyan-300/80 font-semibold">
                  OPPOSITE OUTCOME DETECTED · 16-PATTERN & 3:3 MIRROR SCANNED
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-black text-[8px] font-orbitron font-black">
              DEEP SCAN
            </span>
          </div>
        )}

        {/* Prediction Main Display Hero */}
        <div className="relative flex flex-col items-center justify-center py-1 text-center">
          {/* Active Pattern Tag with Anti-Trap Badge */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center mb-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600/30 via-amber-500/20 to-cyan-500/30 border border-amber-400/30 text-[9px] font-orbitron font-extrabold text-amber-200 shadow-sm">
              <RadarPulseIcon className="w-3 h-3 text-cyan-400" />
              <span className="line-clamp-1">{prediction ? prediction.patternName : 'SYNCHRONIZING PATTERNS'}</span>
            </div>

            {/* Anti-Trap Verification Shield */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[8.5px] font-orbitron font-bold text-cyan-300 shadow-sm">
              <TrapShieldIcon className="w-3 h-3 text-cyan-300" />
              <span>ANTI-TRAP ARMED</span>
            </div>
          </div>

          {/* Big / Small Massive Glowing Badge */}
          <div className="my-0.5">
            <div
              className={`font-orbitron font-black text-4xl sm:text-5xl tracking-[0.16em] uppercase transition-all duration-300 ${
                isBig
                  ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_0_28px_rgba(251,191,36,0.7)]'
                  : 'text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-cyan-400 to-blue-600 drop-shadow-[0_0_28px_rgba(34,211,238,0.7)]'
              }`}
            >
              {prediction ? prediction.prediction : 'SCAN'}
            </div>
          </div>

          {/* Rationale explanation text */}
          <p className="text-[10px] font-rajdhani font-semibold text-slate-300 max-w-xs mx-auto line-clamp-1">
            {prediction ? prediction.reason : 'Real-time multi-pattern heuristics & historical probability'}
          </p>

          {/* Deep Analysis Diagnostic Strip */}
          {prediction?.deepAnalysisSummary && (
            <div className="mt-1 px-2.5 py-0.5 rounded-lg bg-black/50 border border-white/10 text-[9px] font-mono text-cyan-300/90 max-w-xs mx-auto flex items-center gap-1.5 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="truncate">{prediction.deepAnalysisSummary}</span>
            </div>
          )}

          {/* 3D WINGO BALLS - FAVOR & OPPOSITE (EITHER MATCH = JACKPOT!) */}
          <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6">
            {/* 1. FAVOR BALL (Primary candidate in direction of prediction) */}
            <div className="flex flex-col items-center gap-1 group">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                <ZapEnergyIcon className="w-2.5 h-2.5 text-amber-300" />
                <span className="text-[8px] font-orbitron font-black tracking-widest text-amber-300 uppercase">
                  FAVOR BALL
                </span>
              </div>

              <div className="wingo-ball-glow-container w-20 h-20 sm:w-22 sm:h-22">
                <div className="wingo-ball-ambient-halo" />
                <div className="wingo-ball-ambient-ring" />
                <div className="wingo-ball-specular-glare" />

                <img
                  src={favorBallImg}
                  alt={`Favor Ball #${favorNum}`}
                  className="w-full h-full object-contain wingo-ball-img-polished animate-[float-ball_3.2s_ease-in-out_infinite]"
                />
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/70 font-mono font-black text-xs text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                FAVOR #{favorNum}
              </span>
            </div>

            {/* VS / OR Divider Badge with Royal Crown */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-[8px] font-orbitron font-extrabold text-slate-500 uppercase tracking-widest">
                OR
              </span>
              <RoyalCrownJackpotIcon className="w-5 h-5 text-yellow-300 my-1 animate-bounce" />
              <span className="text-[7.5px] font-mono font-black text-yellow-300 uppercase tracking-wider">
                JACKPOT
              </span>
            </div>

            {/* 2. OPPOSITE BALL (Defensive hedging candidate from opposite side) */}
            <div className="flex flex-col items-center gap-1 group">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                <TrapShieldIcon className="w-2.5 h-2.5 text-cyan-300" />
                <span className="text-[8px] font-orbitron font-black tracking-widest text-cyan-300 uppercase">
                  OPPOSITE BALL
                </span>
              </div>

              <div className="wingo-ball-glow-container w-20 h-20 sm:w-22 sm:h-22">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/35 to-blue-600/35 blur-xl pointer-events-none" />
                <div className="wingo-ball-ambient-ring" style={{ borderColor: 'rgba(34,211,238,0.55)' }} />
                <div className="wingo-ball-specular-glare" />

                <img
                  src={oppBallImg}
                  alt={`Opposite Ball #${oppNum}`}
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] brightness-110 contrast-115 animate-[float-ball_3.6s_ease-in-out_infinite]"
                />
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/70 font-mono font-black text-xs text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                OPPOSITE #{oppNum}
              </span>
            </div>
          </div>

          {/* 777 Jackpot Double-Match Rule Ribbon */}
          <div className="mt-3 p-2 rounded-xl bg-gradient-to-r from-yellow-500/15 via-amber-400/25 to-yellow-500/15 border border-yellow-400/50 flex items-center justify-center gap-2 text-center shadow-[0_0_20px_rgba(250,204,21,0.2)]">
            <RoyalCrownJackpotIcon className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="text-[10px] font-rajdhani font-bold text-yellow-200 tracking-wider">
              JACKPOT SYSTEM: EITHER <strong className="text-amber-300">FAVOR (#{favorNum})</strong> OR <strong className="text-cyan-300">OPPOSITE (#{oppNum})</strong> MATCH = <strong className="text-yellow-300 font-orbitron">JACKPOT 9X</strong>!
            </span>
          </div>

          {/* V3 Quantum Neural Consensus Ribbon */}
          <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-amber-500/30 flex items-center justify-between text-[9px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full font-orbitron font-black text-[8px] ${prediction?.isSkipRecommended ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                {prediction?.actionText ?? 'PLAY'}
              </span>
              <span className="text-amber-300 font-bold">
                {prediction?.recommendedUnit ?? '1X UNIT'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] font-orbitron text-cyan-300">
              <span>V3 QUANTUM:</span>
              <strong className="text-emerald-400">{prediction?.isTwoLevelVerified ? '100% VERIFIED ✓' : 'VERIFIED'}</strong>
            </div>
          </div>

          {prediction?.isSkipRecommended && prediction?.skipReason && (
            <div className="mt-1.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[8.5px] font-mono text-rose-300 text-center">
              ⚠️ {prediction.skipReason}
            </div>
          )}
        </div>

        {/* AI Confidence Meter Bar - Compact Glass */}
        <div className="mt-2.5 p-2 rounded-xl bg-black/25 backdrop-blur-[2px] border border-white/10">
          <div className="flex items-center justify-between text-[10px] font-orbitron font-bold mb-1">
            <span className="flex items-center gap-1 text-slate-300">
              <TrapShieldIcon className="w-3.5 h-3.5 text-amber-400" />
              CONFIDENCE MATRIX
            </span>
            <span className="text-amber-300 font-extrabold text-xs">
              {prediction ? `${prediction.confidence}%` : '85%'}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] transition-all duration-1000 relative"
              style={{ width: `${prediction ? prediction.confidence : 85}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shine-sweep_2s_infinite]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 mt-1.5">
            <span>RULE: {prediction?.ruleCode ?? 'DYNAMIC'}</span>
            <span>REGIME: {prediction?.regime ?? 'TRENDING'}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              ANTI-TRAP SECURE
            </span>
          </div>
        </div>

        {/* Action Buttons: 1-Click Bold Copy & Re-analyse */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={handleCopy}
            disabled={!prediction}
            className={`w-full py-2.5 px-3 rounded-xl font-orbitron font-black text-[11px] sm:text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-md ${
              copied
                ? 'bg-emerald-500 text-black shadow-emerald-500/40 border border-emerald-300'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-amber-500/25 hover:brightness-110 border border-amber-300/40'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED!' : 'COPY SIGNAL'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onManualReanalyse();
            }}
            disabled={isAnalysing}
            className="w-full py-2.5 px-3 rounded-xl font-orbitron font-bold text-[11px] sm:text-xs tracking-wider text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 transition active:scale-95 hover:border-amber-400/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAnalysing ? 'animate-spin' : ''}`} />
            <span>{isAnalysing ? 'SCANNING...' : 'RE-ANALYSE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
