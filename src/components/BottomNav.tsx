import React from 'react';
import { sounds } from '../utils/soundEffects';
import {
  ZapEnergyIcon,
  TargetCrosshairIcon,
  RadarPulseIcon,
  HistoryLogIcon,
  GearMatrixIcon,
} from './CustomIcons';

export type ActiveTab = 'command' | 'target' | 'radar' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  winCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, winCount = 0 }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'command', label: 'COMMAND', icon: ZapEnergyIcon },
    { id: 'target', label: 'TARGET', icon: TargetCrosshairIcon },
    { id: 'radar', label: 'RADAR', icon: RadarPulseIcon },
    { id: 'history', label: 'HISTORY', icon: HistoryLogIcon },
    { id: 'settings', label: 'SETTINGS', icon: GearMatrixIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-2 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-[430px] bg-[#070b1c]/95 backdrop-blur-2xl border border-amber-500/25 rounded-2xl p-1 shadow-[0_15px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                onTabChange(tab.id);
              }}
              className={`relative flex-1 py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/25 to-amber-500/5 text-amber-300 font-black shadow-inner border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}`} />
              <span className="text-[8px] font-orbitron font-extrabold tracking-wider">
                {tab.label}
              </span>

              {tab.id === 'history' && winCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 py-0.1 rounded-full bg-emerald-500 text-black text-[7.5px] font-mono font-black shadow-[0_0_6px_#10e07f]">
                  {winCount > 99 ? '99+' : winCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
