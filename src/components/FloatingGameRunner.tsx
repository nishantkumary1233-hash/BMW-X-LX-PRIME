import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { Globe, X, Minus, Maximize2, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface FloatingGameRunnerProps {
  prediction: PredictionResult | null;
  secondsRemaining: number;
}

export const FloatingGameRunner: React.FC<FloatingGameRunnerProps> = ({
  prediction,
  secondsRemaining,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [gameUrl, setGameUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameUrl.trim()) return;
    let url = gameUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setActiveUrl(url);
    setIsRunning(true);
    setIsOpenModal(false);
    sounds.playClick();
  };

  const handleCloseRunning = () => {
    setIsRunning(false);
    setActiveUrl('');
    sounds.playClick();
  };

  return (
    <>
      {/* Launch Game Web Runner Trigger Button */}
      <button
        onClick={() => {
          sounds.playClick();
          setIsOpenModal(true);
        }}
        className="fixed right-4 bottom-24 z-30 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black flex items-center justify-center shadow-2xl shadow-amber-500/40 border border-white/20 active:scale-95 transition-all group"
        title="Launch Game Website Runner"
      >
        <Globe className="w-6 h-6 group-hover:rotate-45 transition-transform" />
      </button>

      {/* URL Input Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0c1126] border border-amber-500/30 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-orbitron font-extrabold text-sm text-amber-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                RUN GAME WEBSITE
              </h3>
              <button
                onClick={() => setIsOpenModal(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunch} className="space-y-3">
              <p className="text-xs font-rajdhani text-slate-300">
                Paste your game platform URL to run with live VIP prediction overlay.
              </p>
              <input
                type="text"
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                placeholder="https://yourgameplatform.com"
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-xs font-mono text-white outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-orbitron font-black text-xs shadow-md"
                >
                  LAUNCH PLATFORM
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-orbitron font-bold text-slate-400"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Iframe Web Container when running */}
      {isRunning && (
        <div className="fixed inset-0 z-40 bg-black flex flex-col">
          {/* Top minimal bar to exit */}
          <div className="h-10 bg-[#04060d] border-b border-white/10 px-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-amber-400">
              <span>BMW X BOSS LX VIP OVERLAY</span>
            </div>
            <button
              onClick={handleCloseRunning}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-orbitron font-bold border border-rose-500/30"
            >
              <X className="w-3.5 h-3.5" />
              EXIT PLATFORM
            </button>
          </div>

          {/* Iframe */}
          <iframe
            src={activeUrl}
            title="Game Platform"
            className="w-full flex-1 border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />

          {/* Draggable / Fixed Floating Mini HUD Widget */}
          <div className="fixed top-14 left-4 z-50 w-52 rounded-2xl bg-[#080d22]/95 backdrop-blur-xl border border-amber-400/40 shadow-2xl p-3 text-white overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-orbitron font-black text-[10px] text-amber-300">BMW X BOSS LX</span>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-slate-400 hover:text-white"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
            </div>

            {!isMinimized && (
              <div className="mt-2 space-y-1.5 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">PERIOD:</span>
                  <span className="font-bold text-cyan-300">#{prediction ? prediction.period.slice(-5) : '·····'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TIMER:</span>
                  <span className="font-bold text-amber-400">{formatSeconds(secondsRemaining)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">PREDICT:</span>
                  <span
                    className={`font-orbitron font-black text-xs ${
                      prediction?.prediction === 'BIG' ? 'text-amber-300' : 'text-cyan-300'
                    }`}
                  >
                    {prediction ? prediction.prediction : 'SCAN'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BALLS:</span>
                  <span className="font-bold text-emerald-400">
                    {prediction ? `${prediction.targetNumber} / ${prediction.secondaryNumber}` : '? / ?'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
