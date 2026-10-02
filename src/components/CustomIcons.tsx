import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const BmwBossCrown: React.FC<IconProps> = ({ className = 'w-6 h-6', size, glow = true }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="crownGold" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="25%" stopColor="#fbbf24" />
        <stop offset="65%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="crownGem" x1="20" y1="18" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <filter id="crownGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {glow && (
      <path
        d="M6 36L10 16L18 25L24 10L30 25L38 16L42 36H6Z"
        fill="url(#crownGold)"
        opacity="0.35"
        filter="url(#crownGlow)"
      />
    )}
    <path
      d="M6 37L9.5 17L18 25.5L24 10.5L30 25.5L38.5 17L42 37H6Z"
      fill="url(#crownGold)"
      stroke="#ffeeba"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="10" r="3.2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" />
    <circle cx="9.5" cy="16.5" r="2.5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
    <circle cx="38.5" cy="16.5" r="2.5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
    <polygon points="24,19 28,26 24,33 20,26" fill="url(#crownGem)" stroke="#a5f3fc" strokeWidth="1" />
    <rect x="7" y="38" width="34" height="4.5" rx="2" fill="url(#crownGold)" stroke="#ffeeba" strokeWidth="1" />
    <circle cx="16" cy="40.2" r="1.3" fill="#0891b2" />
    <circle cx="24" cy="40.2" r="1.3" fill="#0891b2" />
    <circle cx="32" cy="40.2" r="1.3" fill="#0891b2" />
  </svg>
);

export const DragonAuraIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="dragonGrad" x1="8" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="85%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
      <linearGradient id="eyeCyan" x1="28" y1="18" x2="32" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    {/* Dragon Horns & Crest */}
    <path
      d="M12 28C10 21 14 12 23 8C19 14 20 18 24 16C23 11 28 6 38 4C35 11 32 15 35 18C38 17 41 15 44 11C43 19 39 23 35 25C38 26 42 27 45 28C38 31 34 35 32 42C30 38 27 36 24 38C26 33 24 30 18 31C15 31 13 30 12 28Z"
      fill="url(#dragonGrad)"
      stroke="#fef3c7"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Dragon Jaw */}
    <path
      d="M18 31L13 36C18 39 24 40 28 37L24 34C21 34 19 33 18 31Z"
      fill="#b45309"
      stroke="#f59e0b"
      strokeWidth="1"
    />
    {/* Cyber Eye */}
    <circle cx="29.5" cy="19.5" r="2.2" fill="url(#eyeCyan)" stroke="#cffafe" strokeWidth="0.8" />
    <circle cx="30" cy="19" r="0.8" fill="#fff" />
    {/* Flaming Aura whisker */}
    <path
      d="M11 29C6 31 4 37 7 42C10 39 12 37 14 36"
      stroke="#fbbf24"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const TrapShieldIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="shieldGrad" x1="8" y1="6" x2="40" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#67e8f9" />
        <stop offset="40%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="boltGrad" x1="20" y1="12" x2="28" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path
      d="M24 5L39 11V22C39 32.5 32.5 40.5 24 44C15.5 40.5 9 32.5 9 22V11L24 5Z"
      fill="url(#shieldGrad)"
      stroke="#38bdf8"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M24 9L35 14V22C35 30 30 36.5 24 39.5C18 36.5 13 30 13 22V14L24 9Z"
      fill="#030712"
      opacity="0.6"
    />
    {/* Anti-Trap Core Lightning */}
    <polygon
      points="26,13 18,25 24,25 22,35 31,22 25,22"
      fill="url(#boltGrad)"
      stroke="#fff"
      strokeWidth="0.8"
    />
  </svg>
);

export const RadarPulseIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="sonarGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="19" stroke="url(#sonarGrad)" strokeWidth="1.6" opacity="0.85" />
    <circle cx="24" cy="24" r="13" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.75" />
    <circle cx="24" cy="24" r="7" stroke="#38bdf8" strokeWidth="1.4" />
    <circle cx="24" cy="24" r="2.5" fill="#f59e0b" />
    {/* Sonar sweep beam */}
    <line x1="24" y1="24" x2="38" y2="10" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M24 24L38 10A19 19 0 0 0 24 5Z"
      fill="url(#sonarGrad)"
      opacity="0.3"
    />
    {/* Blip dots */}
    <circle cx="34" cy="18" r="1.8" fill="#4ade80" />
    <circle cx="16" cy="30" r="1.5" fill="#f43f5e" />
  </svg>
);

