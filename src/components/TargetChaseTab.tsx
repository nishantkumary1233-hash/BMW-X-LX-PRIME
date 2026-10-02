import React, { useState } from 'react';
import { TargetChaseState, PredictionResult } from '../types';
import { formatChaseForCopy } from '../utils/unicodeFont';
import { sounds } from '../utils/soundEffects';
import { RoyalCrownJackpotIcon } from './CustomIcons';
import { computeTargetLevels } from '../utils/targetChaseEngine';
import { DollarSign, Copy, Check, RotateCcw, Play, Sparkles, TrendingUp, Layers, Zap } from 'lucide-react';

interface TargetChaseTabProps {
  chaseState: TargetChaseState;
  currentPrediction: PredictionResult | null;
  onStartChase: (wallet: number, target: number, levelCount?: 3 | 4) => void;
  onResetChase: () => void;
}

export const TargetChaseTab: React.FC<TargetChaseTabProps> = ({
  chaseState,
  currentPrediction,
  onStartChase,
  onResetChase,
}) => {
  const [walletInput, setWalletInput] = useState<string>(
    chaseState.wallet > 0 ? String(Math.round(chaseState.wallet)) : '1000'
  );
  const [targetInput, setTargetInput] = useState<string>(
    chaseState.targetProfit > 0 ? String(Math.round(chaseState.targetProfit)) : '200'
  );
  const [levelChoice, setLevelChoice] = useState<3 | 4>(
    chaseState.totalLevelCount || 4
  );
  const [copied, setCopied] = useState(false);
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  // Live budget allocation preview for setup
  const previewWallet = Math.max(10, parseFloat(walletInput) || 1000);
  const previewLevels = computeTargetLevels(previewWallet, levelChoice);
  const previewSum = previewLevels.reduce((a, b) => a + b, 0);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(walletInput);
    const t = parseFloat(targetInput);
    if (!w || w <= 0 || !t || t <= 0) return;
    sounds.playClick();
    onStartChase(w, t, levelChoice);
  };

  const handleResetClick = () => {
    if (!isResetConfirming) {
      setIsResetConfirming(true);
      sounds.playClick();
      setTimeout(() => setIsResetConfirming(false), 3000);
    } else {
      sounds.playClick();
      setIsResetConfirming(false);
      onResetChase();
    }
  };

  const handleSetNewTargetAfterCompletion = () => {
    sounds.playClick();
    setWalletInput(String(Math.round(chaseState.wallet)));
    setTargetInput('200');
    onResetChase();
  };

  const handleCopyChase = () => {
    if (!currentPrediction || !chaseState.active) return;
    sounds.playClick();
    const currentBet = chaseState.levels[chaseState.currentLevel - 1] || chaseState.levels[0] || 10;
    const formatted = formatChaseForCopy({
      period: currentPrediction.period,
      prediction: currentPrediction.prediction,
      betAmount: currentBet,
      currentLevel: chaseState.currentLevel,
      totalLevels: chaseState.levels.length,
      walletBalance: Math.round(chaseState.wallet),
      targetProfit: Math.round(chaseState.targetProfit),
      currentProfit: Math.round(chaseState.currentProfit),
    });

    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const progressPct = chaseState.targetProfit > 0
    ? Math.min(100, Math.max(0, Math.round((chaseState.currentProfit / chaseState.targetProfit) * 100)))
    : 0;

  return (
    <div className="space-y-3">
      {/* 1. Target Achieved Victory Box with Instant "SET NEW TARGET" option */}
      {chaseState.completed && (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1c1400]/95 via-[#2b1f00]/90 to-[#120d00]/95 border-2 border-yellow-400/90 shadow-[0_0_30px_rgba(250,204,21,0.4)] text-center space-y-3 animate-[pop-bounce_0.5s_ease-out]">
          <div className="flex items-center justify-center gap-2">
            <RoyalCrownJackpotIcon className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span className="font-orbitron font-black text-sm tracking-wider text-yellow-200 uppercase">
              🏆 TARGET GOAL ACHIEVED!
            </span>
            <RoyalCrownJackpotIcon className="w-5 h-5 text-yellow-300 animate-bounce -scale-x-100" />
          </div>

          <div className="py-1">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block font-bold">
              PROFIT SECURED
            </span>
            <span className="font-orbitron font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_15px_rgba(16,224,127,0.5)]">
              +₹{Math.round(chaseState.currentProfit).toLocaleString('en-IN')}
            </span>
            <div className="text-[10.5px] font-mono text-slate-300 mt-1">
              Current Wallet: <strong className="text-white">₹{Math.round(chaseState.wallet).toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Action Buttons: Set New Target Goal or Reset */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleSetNewTargetAfterCompletion}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-black font-orbitron font-black text-[11px] tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>SET NEW TARGET</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onResetChase();
              }}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 font-orbitron font-bold text-[11px] tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Target Setup Form (shown when chase is not active and not completed) */}
      {!chaseState.active && !chaseState.completed && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-amber-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h3 className="font-orbitron font-extrabold text-xs sm:text-sm text-amber-300">
                TARGET RECOVERY CHASE SETUP
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-400/40">
              3-4 LEVELS
            </span>
          </div>

          <form onSubmit={handleStart} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8.5px] font-mono tracking-wider text-slate-300 mb-0.5 uppercase">
                  WALLET BALANCE (₹)
                </label>
                <input
                  type="number"
                  min="20"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-amber-200 outline-none"
                  placeholder="e.g. 1000"
                />
              </div>

              <div>
                <label className="block text-[8.5px] font-mono tracking-wider text-slate-300 mb-0.5 uppercase">
                  PROFIT TARGET GOAL (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-xl px-2.5 py-1.5 font-mono text-xs font-bold text-emerald-300 outline-none"
                  placeholder="e.g. 200"
                />
              </div>
            </div>

            {/* Level Count Selector (Min 3 Levels, Max 4 Levels) */}
            <div>
              <label className="block text-[8.5px] font-orbitron font-bold tracking-wider text-slate-300 mb-1 uppercase flex items-center justify-between">
                <span>SELECT LEVEL DEPTH (MIN 3 / MAX 4)</span>
                <span className="text-amber-400 font-mono text-[8px]">EXHAUSTS 100% WALLET</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setLevelChoice(3);
                  }}
                  className={`py-2 px-3 rounded-xl font-orbitron font-bold text-[10px] tracking-wider border flex items-center justify-center gap-1.5 transition ${
                    levelChoice === 3
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>3 LEVELS (FAST)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setLevelChoice(4);
                  }}
                  className={`py-2 px-3 rounded-xl font-orbitron font-bold text-[10px] tracking-wider border flex items-center justify-center gap-1.5 transition ${
                    levelChoice === 4
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>4 LEVELS (MAX SAFE)</span>
                </button>
              </div>
            </div>

            {/* Live Level Budget Allocation Preview */}
            <div className="p-2.5 rounded-xl bg-black/45 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[8px] font-mono font-bold">
                <span className="text-slate-400 uppercase">BUDGET ALLOCATION PREVIEW</span>
                <span className="text-amber-300">TOTAL: ₹{previewSum.toLocaleString('en-IN')} (100% OF WALLET)</span>
              </div>

              <div className={`grid gap-1.5 ${levelChoice === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {previewLevels.map((amt, idx) => (
                  <div key={idx} className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-center">
                    <span className="text-[7.5px] font-mono text-slate-400 uppercase block">L{idx + 1}</span>
                    <span className="font-orbitron font-black text-xs text-amber-300">₹{amt.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="text-[9.5px] font-rajdhani text-slate-400 pt-1 leading-snug">
                • <strong className="text-emerald-400">ON PROFIT:</strong> Next bet amounts scale up (badhta jayega) to finish target faster.
                <br />
                • <strong className="text-rose-400">ON LOSS:</strong> Fixed level check se original L2/L3/L4 ladder follow hoga without over-risking.
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-orbitron font-black text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>START {levelChoice}-LEVEL TARGET CHASE</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. Target Active Dashboard (shown when chase is active) */}
      {chaseState.active && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-black/55 backdrop-blur-md border border-amber-500/40 space-y-3 shadow-lg">
          {/* Top Status & Working Reset */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-orbitron font-extrabold text-xs sm:text-sm text-amber-300">
                🔥 TARGET CHASE ACTIVE ({chaseState.levels.length} LEVELS)
              </span>
            </div>

            {/* Reliable Reset Button (No blocking confirm dialogs) */}
            <button
              onClick={handleResetClick}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-wider transition active:scale-95 ${
                isResetConfirming
                  ? 'bg-rose-600 text-white animate-pulse border border-rose-400 shadow-md shadow-rose-600/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/15'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isResetConfirming ? 'CONFIRM RESET?' : 'RESET'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="p-2 rounded-xl bg-black/50 border border-white/10 text-center">
              <span className="text-[8px] font-mono text-slate-400 uppercase">WALLET</span>
              <div className="font-orbitron font-black text-sm text-white mt-0.5">
                ₹{Math.round(chaseState.wallet).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/50 border border-emerald-500/20 text-center">
              <span className="text-[8px] font-mono text-emerald-400 uppercase">PROFIT</span>
              <div className="font-orbitron font-black text-sm text-emerald-400 mt-0.5">
                ₹{Math.round(chaseState.currentProfit).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-black/50 border border-amber-500/20 text-center">
              <span className="text-[8px] font-mono text-amber-300 uppercase">GOAL</span>
              <div className="font-orbitron font-black text-sm text-amber-300 mt-0.5">
                ₹{Math.round(chaseState.targetProfit).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Target Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono font-bold">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                PROGRESS
              </span>
              <span className="text-amber-300">{progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-700 relative"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine-sweep_2s_infinite]" />
              </div>
            </div>
          </div>

          {/* Dynamic Compounding Indicator if Profit is Growing */}
          {chaseState.currentProfit > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-between text-[9px] font-mono text-emerald-300">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>PROFIT ACCELERATION ACTIVE</span>
              </div>
              <span className="font-bold">L1 SCALED TO ₹{chaseState.levels[0]}</span>
            </div>
          )}

          {/* Progressive Betting Ladder (3 or 4 Levels - Entire Wallet Exhaustion) */}
          <div>
            <div className="flex items-center justify-between text-[8.5px] font-orbitron font-bold text-slate-400 tracking-wider mb-1.5 uppercase">
              <span>LEVEL PROGRESSION ({chaseState.levels.length} LEVELS)</span>
              <span className="text-slate-500 font-mono text-[8px]">
                {chaseState.currentLevel === 1 ? 'BASE LEVEL' : `RECOVERY LEVEL ${chaseState.currentLevel}`}
              </span>
            </div>

            <div className={`grid gap-1.5 ${chaseState.levels.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {chaseState.levels.map((amt, idx) => {
                const levelNum = idx + 1;
                const isCurrent = chaseState.currentLevel === levelNum;
                const isLost = chaseState.lostLevels.includes(levelNum);

                return (
                  <div
                    key={levelNum}
                    className={`p-1.5 rounded-xl text-center border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)] ring-1 ring-amber-400'
                        : isLost
                        ? 'bg-rose-500/10 border-rose-500/30 opacity-60'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    <div className="text-[8px] font-mono font-bold uppercase">
                      L{levelNum} {isCurrent && '●'}
                    </div>
                    <div
                      className={`font-orbitron font-black text-xs mt-0.5 ${
                        isCurrent ? 'text-amber-300' : isLost ? 'text-rose-400 line-through' : 'text-white'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1-Click Copy Bet Button */}
          <button
            onClick={handleCopyChase}
            className={`w-full py-2.5 rounded-xl font-orbitron font-bold text-[11px] tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/40'
                : 'bg-white/10 hover:bg-white/15 border border-amber-400/40 text-amber-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>
              {copied
                ? 'CHASE SIGNAL COPIED!'
                : `COPY L${chaseState.currentLevel} BET (₹${chaseState.levels[chaseState.currentLevel - 1] || chaseState.levels[0]})`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
