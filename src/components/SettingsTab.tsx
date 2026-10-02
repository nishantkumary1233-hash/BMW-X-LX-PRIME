import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Palette,
  Trash2,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Download,
  FileCode,
  Sparkles,
  KeyRound,
  LogOut,
  Image as ImageIcon,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { checkDeviceAuthorizationStatus, logoutDeviceSession, getDeviceFingerprint } from '../utils/licenseSecurity';

interface SettingsTabProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenThemeModal: () => void;
  onClearAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenThemeModal,
  onClearAllData,
}) => {
  const [clearedNotice, setClearedNotice] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const deviceId = getDeviceFingerprint();
  const authStatus = checkDeviceAuthorizationStatus(deviceId);

  const handleDownloadHtml = () => {
    sounds.playJackpot();
    const link = document.createElement('a');
    link.href = '/bmw-x-predictor.html';
    link.download = 'bmw-x-predictor.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('Predictor HTML downloaded successfully!');
    setTimeout(() => setDownloadSuccess(''), 3500);
  };

  const handleDownloadAdminHtml = () => {
    sounds.playJackpot();
    const link = document.createElement('a');
    link.href = '/bmw-admin-panel.html';
    link.download = 'bmw-admin-panel.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('Admin Panel HTML downloaded successfully!');
    setTimeout(() => setDownloadSuccess(''), 3500);
  };

  const handleDownloadHdBanner = () => {
    sounds.playJackpot();
    const link = document.createElement('a');
    link.href = '/bmw-admin-banner.jpg';
    link.download = 'bmw-admin-banner.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess('HD Admin Banner downloaded!');
    setTimeout(() => setDownloadSuccess(''), 3500);
  };

  const handleLockEngineLogout = () => {
    sounds.playLoss();
    logoutDeviceSession();
    window.location.reload();
  };

  const handleWipeData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      sounds.playClick();
      setTimeout(() => setConfirmClear(false), 3500);
    } else {
      sounds.playClick();
      onClearAllData();
      setConfirmClear(false);
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2500);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toast Alert */}
      {clearedNotice && (
        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-orbitron font-bold text-center text-xs flex items-center justify-center gap-1.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ALL HISTORY & CACHE CLEARED ✓</span>
        </div>
      )}

      {/* Preferences Section - Compact */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 shadow">
        <span className="block text-[10px] font-orbitron font-black text-amber-300 tracking-wider uppercase">
          SYSTEM PREFERENCES
        </span>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
          <div className="flex items-center gap-2.5">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <div className="flex flex-col">
              <span className="font-orbitron font-bold text-xs text-white">SOUND EFFECTS</span>
              <span className="text-[9px] text-slate-400">Wins, jackpots & alert chimes</span>
            </div>
          </div>
          <button
            onClick={() => {
              onToggleSound();
              sounds.playClick();
            }}
            className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? 'bg-amber-400' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Theme Palette Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenThemeModal();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-amber-400/30 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="font-orbitron font-bold text-xs text-white">VIP COLOR THEMES</span>
              <span className="text-[9px] text-slate-400">5 luxury palettes</span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-400">CHANGE →</span>
        </button>
      </div>

      {/* Standalone HTML Export Suite (GitHub & Offline Ready) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-violet-900/20 border border-amber-400/40 space-y-2.5 shadow-lg shadow-amber-500/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-orbitron font-black text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            STANDALONE SUITE (GITHUB & OFFLINE)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[8px] font-mono font-bold">
            100% SELF-CONTAINED
          </span>
        </div>

        <p className="text-[10px] font-rajdhani text-slate-300 leading-snug">
          Zero build steps, zero npm dependencies! Ready to run offline or push directly to GitHub Pages.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          <button
            onClick={handleDownloadHtml}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-orbitron font-black text-[10px] uppercase flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>PREDICTOR HTML</span>
          </button>

          <button
            onClick={handleDownloadAdminHtml}
            className="p-2.5 rounded-xl bg-black/60 border border-amber-400/40 hover:bg-amber-400/10 text-amber-300 font-orbitron font-black text-[10px] uppercase flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>ADMIN HTML</span>
          </button>

          <button
            onClick={handleDownloadHdBanner}
            className="p-2.5 rounded-xl bg-black/60 border border-violet-400/40 hover:bg-violet-400/10 text-violet-300 font-orbitron font-black text-[10px] uppercase flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
            <span>HD BANNER</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-300 bg-emerald-500/15 p-1.5 rounded-lg border border-emerald-400/30 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Active License Session & Device Lock */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-orbitron font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ACTIVE VIP DEVICE SESSION
          </span>
          <span className="text-[8px] font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
            {deviceId}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1 text-[9.5px] font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">HARDWARE DEVICE ID:</span>
            <span className="font-bold text-amber-300 font-orbitron">{deviceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">REGISTERED EMAIL:</span>
            <span className="text-white font-bold">{authStatus.record?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">VALIDITY STATUS:</span>
            <span className={`font-bold ${authStatus.authorized ? 'text-emerald-400' : 'text-rose-400'}`}>
              {authStatus.authorized ? `${authStatus.record?.durationLabel || 'ACTIVE'}` : 'UNAUTHORIZED'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLockEngineLogout}
          className="w-full py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-orbitron font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>LOCK ENGINE / LOGOUT DEVICE</span>
        </button>
      </div>

      {/* Engine Architecture & Specs - WinGo 1M Only */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 shadow">
        <span className="block text-[10px] font-orbitron font-black text-cyan-300 tracking-wider uppercase flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          ARCHITECTURE SPECIFICATIONS
        </span>

        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[8px] text-slate-500 block">HEURISTICS LOADED</span>
            <span className="font-bold text-white text-[11px]">235 HEURISTICS</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[8px] text-slate-500 block">SPECIAL SUITE</span>
            <span className="font-bold text-amber-300 text-[11px]">B-SS-B + 10-MACRO</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[8px] text-slate-500 block">GAME CYCLE</span>
            <span className="font-bold text-amber-300 text-[11px]">WINGO 1M ONLY</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[8px] text-slate-500 block">JACKPOT LOGIC</span>
            <span className="font-bold text-emerald-400 text-[11px]">DUAL BALL 9X WIN</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-[10px] font-rajdhani text-emerald-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Anti-Repeat Guard & UTC Synchronized Seed: 100% identical outputs across all devices worldwide.</span>
        </div>
      </div>

      {/* Working Clear Full History & Cache */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-rose-500/20 space-y-1.5">
        <span className="block text-[10px] font-orbitron font-black text-rose-400 tracking-wider uppercase">
          DATA MANAGEMENT
        </span>
        <button
          onClick={handleWipeData}
          className={`w-full py-2.5 rounded-xl font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition ${
            confirmClear
              ? 'bg-rose-600 text-white animate-pulse border border-rose-400 shadow-md shadow-rose-600/40'
              : 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{confirmClear ? 'CONFIRM WIPE ALL HISTORY?' : 'CLEAR FULL HISTORY & LOCAL CACHE'}</span>
        </button>
      </div>

      <div className="text-center py-1 text-[9px] font-mono text-slate-500">
        ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎ · WINGO 1M NEURAL ENGINE
      </div>
    </div>
  );
};