export const TrophyVipIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="tropGold" x1="12" y1="6" x2="36" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    {/* Cup Body */}
    <path
      d="M14 8H34V22C34 27.5 29.5 32 24 32C18.5 32 14 27.5 14 22V8Z"
      fill="url(#tropGold)"
      stroke="#fef3c7"
      strokeWidth="1.5"
    />
    {/* Handles */}
    <path
      d="M14 12H9C7.5 12 6 13.5 6 15V18C6 22 9.5 24 14 24"
      stroke="#fbbf24"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M34 12H39C40.5 12 42 13.5 42 15V18C42 22 38.5 24 34 24"
      stroke="#fbbf24"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Stem & Base */}
    <path d="M21 32V38H27V32" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />
    <rect x="13" y="38" width="22" height="5" rx="1.5" fill="url(#tropGold)" stroke="#ffeeba" strokeWidth="1" />
    {/* Star Crest */}
    <polygon points="24,14 25.5,18 29.5,18.5 26.5,21.2 27.5,25.2 24,23 20.5,25.2 21.5,21.2 18.5,18.5 22.5,18" fill="#fff" />
  </svg>
);

export const FlameStreakIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="flameExt" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <linearGradient id="flameInt" x1="18" y1="16" x2="30" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="60%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <path
      d="M24 4C24 4 28 12 25 18C28 17 31 15 32 12C36 17 39 24 39 30C39 38 32 44 24 44C16 44 9 38 9 30C9 21 17 14 19 8C20 12 21 14 24 4Z"
      fill="url(#flameExt)"
    />
    <path
      d="M24 20C24 20 27 24 25 28C27 27 29 26 29 24C31 27 32 30 32 33C32 38 28.5 41 24 41C19.5 41 16 38 16 33C16 28 20 25 21 22C22 24 22.5 25 24 20Z"
      fill="url(#flameInt)"
    />
  </svg>
);

export const ZapEnergyIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="zapGrad" x1="14" y1="4" x2="34" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    <polygon
      points="27,4 12,25 23,25 21,44 36,21 25,21"
      fill="url(#zapGrad)"
      stroke="#fef3c7"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const TargetCrosshairIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <circle cx="24" cy="24" r="18" stroke="#f59e0b" strokeWidth="2" opacity="0.85" />
    <circle cx="24" cy="24" r="10" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
    <circle cx="24" cy="24" r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
    <line x1="24" y1="2" x2="24" y2="10" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="24" y1="38" x2="24" y2="46" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="2" y1="24" x2="10" y2="24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="24" x2="46" y2="24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const HistoryLogIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="histGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="18" stroke="url(#histGrad)" strokeWidth="2" />
    <polyline points="24,12 24,24 32,28" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="24" cy="24" r="2.5" fill="#f59e0b" />
    <path d="M7 24A17 17 0 0 1 24 7" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
    <polygon points="5,19 7,25 13,23" fill="#facc15" />
  </svg>
);

export const GearMatrixIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id="gearGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="14" fill="url(#gearGrad)" stroke="#cbd5e1" strokeWidth="1.2" />
    <circle cx="24" cy="24" r="6" fill="#0b1124" stroke="#f59e0b" strokeWidth="1.8" />
    {/* 8 Gear Teeth */}
    <rect x="21.5" y="4" width="5" height="6" rx="1.5" fill="#cbd5e1" />
    <rect x="21.5" y="38" width="5" height="6" rx="1.5" fill="#cbd5e1" />
    <rect x="4" y="21.5" width="6" height="5" rx="1.5" fill="#cbd5e1" />
    <rect x="38" y="21.5" width="6" height="5" rx="1.5" fill="#cbd5e1" />
    <g transform="rotate(45 24 24)">
      <rect x="21.5" y="4" width="5" height="6" rx="1.5" fill="#cbd5e1" />
      <rect x="21.5" y="38" width="5" height="6" rx="1.5" fill="#cbd5e1" />
      <rect x="4" y="21.5" width="6" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="38" y="21.5" width="6" height="5" rx="1.5" fill="#cbd5e1" />
    </g>
  </svg>
);

