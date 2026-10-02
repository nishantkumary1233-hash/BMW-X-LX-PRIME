import React, { useState } from 'react';
import { HistoryRecord } from '../types';
import { BALL_IMAGES } from '../constants/ballImages';
import {
  TrophyVipIcon,
  FlameStreakIcon,
  TargetCrosshairIcon,
  Win3DBadge,
  Loss3DBadge,
  Jackpot3DBadge,
  LossLaserCrossIcon,
  RoyalCrownJackpotIcon,
  WinValkyrieIcon,
} from './CustomIcons';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HistoryTabProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ history, onClearHistory }) => {
  const [filter, setFilter] = useState<'ALL' | 'WINS' | 'LOSSES' | 'JACKPOT'>('ALL');
  const [isConfirming, setIsConfirming] = useState(false);
  const [clearedToast, setClearedToast] = useState(false);

  const total = history.length;
  const wins = history.filter((h) => h.isWin).length;
  const losses = history.filter((h) => !h.isWin).length;
  const jackpots = history.filter((h) => h.isJackpot).length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const handleClearClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      sounds.playClick();
      setTimeout(() => setIsConfirming(false), 3000);
    } else {
      sounds.playClick();
      onClearHistory();
      setIsConfirming(false);
      setClearedToast(true);
      setTimeout(() => setClearedToast(false), 2200);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'WINS') return item.isWin;
    if (filter === 'LOSSES') return !item.isWin;
    if (filter === 'JACKPOT') return item.isJackpot;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Toast Alert when history is cleared */}
      {clearedToast && (
        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-orbitron font-bold text-center text-xs flex items-center justify-center gap-1.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>HISTORY CLEARED SUCCESSFULLY ✓</span>
        </div>
      )}

      {/* Header Stat Strip - 5 Tactical Telemetry Cards */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
        <div className="p-1.5 rounded-xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center shadow">
          <span className="text-[7.5px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">
            TOTAL
          </span>
          <span className="font-orbitron font-black text-sm sm:text-base text-white mt-0.5">{total}</span>
        </div>

        <div className="p-1.5 rounded-xl bg-[#031c11]/80 border border-emerald-500/40 flex flex-col items-center justify-center text-center shadow">
          <span className="text-[7.5px] font-orbitron font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
            <WinValkyrieIcon className="w-2.5 h-2.5" />
            WIN
          </span>
          <span className="font-orbitron font-black text-sm sm:text-base text-emerald-300 mt-0.5">{wins}</span>
        </div>

        <div className="p-1.5 rounded-xl bg-[#20050c]/80 border border-rose-500/40 flex flex-col items-center justify-center text-center shadow">
          <span className="text-[7.5px] font-orbitron font-bold text-rose-400 uppercase tracking-wider flex items-center gap-0.5">
            <LossLaserCrossIcon className="w-2.5 h-2.5" />
            LOSS
          </span>
          <span className="font-orbitron font-black text-sm sm:text-base text-rose-300 mt-0.5">{losses}</span>
        </div>

        <div className="p-1.5 rounded-xl bg-black/60 border border-amber-500/30 flex flex-col items-center justify-center text-center shadow">
          <span className="text-[7.5px] font-orbitron font-bold text-amber-300 uppercase tracking-wider flex items-center gap-0.5">
            <FlameStreakIcon className="w-2.5 h-2.5 text-amber-400" />
            ACC%
          </span>
          <span className="font-orbitron font-black text-sm sm:text-base text-amber-300 mt-0.5">{winRate}%</span>
        </div>

        <div className="p-1.5 rounded-xl bg-[#2b1800]/80 border border-yellow-400/40 flex flex-col items-center justify-center text-center shadow">
          <span className="text-[7.5px] font-orbitron font-bold text-yellow-300 uppercase tracking-wider flex items-center gap-0.5">
            <RoyalCrownJackpotIcon className="w-2.5 h-2.5" />
            JACK
          </span>
          <span className="font-orbitron font-black text-sm sm:text-base text-yellow-300 mt-0.5">{jackpots}</span>
        </div>
      </div>

      {/* Filter Tabs & Working Clear Action */}
      <div className="flex items-center justify-between gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              sounds.playClick();
              setFilter('ALL');
            }}
            className={`px-2 py-1 rounded-lg text-[9px] font-orbitron font-bold tracking-wider transition ${
              filter === 'ALL'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('WINS');
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-orbitron font-bold tracking-wider transition ${
              filter === 'WINS'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <WinValkyrieIcon className="w-2.5 h-2.5" />
            <span>WINS</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('LOSSES');
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-orbitron font-bold tracking-wider transition ${
              filter === 'LOSSES'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <LossLaserCrossIcon className="w-2.5 h-2.5" />
            <span>LOSS</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setFilter('JACKPOT');
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-orbitron font-bold tracking-wider transition ${
              filter === 'JACKPOT'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-yellow-300/80 hover:text-yellow-200'
            }`}
          >
            <RoyalCrownJackpotIcon className="w-2.5 h-2.5" />
            <span>JACKPOT</span>
          </button>
        </div>

        {/* 100% Reliable Clear History Button */}
        <button
          onClick={handleClearClick}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-orbitron font-black text-[9px] transition active:scale-95 ${
            isConfirming
              ? 'bg-rose-600 text-white animate-pulse border border-rose-400 shadow-md shadow-rose-600/40'
              : 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300'
          }`}
        >
          <Trash2 className="w-3 h-3" />
          <span>{isConfirming ? 'CONFIRM CLEAR?' : 'CLEAR'}</span>
        </button>
      </div>

      {/* History Items List - Compact cards with glowing polished balls */}
      <div className="space-y-2">
        {filteredHistory.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-slate-400 text-[10px] font-mono">
            NO RECORDED PREDICTIONS YET. RUN SIGNALS TO LOG HISTORY.
          </div>
        ) : (
          filteredHistory.map((item) => {
            const ballImg = BALL_IMAGES[item.actualNumber] || BALL_IMAGES[0];
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 flex items-center justify-between gap-2 hover:border-amber-400/30 transition shadow-sm"
              >
                {/* Left Side: Period, Pattern, Predictions */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-cyan-300">
                      #{item.period.slice(-5)}
                    </span>
                    <span className="text-[8px] font-orbitron font-bold text-slate-400 uppercase bg-white/5 px-1.5 py-0.2 rounded">
                      WINGO 1M
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-rajdhani font-semibold text-slate-300 flex-wrap">
                    <span>
                      PRED: <strong className="text-amber-300 font-orbitron">{item.prediction}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300/90 text-[10px]">
                      FAVOR: <strong>#{item.favorNumber ?? item.targetNumber}</strong>
                    </span>
                    <span className="text-cyan-300/90 text-[10px]">
                      OPP: <strong>#{item.oppositeNumber ?? item.secondaryNumber}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>
                      ACTUAL: <strong className="text-white font-orbitron">{item.actualSize}</strong> (#{item.actualNumber})
                    </span>
                  </div>

                  {item.isJackpot ? (
                    <div className="text-[9px] font-mono font-black text-yellow-300 flex items-center gap-1">
                      <RoyalCrownJackpotIcon className="w-3 h-3 text-yellow-300" />
                      <span>
                        JACKPOT HIT! {item.jackpotMatchedType === 'OPPOSITE' ? 'OPPOSITE BALL' : 'FAVOR BALL'} #{item.actualNumber} MATCHED
                      </span>
                    </div>
                  ) : (
                    <div className="text-[9px] font-mono text-slate-400 line-clamp-1">
                      {item.pattern}
                    </div>
                  )}
                </div>

                {/* Right Side: Polished 3D Ball & Win/Loss Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* 3D Result Ball Image with Polish Glare */}
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
                    <img
                      src={ballImg}
                      alt={`Ball ${item.actualNumber}`}
                      className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.45)] brightness-110 contrast-110"
                    />
                  </div>

                  {/* Status 3D Luxury Badge */}
                  {item.isJackpot ? (
                    <Jackpot3DBadge />
                  ) : item.isWin ? (
                    <Win3DBadge />
                  ) : (
                    <Loss3DBadge />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
