/**
 * Unicode Formatter & Signal Copy Generator
 * Converts text and numbers into premium mathematical sans-serif bold unicode:
 * ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎
 */

export function toBoldUnicode(str: string): string {
  return str.replace(/[A-Za-z0-9]/g, (char) => {
    const code = char.charCodeAt(0);
    // Uppercase A-Z -> Mathematical Sans-Serif Bold A-Z
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(0x1d5d4 + (code - 65));
    }
    // Lowercase a-z -> Mathematical Sans-Serif Bold a-z
    if (code >= 97 && code <= 122) {
      return String.fromCodePoint(0x1d5ee + (code - 97));
    }
    // Digits 0-9 -> Mathematical Sans-Serif Bold 0-9
    if (code >= 48 && code <= 57) {
      return String.fromCodePoint(0x1d7ec + (code - 48));
    }
    return char;
  });
}

/**
 * Premium 6-Line Bold Signal Formatter
 */
export function formatSignalForCopy(params: {
  period: string;
  cycle: string;
  prediction: 'BIG' | 'SMALL';
  targetNumber: number;
  secondaryNumber: number;
  favorNumber?: number;
  oppositeNumber?: number;
  confidence: number;
  pattern: string;
  ruleCode?: string;
  level?: number;
  betAmount?: number;
}): string {
  const brand = `☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎`;
  const periodLine = `⚡ ${toBoldUnicode('WINGO 1M')} 〆 ${toBoldUnicode('PERIOD')}: #${toBoldUnicode(params.period.slice(-5))}`;
  const predLine = `🎯 ${toBoldUnicode('PREDICTION')}: ${toBoldUnicode(params.prediction)}`;
  const favor = params.favorNumber ?? params.targetNumber;
  const opp = params.oppositeNumber ?? params.secondaryNumber;
  const ballLine = `🎱 ${toBoldUnicode('FAVOR')}: #${toBoldUnicode(String(favor))} 〆 🛡️ ${toBoldUnicode('OPPOSITE')}: #${toBoldUnicode(String(opp))}`;
  const jackpotLine = `✨ ${toBoldUnicode('EITHER MATCH = JACKPOT 9X')}`;
  
  // Clean pattern name for clean bold presentation
  const cleanPattern = params.pattern.replace(/[^\w\s-]/g, '').trim() || 'NEURAL VERIFIED';
  const patternLine = `🔥 ${toBoldUnicode('PATTERN')}: ${toBoldUnicode(cleanPattern)}`;
  const accLine = `👑 ${toBoldUnicode('ACCURACY')}: ${toBoldUnicode(String(params.confidence))}% 〆 ${toBoldUnicode('DISCIPLINE 1-4')}`;

  return [brand, periodLine, predLine, ballLine, jackpotLine, patternLine, accLine].join('\n');
}

/**
 * Premium Bold Bet Advice / Target Chase Formatter
 */
export function formatChaseForCopy(params: {
  period: string;
  prediction: string;
  betAmount: number;
  currentLevel: number;
  totalLevels: number;
  walletBalance: number;
  targetProfit: number;
  currentProfit: number;
}): string {
  const brand = `☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎`;
  const periodLine = `⏱️ ${toBoldUnicode('PERIOD')}: #${toBoldUnicode(params.period.slice(-5))} 〆 ${toBoldUnicode('BET')}: ₹${toBoldUnicode(String(params.betAmount))}`;
  const predLine = `🎯 ${toBoldUnicode('PREDICTION')}: ${toBoldUnicode(params.prediction)} (${toBoldUnicode('LEVEL')} ${toBoldUnicode(String(params.currentLevel))}/${toBoldUnicode(String(params.totalLevels))})`;
  const walletLine = `👛 ${toBoldUnicode('WALLET')}: ₹${toBoldUnicode(String(params.walletBalance))} 〆 ${toBoldUnicode('PROFIT')}: ₹${toBoldUnicode(String(params.currentProfit))}`;
  const goalLine = `🏁 ${toBoldUnicode('TARGET GOAL')}: ₹${toBoldUnicode(String(params.targetProfit))}`;
  const discLine = `⚡ ${toBoldUnicode(`FOLLOW ${params.totalLevels}-LEVEL DISCIPLINE`)}`;

  return [brand, periodLine, predLine, walletLine, goalLine, discLine].join('\n');
}
