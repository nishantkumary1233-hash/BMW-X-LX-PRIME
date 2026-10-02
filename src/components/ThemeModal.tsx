import React from 'react';
import { ThemeName } from '../types';
import { X, Check } from 'lucide-react';
import { PalettePrismIcon } from './CustomIcons';
import { sounds } from '../utils/soundEffects';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const themes: { id: ThemeName; name: string; color: string; desc: string }[] = [
    { id: 'gold', name: 'ROYAL GOLD', color: 'from-amber-400 to-amber-600', desc: 'Prestige luxury carbon gold' },
    { id: 'emerald', name: 'CYBER EMERALD', color: 'from-emerald-400 to-emerald-600', desc: 'Matrix green jade neon' },
    { id: 'crimson', name: 'CRIMSON BOSS', color: 'from-rose-500 to-rose-700', desc: 'Hyper red aggressive VIP' },
    { id: 'ocean', name: 'OCEAN DIAMOND', color: 'from-cyan-400 to-blue-600', desc: 'Deep electric cyan sapphire' },
    { id: 'violet', name: 'VIOLET CROWN', color: 'from-purple-400 to-fuchsia-600', desc: 'Royal high-voltage violet' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-sm rounded-3xl bg-[#0c1126] border border-amber-500/30 p-5 shadow-2xl shadow-black relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="font-orbitron font-extrabold text-sm text-amber-300 tracking-wider flex items-center gap-2">
            <PalettePrismIcon className="w-4 h-4 text-cyan-400" />
            VIP PALETTE THEMES
          </h3>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {themes.map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-white/10 border-amber-400 shadow-md ring-1 ring-amber-400'
                    : 'bg-black/30 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.color} shadow-md shrink-0`} />
                  <div className="flex flex-col text-left">
                    <span className="font-orbitron font-bold text-xs text-white">{t.name}</span>
                    <span className="text-[10px] text-slate-400">{t.desc}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