export const PalettePrismIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M24 6L42 20L34 42H14L6 20L24 6Z"
      stroke="#38bdf8"
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="#0c1328"
    />
    <polygon points="24,6 42,20 24,24" fill="#a855f7" opacity="0.75" />
    <polygon points="42,20 34,42 24,24" fill="#3b82f6" opacity="0.75" />
    <polygon points="34,42 14,42 24,24" fill="#10b981" opacity="0.75" />
    <polygon points="14,42 6,20 24,24" fill="#f59e0b" opacity="0.75" />
    <polygon points="6,20 24,6 24,24" fill="#f43f5e" opacity="0.75" />
    <circle cx="24" cy="24" r="3" fill="#fff" />
  </svg>
);

export const Sparkles: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path
      d="M12 2L14.2 8.3L20 10.5L14.2 12.7L12 19L9.8 12.7L4 10.5L9.8 8.3L12 2Z"
      fill="#fde047"
      stroke="#f59e0b"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M19 16L20.2 19.3L23 20.5L20.2 21.7L19 25L17.8 21.7L15 20.5L17.8 19.3L19 16Z"
      fill="#67e8f9"
      transform="scale(0.7) translate(8, 2)"
    />
  </svg>
);

// Bespoke 3D Color-Filled Vectors for Loss, Jackpot & Win (Zero generic emoji/templates)
export const LossLaserCrossIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lossShieldFill" x1="4" y1="2" x2="24" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7f1d1d" />
        <stop offset="45%" stopColor="#450a0a" />
        <stop offset="100%" stopColor="#1c0205" />
      </linearGradient>
      <linearGradient id="lossShieldRim" x1="4" y1="2" x2="24" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="50%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
      <linearGradient id="rubyCrossGrad" x1="8" y1="8" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff4d6d" />
        <stop offset="40%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#9f1239" />
      </linearGradient>
      <filter id="lossGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Shield Base */}
    <path
      d="M14 2L24 6V13C24 19.5 19.8 24.5 14 26.5C8.2 24.5 4 19.5 4 13V6L14 2Z"
      fill="url(#lossShieldFill)"
      stroke="url(#lossShieldRim)"
      strokeWidth="1.6"
      strokeLinejoin="round"
      filter="url(#lossGlow)"
    />
    {/* Inner Shield Cavity */}
    <path
      d="M14 4.5L21.5 7.8V13C21.5 18 18.2 22.2 14 24C9.8 22.2 6.5 18 6.5 13V7.8L14 4.5Z"
      fill="#280308"
      stroke="#ef4444"
      strokeWidth="0.6"
      opacity="0.85"
    />
    {/* 3D Color-Filled Ruby Crossed Crest */}
    <path
      d="M9 9L19 19M19 9L9 19"
      stroke="url(#rubyCrossGrad)"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9L19 19M19 9L9 19"
      stroke="#ffffff"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center Core Ruby Gem */}
    <circle cx="14" cy="14" r="3" fill="#ff1744" stroke="#ffffff" strokeWidth="0.8" />
    <circle cx="14" cy="14" r="1.2" fill="#ffffff" />
  </svg>
);

export const RoyalCrownJackpotIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="royalGoldGrad" x1="2" y1="4" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="25%" stopColor="#fde047" />
        <stop offset="60%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
      <linearGradient id="velvetCap" x1="6" y1="10" x2="22" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="60%" stopColor="#b91c1c" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>
      <linearGradient id="diamondCyan" x1="12" y1="3" x2="16" y2="7" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <radialGradient id="jackpotHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
      </radialGradient>
      <filter id="crownGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Sunburst Aura */}
    <circle cx="14" cy="14" r="12" fill="url(#jackpotHalo)" />
    {/* Inner Velvet Cushion */}
    <path
      d="M5.5 19C5.5 14 9 10 14 10C19 10 22.5 14 22.5 19H5.5Z"
      fill="url(#velvetCap)"
    />
    {/* Royal Crown Arches & Peaks */}
    <path
      d="M3.5 19.5L5 9.5L10 14.5L14 4.5L18 14.5L23 9.5L24.5 19.5H3.5Z"
      fill="url(#royalGoldGrad)"
      stroke="#fef9c3"
      strokeWidth="1.2"
      strokeLinejoin="round"
      filter="url(#crownGlowFilter)"
    />
    {/* Diamonds & Gems on Peaks */}
    <circle cx="14" cy="4.5" r="2.2" fill="url(#diamondCyan)" stroke="#ffffff" strokeWidth="0.8" />
    <circle cx="5" cy="9.5" r="1.6" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.6" />
    <circle cx="23" cy="9.5" r="1.6" fill="#10b981" stroke="#ffffff" strokeWidth="0.6" />
    {/* Crown Base Ribbon with Studs */}
    <rect x="3.5" y="20" width="21" height="4" rx="1.5" fill="url(#royalGoldGrad)" stroke="#fef08a" strokeWidth="0.8" />
    <circle cx="7" cy="22" r="1.1" fill="#38bdf8" />
    <circle cx="10.5" cy="22" r="1.1" fill="#ef4444" />
    <circle cx="14" cy="22" r="1.3" fill="#ffffff" stroke="#eab308" strokeWidth="0.5" />
    <circle cx="17.5" cy="22" r="1.1" fill="#10b981" />
    <circle cx="21" cy="22" r="1.1" fill="#38bdf8" />
  </svg>
);

