import React from 'react';

export const Ticker: React.FC = () => {
  const marqueeItems = [
    '☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎ · WINGO 1M VIP NEURAL ENGINE',
    '👑 1 FAVOR & 1 OPPOSITE BALL LOADED · EITHER MATCH = 777 JACKPOT 9X!',
    '🐉 DRAGON SUITE ACTIVE · 3-6 LIVE RIDE & 7+ CLIMAX SHIELD',
    '⚡ ZIGZAG (1:1) · TWINS (2:2) · (2:1:2) DUAL WING ACTIVE',
    '🛡️ ANTI-TRAP DEFENSE MATRIX · NEVER GETS TRAPPED',
    '🎯 DYNAMIC BEST BALL NUMBER CALIBRATION · NEVER STATIC',
    '🔥 5-REPEAT BIGG & 4-REPEAT SMALL SPECIAL RULES LOADED',
    '📊 4-LEVEL TARGET CHASE DISCIPLINE · MAX SAFE RECOVERY',
    '🎱 AUTHENTIC 3D SPHERICAL WINGO BALL VISUALIZATION',
    '⏱️ EXCLUSIVE WINGO 1M DRAW FEED · REAL-TIME PROBABILITY',
  ];

  return (
    <div className="w-full overflow-hidden bg-black/60 border-y border-amber-500/15 py-1.5 flex items-center shadow-inner">
      <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite] text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-amber-200/80">
        {[...marqueeItems, ...marqueeItems].map((item, idx) => (
          <span key={idx} className="inline-flex items-center mx-4">
            <span className="text-amber-400 mr-2">✦</span>
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
