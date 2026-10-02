import React from 'react';
import { ThemeName } from '../types';
import { sounds } from '../utils/soundEffects';
import { BmwBossCrown, PalettePrismIcon, ZapEnergyIcon } from './CustomIcons';
import { Volume2, VolumeX, Download } from 'lucide-react';

interface NavbarProps {
  isLive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenThemeModal: () => void;
  currentTheme: ThemeName;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLive,
  soundEnabled,
  onToggleSound,
  onOpenThemeModal,
}) => {
  const handleDownloadHtml = () => {
    sounds.playJackpot();
    const link = document.createElement('a');
    link.href = '/bmw-x-predictor.html';
    link.download = 'bmw-x-predictor.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#04060d]/90 backdrop-blur-xl border-b border-amber-500/20 px-3 py-2 shadow-2xl shadow-black/80">
      <div className="max-w-[430px] mx-auto flex items-center justify-between gap-1.5">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-violet-700 p-0.5 shadow-md shadow-amber-500/25 flex items-center justify-center relative overflow-hidden">
              <div className="w-full h-full bg-[#080d22] rounded-[10px] flex items-center justify-center">
                <BmwBossCrown className="w-6 h-6" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine-sweep_3.5s_infinite]" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-orbitron font-black text-[11px] sm:text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm whitespace-nowrap">
                ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-400">220+ HEURISTICS LOADED</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold">WINGO 1M</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Download Predictor HTML */}
          <button
            onClick={handleDownloadHtml}
            title="Download Standalone HTML Predictor"
            className="p-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-transparent border border-amber-400/30 text-amber-300 hover:text-white transition active:scale-95 flex items-center gap-1 text-[9px] font-orbitron font-bold"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">HTML</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenThemeModal();
            }}
            title="Switch Theme"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 transition active:scale-95"
          >
            <PalettePrismIcon className="w-4 h-4 text-amber-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 transition active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