export const WinValkyrieIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="winCupGold" x1="6" y1="5" x2="22" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fffde7" />
        <stop offset="30%" stopColor="#fde047" />
        <stop offset="70%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="winLaurelGreen" x1="2" y1="4" x2="26" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <radialGradient id="winHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#10b981" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#047857" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Emerald Aura */}
    <circle cx="14" cy="14" r="12" fill="url(#winHalo)" />
    {/* Laurel Wreath Left & Right */}
    <path
      d="M5 14C5 8 9 4 14 3M23 14C23 8 19 4 14 3"
      stroke="url(#winLaurelGreen)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Laurel Leaf Buds */}
    <circle cx="6" cy="10" r="1.5" fill="#34d399" />
    <circle cx="8" cy="6" r="1.5" fill="#34d399" />
    <circle cx="22" cy="10" r="1.5" fill="#34d399" />
    <circle cx="20" cy="6" r="1.5" fill="#34d399" />
    {/* Trophy Cup Body */}
    <path
      d="M9 7H19V15C19 18 16.5 20.5 14 20.5C11.5 20.5 9 18 9 15V7Z"
      fill="url(#winCupGold)"
      stroke="#fffbeb"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
    {/* Handles */}
    <path
      d="M9 9.5H6.5C5.5 9.5 4.5 10.5 4.5 11.5V13C4.5 15.5 6.5 16.5 9 16.5M19 9.5H21.5C22.5 9.5 23.5 10.5 23.5 11.5V13C23.5 15.5 21.5 16.5 19 16.5"
      stroke="#f59e0b"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Base Stand */}
    <path d="M12.5 20.5V23.5H15.5V20.5" fill="#b45309" stroke="#f59e0b" strokeWidth="0.8" />
    <rect x="8.5" y="23.5" width="11" height="2.8" rx="1.2" fill="url(#winCupGold)" stroke="#fef08a" strokeWidth="0.8" />
    {/* Star Crest */}
    <polygon points="14,10 15,12.5 17.5,12.8 15.6,14.6 16.2,17.2 14,15.8 11.8,17.2 12.4,14.6 10.5,12.8 13,12.5" fill="#ffffff" />
  </svg>
);

export const Win3DBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#032215]/95 via-[#063e27]/95 to-[#021c11]/95 border-2 border-emerald-400/90 shadow-[0_0_20px_rgba(16,224,127,0.55)] text-emerald-300 font-orbitron font-black text-[10.5px] tracking-wider transition-all hover:scale-105 ${className}`}
  >
    <WinValkyrieIcon className="w-4 h-4" />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-emerald-300 to-teal-200 drop-shadow-[0_0_8px_rgba(16,224,127,0.6)]">
      WIN
    </span>
  </div>
);

export const Loss3DBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#2b050f]/95 via-[#450818]/95 to-[#1c0208]/95 border-2 border-rose-500/90 shadow-[0_0_20px_rgba(244,63,94,0.55)] text-rose-200 font-orbitron font-black text-[10.5px] tracking-wider transition-all hover:scale-105 ${className}`}
  >
    <LossLaserCrossIcon className="w-4 h-4" />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-red-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
      LOSS
    </span>
  </div>
);

export const Jackpot3DBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2e1d00]/95 via-[#543400]/95 to-[#241600]/95 border-2 border-yellow-300 shadow-[0_0_26px_rgba(250,204,21,0.85)] text-yellow-100 font-orbitron font-black text-[10.5px] tracking-wider animate-[pulse_2s_infinite] transition-all hover:scale-105 ${className}`}
  >
    <RoyalCrownJackpotIcon className="w-4 h-4" />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-400 font-black drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]">
      JACKPOT 9X
    </span>
  </div>
);

