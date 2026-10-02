import React, { useRef } from 'react';
import { ThemeName } from '../types';
import { sounds } from '../utils/soundEffects';
import { BmwBossCrown, PalettePrismIcon, ZapEnergyIcon } from './CustomIcons';
import { Volume2, VolumeX, Download, Lock } from 'lucide-react';

interface NavbarProps {
  isLive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenThemeModal: () => void;
  onOpenAdminPanel: () => void;
  currentTheme: ThemeName;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLive,
  soundEnabled,
  onToggleSound,
  onOpenThemeModal,
  onOpenAdminPanel,
}) => {
  const lastLockClickRef = useRef<number>(0);

  const handleLockTrigger = () => {
    const now = Date.now();
    if (now - lastLockClickRef.current < 450) {
      sounds.playJackpot();
      onOpenAdminPanel();
    }
    lastLockClickRef.current = now;
  };

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
              {/* Secret Lock Icon for Master Admin: Double-click to open */}
              <button
                type="button"
                onDoubleClick={() => {
                  sounds.playJackpot();
                  onOpenAdminPanel();
                }}
                onClick={handleLockTrigger}
                title="Double-click to open Master Admin Control Panel"
                className="w-4 h-4 rounded bg-amber-500/15 hover:bg-amber-400/30 border border-amber-400/40 flex items-center justify-center text-amber-300 transition active:scale-75 shrink-0 cursor-pointer"
              >
                <Lock className="w-2.5 h-2.5 text-amber-400" />
              </button>
              <span className="font-orbitron font-black text-[11px] sm:text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-sm whitespace-nowrap">
                ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-mono tracking-wider text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 shadow-[0_0_8px_#10e07f] animate-ping' : 'bg-amber-400'}`} />
                <span className={isLive ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {isLive ? 'LIVE' : 'SIM'}
                </span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold">WINGO 1M</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-rajdhani font-semibold">NEURAL CORE</span>
            </div>
          </div>
        </div>

        {/* Dedicated WINGO 1M Badge & Actions */}
        <div className="flex items-center gap-1.5">
          {/* WinGo 1M Exclusive Mode Badge */}
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-600/20 px-2 py-1 rounded-xl border border-amber-400/40 shadow-sm shadow-amber-500/15">
            <ZapEnergyIcon className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-[10px] font-orbitron font-black text-amber-300 tracking-wider">
              WINGO 1M
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sounds.playClick();
            }}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-amber-400/40 transition active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Standalone HTML Download Button */}
          <button
            onClick={handleDownloadHtml}
            title="Download Standalone HTML (GitHub & Offline Ready)"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300 hover:bg-amber-400 hover:text-black transition active:scale-95 shadow-sm shadow-amber-500/15"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Theme Selector with Custom Prism Icon */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenThemeModal();
            }}
            title="VIP Theme Palette"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 transition active:scale-95"
          >
            <PalettePrismIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
