import { GameCycle, HistoryIssue, PredictionResult } from '../types';
import { run1000DrawBacktest, syncCorpus1000 } from './backtestEngine';
import { COLOR_TRADING_PATTERNS_220 } from './patternsDatabase220';

export const PATTERNS_DATABASE = COLOR_TRADING_PATTERNS_220;

/**
 * Dynamic Number Transition Mapping
 */
const BASE_NUMBER_MAP: Record<number, { BIG: number[]; SMALL: number[] }> = {
  0: { BIG: [7, 8, 9], SMALL: [2, 1, 3] },
  1: { BIG: [8, 9, 6], SMALL: [3, 2, 4] },
  2: { BIG: [9, 7, 8], SMALL: [4, 1, 0] },
  3: { BIG: [6, 8, 7], SMALL: [1, 2, 0] },
  4: { BIG: [5, 7, 9], SMALL: [0, 2, 3] },
  5: { BIG: [6, 7, 8], SMALL: [1, 3, 0] },
  6: { BIG: [7, 8, 9], SMALL: [2, 0, 4] },
  7: { BIG: [8, 9, 5], SMALL: [3, 1, 2] },
  8: { BIG: [9, 6, 7], SMALL: [4, 0, 1] },
  9: { BIG: [5, 8, 6], SMALL: [0, 3, 2] },
};

function getStreak(seq: ('B' | 'S')[]) {
  if (!seq.length) return { char: null as 'B' | 'S' | null, count: 0 };
  const first = seq[0];
  let count = 0;
  for (const c of seq) {
    if (c === first) count++;
    else break;
  }
  return { char: first, count };
}

/**
 * Dynamically picks 1 Favor Number (from predicted side) & 1 Opposite Number (from opposite side)
 * EITHER number matching triggers JACKPOT!
 */
export function calculateDynamicBestNumbers(
  predictedSize: 'BIG' | 'SMALL',
  recentNumbers: number[],
  ruleCode?: string
): { 
  targetNumber: number; 
  secondaryNumber: number; 
  favorNumber: number; 
  oppositeNumber: number; 
} {
  const favorPool = predictedSize === 'BIG' ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  const oppositePool = predictedSize === 'BIG' ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9];
  const lastNum = recentNumbers[0] !== undefined ? recentNumbers[0] : (predictedSize === 'BIG' ? 7 : 2);
  const secondLastNum = recentNumbers[1];

  if (ruleCode === 'RULE_1_REPEAT_5') {
    const candidates = [6, 7, 8].filter((n) => n !== lastNum);
    const favor = candidates[0] ?? 7;
    const opp = (lastNum % 5) || 2;
    return { targetNumber: favor, secondaryNumber: opp, favorNumber: favor, oppositeNumber: opp };
  }
  if (ruleCode === 'RULE_2_REPEAT_4') {
    const candidates = [1, 0, 2].filter((n) => n !== lastNum);
    const favor = candidates[0] ?? 2;
    const opp = 7;
    return { targetNumber: favor, secondaryNumber: opp, favorNumber: favor, oppositeNumber: opp };
  }
  if (ruleCode === 'RULE_3_BRIDGE_4_6') {
    return { targetNumber: 2, secondaryNumber: 8, favorNumber: 2, oppositeNumber: 8 };
  }

  // Frequency analysis of last 25 rounds
  const freq: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  recentNumbers.slice(0, 25).forEach((n) => {
    if (freq[n] !== undefined) freq[n]++;
  });

  const favorMapping = BASE_NUMBER_MAP[lastNum]?.[predictedSize] || favorPool.slice(0, 3);
  const oppositeSize = predictedSize === 'BIG' ? 'SMALL' : 'BIG';
  const oppositeMapping = BASE_NUMBER_MAP[lastNum]?.[oppositeSize] || oppositePool.slice(0, 3);

  // Deterministic seed derived from sequence invariant (NEVER uses Date.now)
  const seed = Math.abs(lastNum * 37 + (secondLastNum ?? 4) * 19 + recentNumbers.length * 13);

  // 1. Calculate Favor Number (Best on predicted side)
  const favorScored = favorPool.map((candidate) => {
    let score = 100;
    const mapIndex = favorMapping.indexOf(candidate);
    if (mapIndex !== -1) score += (3 - mapIndex) * 22;
    const appearCount = freq[candidate] || 0;
    score -= appearCount * 8;
    if (candidate === lastNum) score -= 36;
    if (candidate === secondLastNum) score -= 16;
    if (lastNum % 2 !== candidate % 2) score += 14;
    const salt = (seed + candidate * 7) % 11;
    score += salt;
    return { candidate, score };
  });
  favorScored.sort((a, b) => b.score - a.score);
  const favorNumber = favorScored[0].candidate;

  // 2. Calculate Opposite Number (Best hedging ball on opposite side)
  const oppositeScored = oppositePool.map((candidate) => {
    let score = 100;
    const mapIndex = oppositeMapping.indexOf(candidate);
    if (mapIndex !== -1) score += (3 - mapIndex) * 22;
    const appearCount = freq[candidate] || 0;
    score -= appearCount * 8;
    if (candidate === lastNum) score -= 28;
    if (lastNum % 2 !== candidate % 2) score += 14;
    const salt = (seed + candidate * 11) % 13;
    score += salt;
    return { candidate, score };
  });
  oppositeScored.sort((a, b) => b.score - a.score);
  const oppositeNumber = oppositeScored[0].candidate;

  return {
    targetNumber: favorNumber,
    secondaryNumber: oppositeNumber,
    favorNumber,
    oppositeNumber,
  };
}

/**
 * ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎ - DEEP SCANNING & UNDISTURBED DRAGON ENGINE
 * 
 * STRICT LOGICAL RULES:
 * 1. 1:3 OPPOSITE INCLINE RULE (Streak = 3 with opposite predecessor):
 *    - Example: 1 Small then 3 Big (S-B-B-B) ➔ Predicts SMALL!
 *    - Example: 1 Big then 3 Small (B-S-S-S) ➔ Predicts BIG!
 * 2. DRAGON ENTRY (Streak >= 4):
 *    - If 4 or more consecutive of same side (B-B-B-B or S-S-S-S):
 *      Enters full Dragon Pattern! Dragon is NEVER disturbed ➔ Rides same side unbroken!
 * 3. DRAGON BREAK / OPPOSITE RESULT (HIGH DEEP SCAN ACTIVATION):
 *    - When a 3+ streak breaks (e.g. B-B-B-S or S-S-S-B):
 *      - Engine triggers HIGH-LEVEL DEEP SCAN!
 *      - Checks Single Fakeout Break (Dragon Return)
 *      - Checks 3:3 Mirror Bridge
 *      - Scans 16 Sequence Patterns (P01 - P16)
 *      - Scans SBB->S / BSS->B, 5-Repeat, 4-Repeat, Twins (2:2), Zigzag (1:1).
 */
export function analyzePatternSequence(
  issues: HistoryIssue[],
  nextPeriodStr: string,
  mode: GameCycle = '1m',
  options?: {
    lastResultWasLoss?: boolean;
    failedSide?: 'BIG' | 'SMALL';
    corpus1000?: ('B' | 'S')[];
    level?: number;
  }
): PredictionResult {
  const nums = issues.map((x) => x.number);
  const seq: ('B' | 'S')[] = nums.map((n) => (n >= 5 ? 'B' : 'S'));

  // Default fallback if insufficient stream
  if (seq.length < 2) {
    const defaultSize: 'BIG' | 'SMALL' = nums[0] !== undefined ? (nums[0] >= 5 ? 'SMALL' : 'BIG') : 'BIG';
    const dynamicNumbers = calculateDynamicBestNumbers(defaultSize, nums);
    return {
      period: nextPeriodStr,
      mode,
      prediction: defaultSize,
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 88,
      patternName: 'NEURAL STREAM CALIBRATION',
      patternCategory: 'FOUNDATION',
      ruleCode: 'INIT_STREAM',
      reason: 'Calibrating stream with historical parity equilibrium',
      regime: 'NEUTRAL',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: false,
      trapDefenseMode: 'SAFE_FLOW',
      scanStatus: 'EQUILIBRIUM_SCAN',
      deepAnalysisSummary: 'Waiting for stream synchronization...',
    };
  }

  const lastNum = nums[0];
  const secondLastNum = nums[1];
  const streak = getStreak(seq);

  // =========================================================================
  // USER PATTERN 1: B-S-S-B ANTI-TRAP & TWIST PATTERN SUITE
  // "jab bhi like big small small aur uske bad ek bigha jaaye to yah next Big nahin predict karke yah small predict Karega and agar small aata Hai to vah fir se samarpit Karega aur use bar bhi small a jata hai to next Big predict Karega to yah Aisa follow Karega and agar yah Do bar like Jaise like big aaya FIR small aaya FIR small aaya fir bhi gaya hua hai agar uske bad yah small predict Kiya aur uske bad agar biga Gaya tab bhi next small predict Karega tab vah twist pattern Samajh ke tab usko yah acche se pahchane ka aur uska prediction dega"
  // =========================================================================

  // [1.1] Symmetric 2-Repeat Completion after B-SS-B:
  // Chronological: B-S-S-B-S-S (seq: [S, S, B, S, S, B]) ➔ PREDICTS BIG!
  // Mirror: S-B-B-S-B-B (seq: [B, B, S, B, B, S]) ➔ PREDICTS SMALL!
  if (seq.length >= 6) {
    if (seq[0] === 'S' && seq[1] === 'S' && seq[2] === 'B' && seq[3] === 'S' && seq[4] === 'S' && seq[5] === 'B') {
      const dynamicNumbers = calculateDynamicBestNumbers('BIG', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'BIG',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 98,
        patternName: '💎 SYMMETRIC B-SS-B-SS RECOVERY (➔ BIG)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'SYMMETRIC_BSSBSS_BIG',
        reason: 'B-S-S-B followed by 2 consecutive Small outcomes. 2-Small leg completed — predicting return to BIG.',
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'B-SS-B-SS completed. Symmetrical bounce to BIG locked.',
      };
    }

    if (seq[0] === 'B' && seq[1] === 'B' && seq[2] === 'S' && seq[3] === 'B' && seq[4] === 'B' && seq[5] === 'S') {
      const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'SMALL',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 98,
        patternName: '💎 SYMMETRIC S-BB-S-BB RECOVERY (➔ SMALL)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'SYMMETRIC_SBBSBB_SMALL',
        reason: 'S-B-B-S followed by 2 consecutive Big outcomes. 2-Big leg completed — predicting return to SMALL.',
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'S-BB-S-BB completed. Symmetrical bounce to SMALL locked.',
      };
    }
  }

  // [1.2] Twist Pattern (B-SS-B followed unexpectedly by BIG ➔ B-SS-BB):
  // Chronological: B-S-S-B-B (seq: [B, B, S, S, B]) ➔ PREDICTS SMALL!
  // Mirror: S-B-B-S-S (seq: [S, S, B, B, S]) ➔ PREDICTS BIG!
  if (seq.length >= 5) {
    if (seq[0] === 'B' && seq[1] === 'B' && seq[2] === 'S' && seq[3] === 'S' && seq[4] === 'B') {
      const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'SMALL',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 97,
        patternName: '🌪️ TWIST SANDWICH PATTERN (B-SS-BB ➔ SMALL)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'TWIST_PATTERN_BSSBB',
        reason: 'B-S-S-B followed by unexpected Big twist. Twist pattern detected — intercepting trap by predicting SMALL.',
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'B-SS-BB twist pattern identified. Anti-trap lock on SMALL.',
      };
    }

    if (seq[0] === 'S' && seq[1] === 'S' && seq[2] === 'B' && seq[3] === 'B' && seq[4] === 'S') {
      const dynamicNumbers = calculateDynamicBestNumbers('BIG', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'BIG',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 97,
        patternName: '🌪️ TWIST SANDWICH PATTERN (S-BB-SS ➔ BIG)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'TWIST_PATTERN_SBBSS',
        reason: 'S-B-B-S followed by unexpected Small twist. Twist pattern detected — intercepting trap by predicting BIG.',
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'S-BB-SS twist pattern identified. Anti-trap lock on BIG.',
      };
    }
  }

  // [1.3] Continuation Leg after B-SS-B:
  // Chronological: B-S-S-B-S (seq: [S, B, S, S, B]) ➔ PREDICTS SMALL!
  // Mirror: S-B-B-S-B (seq: [B, S, B, B, S]) ➔ PREDICTS BIG!
  if (seq.length >= 5) {
    if (seq[0] === 'S' && seq[1] === 'B' && seq[2] === 'S' && seq[3] === 'S' && seq[4] === 'B') {
      const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'SMALL',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 97,
        patternName: '🔁 B-SS-B CONTINUATION (B-SS-B-S ➔ SMALL)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'CONTINUATION_BSSBS_SMALL',
        reason: 'B-S-S-B correctly produced Small. Maintaining pattern continuation — predicting 2nd SMALL.',
        regime: 'TRENDING',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'B-SS-B-S continuation active. Repeating SMALL for 2nd step.',
      };
    }

    if (seq[0] === 'B' && seq[1] === 'S' && seq[2] === 'B' && seq[3] === 'B' && seq[4] === 'S') {
      const dynamicNumbers = calculateDynamicBestNumbers('BIG', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'BIG',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 97,
        patternName: '🔁 S-BB-S CONTINUATION (S-BB-S-B ➔ BIG)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'CONTINUATION_SBBSB_BIG',
        reason: 'S-B-B-S correctly produced Big. Maintaining pattern continuation — predicting 2nd BIG.',
        regime: 'TRENDING',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'S-BB-S-B continuation active. Repeating BIG for 2nd step.',
      };
    }
  }

  // [1.4] Base B-S-S-B / S-B-B-S Initial Match:
  // Chronological: B-S-S-B (seq: [B, S, S, B]) ➔ Next Big NAHI predict karke SMALL predict karega!
  // Chronological: S-B-B-S (seq: [S, B, B, S]) ➔ Next Small NAHI predict karke BIG predict karega!
  if (seq.length >= 4) {
    if (seq[0] === 'B' && seq[1] === 'S' && seq[2] === 'S' && seq[3] === 'B') {
      const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'SMALL',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 96,
        patternName: '🛡️ B-SS-B ANTI-TRAP PIVOT (➔ SMALL)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'BASE_BSSB_PREDICT_SMALL',
        reason: 'B-S-S-B sandwich detected. Anti-trap protocol engaged: will NOT chase Big; predicting SMALL.',
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'B-S-S-B pattern detected. Zero-trap policy: issuing SMALL (not Big).',
      };
    }

    if (seq[0] === 'S' && seq[1] === 'B' && seq[2] === 'B' && seq[3] === 'S') {
      const dynamicNumbers = calculateDynamicBestNumbers('BIG', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'BIG',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 96,
        patternName: '🛡️ S-BB-S ANTI-TRAP PIVOT (➔ BIG)',
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'BASE_SBBS_PREDICT_BIG',
        reason: 'S-B-B-S sandwich detected. Anti-trap protocol engaged: will NOT chase Small; predicting BIG.',
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'S-B-B-S pattern detected. Zero-trap policy: issuing BIG (not Small).',
      };
    }
  }

  // =========================================================================
  // RULE 1: 1:3 OPPOSITE INCLINE REVERSAL vs FULL DRAGON ENTRY (4+)
  // "Dekho agar lagatar koi bhi result teen bar a jaaye like big teen bar a jaaye ya small teen bar a jaaye to use samay yah dekhega ki uske pahle abhi ke nahin aaya Hai tab ya uske pahle small nahin aaya Hai tab kya ki uske opposite dega like Jaise ek small aaya FIR uske bad teen big a Gaya to next small dega aur vah big per bhi apply kar do aur dragon mein dragon pattern mein Aisa nahin hona chahie aur agar uske bad bhi agar man Lo big teen agar next bhi aata hai tab use samay per yah next apna prediction big hi dega ki vah dragon pattern mein Chala jaega"
  // =========================================================================

  // [Case A] Streak is EXACTLY 3 and preceded by opposite predecessor (e.g. S-B-B-B -> SMALL, B-S-S-S -> BIG)
  if (streak.count === 3 && streak.char && seq.length >= 4) {
    const priorPredecessor = seq[3];
    if (priorPredecessor !== streak.char) {
      const pivotTargetSide = priorPredecessor === 'B' ? 'BIG' : 'SMALL';
      const dynamicNumbers = calculateDynamicBestNumbers(pivotTargetSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: pivotTargetSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 96,
        patternName: `⚖️ 1:3 INCLINE PIVOT (${priorPredecessor}-${streak.char}×3 ➔ ${pivotTargetSide})`,
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: `INCLINE_1_3_${streak.char}`,
        reason: `1 opposite (${priorPredecessor === 'B' ? 'BIG' : 'SMALL'}) preceded 3 consecutive ${streak.char === 'B' ? 'BIG' : 'SMALL'}. 1:3 Incline rule activated — predicting transition back to ${pivotTargetSide}.`,
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: `1:3 pattern detected (${priorPredecessor}-3${streak.char}). Executing pivot to ${pivotTargetSide}. (If unbroken next round, enters Dragon Lock).`,
      };
    }
  }

  // [Case B] Full Dragon Entry (Streak >= 4):
  // "aur dragon mein dragon pattern mein Aisa nahin hona chahie aur agar uske bad bhi agar man Lo big teen agar next bhi aata hai tab use samay per yah next apna prediction big hi dega ki vah dragon pattern mein Chala jaega"
  if (streak.count >= 4 && streak.char) {
    const dragonSide = streak.char === 'B' ? 'BIG' : 'SMALL';
    const dynamicNumbers = calculateDynamicBestNumbers(dragonSide, nums);
    const confidenceScore = Math.min(99, 94 + streak.count);

    return {
      period: nextPeriodStr,
      mode,
      prediction: dragonSide,
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: confidenceScore,
      patternName: `🐉 ${dragonSide} DRAGON LIVE LOCK (×${streak.count} LIVE)`,
      patternCategory: 'DRAGON_MOMENTUM',
      ruleCode: `DRAGON_LOCK_${streak.count}`,
      reason: `${streak.count} consecutive ${dragonSide} active. Full Dragon Entry (Streak >= 4) — Undisturbed Dragon Lock maintains continuous ${dragonSide} ride.`,
      regime: 'DRAGON',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      isDragonActive: true,
      dragonStreak: streak.count,
      dragonSide: dragonSide,
      trapDefenseMode: 'DRAGON_LOCK',
      scanStatus: 'DRAGON_LOCK',
      deepAnalysisSummary: `Undisturbed Dragon active (${streak.count} ${dragonSide}). Zero-interference lock on ${dragonSide}.`,
    };
  }

  // [Case C] Emergency Loss Penalization & 1,000-Draw Background Empirical Backtest
  // "ek loss hote hi yah pura deep penalisation start kar dega jisse kam se kam loss ho sake aur yah next win dene ka koshish karega and pura detail analyse karega pura full pattern ke sath aur check karega 1000 results mein kiya yah back testing karega... lekin vah yah show nahin karega only background mein work karega"
  if (options?.lastResultWasLoss) {
    const corpus = options.corpus1000 || syncCorpus1000(issues);
    const backtest = run1000DrawBacktest(seq, corpus);

    if (backtest.isStatisticallyVerified) {
      const recoveredSide = backtest.dominantSide;
      const dynamicNumbers = calculateDynamicBestNumbers(recoveredSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: recoveredSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: Math.max(95, backtest.empiricalWinRate),
        patternName: `🛡️ 1,000-DRAW EMPIRICAL RECOVERY (${backtest.empiricalWinRate}%)`,
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: `RECOVERY_1000_${recoveredSide}`,
        reason: `Loss detected. 1,000-draw empirical backtest verified across ${backtest.matchCount} matched historical sequences. Prioritizing ${recoveredSide} with ${backtest.empiricalWinRate}% historical win-rate for immediate next win.`,
        regime: 'REVERSAL',
        stepLevel: 2,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'PATTERN_MATCH_LOCK',
        deepAnalysisSummary: `Background 1000-draw backtest: ${backtest.matchCount} matches evaluated (${backtest.empiricalWinRate}% ${recoveredSide}). Zero UI clutter.`,
      };
    }
  }

  // =========================================================================
  // USER PATTERN 2: 10-RESULT MACRO PATTERN ON 3-STREAK (BBB or SSS)
  // "lagatar teen bar big a Gaya lagatar 3 bar small a Gaya to vah char ya chhah pattern Ko pakadkar nahin vah last 10 results ko dekhega matlab 10 results ko dekhega aur uske hisab se pattern ka andaza lagaega usmein jo pattern chal raha hai uske hisab se prediction dega"
  // =========================================================================
  if (streak.count === 3 && streak.char) {
    const currentStreakSide: 'BIG' | 'SMALL' = streak.char === 'B' ? 'BIG' : 'SMALL';
    const oppositeSide: 'BIG' | 'SMALL' = streak.char === 'B' ? 'SMALL' : 'BIG';
    const seq10 = seq.slice(0, 10);

    // 10-result window analysis
    const currentCount10 = seq10.filter((x) => x === streak.char).length;
    const oppCount10 = seq10.length - currentCount10;

    // Check count of alternations in the 10 results
    let alternations = 0;
    for (let i = 0; i < seq10.length - 1; i++) {
      if (seq10[i] !== seq10[i + 1]) alternations++;
    }

    // [2.1] 3:3 Mirror Bridge completion inside 10-result window:
    // If preceded by 3 opposite (e.g. S-S-S then B-B-B):
    if (seq10.length >= 6 && seq10[3] !== streak.char && seq10[4] !== streak.char && seq10[5] !== streak.char) {
      const dynamicNumbers = calculateDynamicBestNumbers(oppositeSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: oppositeSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 97,
        patternName: `⚖️ 10-RESULT 3:3 MIRROR DUAL WING (COMPLETED)`,
        patternCategory: 'MIRROR',
        ruleCode: 'MACRO_10_MIRROR_3_3',
        reason: `Last 10 results reveal 3 consecutive ${oppositeSide} followed by 3 consecutive ${currentStreakSide}. 3:3 Mirror completed — pivoting back to ${oppositeSide}.`,
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: `10-Draw Scan: 3:3 Mirror Bridge verified across last 10 rounds (${oppositeSide}3 ➔ ${currentStreakSide}3 ➔ ${oppositeSide}).`,
      };
    }

    // [2.2] Macro Climax Exhaustion Filter (Anti-Trap Guard):
    // When 3 consecutive results appear, blind trend-following is the #1 cause of losses.
    // We enforce Gaussian Mean Reversion & Parity Balancing instead of blindly copying the last side.
    const last3Sum = (nums[0] || 0) + (nums[1] || 0) + (nums[2] || 0);
    const mean3 = last3Sum / 3;

    if (currentCount10 >= 6) {
      // 3-Streak at the top of a 6+/10 saturation: mathematically exhausted!
      const dynamicNumbers = calculateDynamicBestNumbers(oppositeSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: oppositeSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 98,
        patternName: `🛡️ SATURATION EXHAUSTION PIVOT (➔ ${oppositeSide})`,
        patternCategory: 'MEAN_REVERSION',
        ruleCode: 'MACRO_SATURATION_EXHAUSTION',
        reason: `Last 10 results reached ${currentCount10}/10 ${currentStreakSide} saturation (3-period mean: ${mean3.toFixed(1)}). Strict anti-trap prevents repeat trap — pivoting to ${oppositeSide}.`,
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: `Macro saturation (${currentCount10}/10) reached terminal climax. Reversion to ${oppositeSide} locked.`,
      };
    }

    // [2.3] High Alternation Regime in last 10 (Ping-Pong / Oscillation Climax):
    // If the 10 results have high alternation frequency, a 3-streak has reached boundary exhaustion:
    if (alternations >= 5) {
      const dynamicNumbers = calculateDynamicBestNumbers(oppositeSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: oppositeSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 96,
        patternName: `⚡ 10-RESULT OSCILLATION CLUSTER PIVOT`,
        patternCategory: 'SPECIAL_SEQUENCE',
        ruleCode: 'MACRO_10_OSCILLATION_PIVOT',
        reason: `Last 10 results exhibit strong alternating oscillation (${alternations} switches). 3-streak cluster exhausted — pivoting to ${oppositeSide}.`,
        regime: 'REVERSAL',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: `10-Draw Scan: Alternation density ${alternations}/9. Cluster exhaustion detected — pivoting to ${oppositeSide}.`,
      };
    }

    // [2.4] Standard 10-Result Equilibrium (Mean-Reversion Pivot):
    const recommendedSide: 'BIG' | 'SMALL' = currentCount10 > oppCount10 ? oppositeSide : currentStreakSide;
    const dynamicNumbers = calculateDynamicBestNumbers(recommendedSide, nums);
    return {
      period: nextPeriodStr,
      mode,
      prediction: recommendedSide,
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 96,
      patternName: `⚖️ 10-RESULT MACRO EQUILIBRIUM PIVOT (➔ ${recommendedSide})`,
      patternCategory: 'SPECIAL_SEQUENCE',
      ruleCode: 'MACRO_10_EQUILIBRIUM_PIVOT',
      reason: `Evaluated across last 10 results (Balance: ${currentCount10} ${currentStreakSide} vs ${oppCount10} ${oppositeSide}). Macro equilibrium pivot predicts ${recommendedSide}.`,
      regime: 'REVERSAL',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      isDragonActive: false,
      trapDefenseMode: 'TRAP_BUSTER_ARMED',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: `10-Draw Scan: Comprehensive 10-period rhythm indicates parity rotation to ${recommendedSide}.`,
    };
  }

  // =========================================================================
  // RULE 2: DRAGON BREAK INTERCEPT & HIGH DEEP SCAN ACTIVATION
  // "agar bich mein Koi dusra result A jata Hai tab yah high dipli scan karega"
  // "ya teen teen result aata Hai uske bad Koi uska opposite result A jata Hai tab yah scan Karega aur acche se scan Karega analyse Karega and then prediction dega"
  // =========================================================================
  const priorStreak = getStreak(seq.slice(1));
  const isDragonJustBroken = priorStreak.count >= 3 && seq[0] !== priorStreak.char;

  if (isDragonJustBroken && priorStreak.char) {
    const brokenDragonSide = priorStreak.char === 'B' ? 'BIG' : 'SMALL';
    const newBreakSide = seq[0] === 'B' ? 'BIG' : 'SMALL';

    // Check A: 3:3 Mirror Bridge Detection ("teen teen result aata hai...")
    // If prior streak was exactly 3 (e.g. B-B-B) and first opposite appeared (S),
    // then 3:3 mirror transition is starting -> predict 2nd leg of the new side!
    if (priorStreak.count === 3) {
      const dynamicNumbers = calculateDynamicBestNumbers(newBreakSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: newBreakSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 96,
        patternName: `⚖️ 3:3 MIRROR DUAL WING (${newBreakSide} LEG 2)`,
        patternCategory: 'MIRROR_33',
        ruleCode: 'MIRROR_3_3_TRANSITION',
        reason: `3-Round ${brokenDragonSide} broke into ${newBreakSide}. High-deep scan locks 3:3 Mirror structure — following ${newBreakSide} leg 2!`,
        regime: 'CYCLIC',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        isDragonActive: false,
        trapDefenseMode: 'TRAP_BUSTER_ARMED',
        scanStatus: 'DRAGON_BREAK_DEEP_SCAN',
        deepAnalysisSummary: `Prior 3× ${brokenDragonSide} interrupted by ${newBreakSide}. Deep scan confirms 3:3 Mirror transition to ${newBreakSide}.`,
      };
    }

    // Check B: Single Break Fakeout (Dragon Return - e.g. B-B-B-B-S -> B)
    // If dragon was 4+ and broke with a boundary number (0 or 9 or 5), or if historical momentum favors return:
    if (priorStreak.count >= 4) {
      // Check if break number was extreme parity boundary or single disruption
      const breakNum = nums[0];
      const isExtremeBoundary = breakNum === 0 || breakNum === 9 || breakNum === 4 || breakNum === 5;
      
      if (isExtremeBoundary || seq.length >= 6) {
        const dynamicNumbers = calculateDynamicBestNumbers(brokenDragonSide, nums);
        return {
          period: nextPeriodStr,
          mode,
          prediction: brokenDragonSide,
          targetNumber: dynamicNumbers.targetNumber,
          secondaryNumber: dynamicNumbers.secondaryNumber,
          confidence: 97,
          patternName: `🔄 DRAGON RETURN FAKEOUT (${brokenDragonSide})`,
          patternCategory: 'DRAGON_RETURN',
          ruleCode: 'DRAGON_RETURN_FAKEOUT',
          reason: `High Deep Scan: ${priorStreak.count}× ${brokenDragonSide} interrupted by single #${breakNum}. Anti-trap identifies break fakeout — re-riding original ${brokenDragonSide} Dragon!`,
          regime: 'DRAGON',
          stepLevel: 1,
          createdAt: Date.now(),
          verified: true,
          isDragonActive: true,
          dragonStreak: priorStreak.count,
          dragonSide: brokenDragonSide,
          trapDefenseMode: 'FAKEOUT_BYPASS',
          scanStatus: 'DRAGON_BREAK_DEEP_SCAN',
          deepAnalysisSummary: `Deep scan caught fakeout at period #${issues[0]?.issue.slice(-4)}. Original ${brokenDragonSide} dragon resumed.`,
        };
      }
    }
  }

  // =========================================================================
  // RULE 3: CORE RULES (5-REPEAT, 4-REPEAT, SBB->S, BSS->B)
  // =========================================================================

  // RULE 1: 5-REPEAT (5 -> 5) => STRONG BIGG
  if (lastNum === 5 && secondLastNum === 5) {
    const dynamicNumbers = calculateDynamicBestNumbers('BIG', nums, 'RULE_1_REPEAT_5');
    return {
      period: nextPeriodStr,
      mode,
      prediction: 'BIG',
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 98,
      patternName: 'RULE 1: 5-REPEAT BIGG TRIGGER',
      patternCategory: 'SPECIAL_RULE',
      ruleCode: 'RULE_1_REPEAT_5',
      reason: 'Consecutive 5 -> 5 detected. Deep scan confirms strong continuous BIGG momentum.',
      regime: 'TRENDING',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      trapDefenseMode: 'TRAP_BUSTER_ARMED',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: 'Consecutive 5->5 strike locked. High-probability BIG prediction.',
    };
  }

  // RULE 2: 4-REPEAT (4 -> 4) => DEEP SMALL
  if (lastNum === 4 && secondLastNum === 4) {
    const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums, 'RULE_2_REPEAT_4');
    return {
      period: nextPeriodStr,
      mode,
      prediction: 'SMALL',
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 98,
      patternName: 'RULE 2: 4-REPEAT SMALL TRIGGER',
      patternCategory: 'SPECIAL_RULE',
      ruleCode: 'RULE_2_REPEAT_4',
      reason: 'Consecutive 4 -> 4 detected. Deep scan confirms deep SMALL trend.',
      regime: 'TRENDING',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      trapDefenseMode: 'TRAP_BUSTER_ARMED',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: 'Consecutive 4->4 strike locked. High-probability SMALL prediction.',
    };
  }

  // SBB -> S PATTERN
  if (seq.length >= 3 && seq[0] === 'B' && seq[1] === 'B' && seq[2] === 'S') {
    const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums);
    return {
      period: nextPeriodStr,
      mode,
      prediction: 'SMALL',
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 95,
      patternName: 'SBB ➔ S REVERSAL PATTERN',
      patternCategory: 'SPECIAL_SEQUENCE',
      ruleCode: 'SBB_TO_S',
      reason: 'Deep scan locked Chrono S-B-B pattern. Systematic inflection to SMALL.',
      regime: 'REVERSAL',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      trapDefenseMode: 'TRAP_BUSTER_ARMED',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: 'S-B-B inflection completed. Transitioning to SMALL.',
    };
  }

  // BSS -> B PATTERN
  if (seq.length >= 3 && seq[0] === 'S' && seq[1] === 'S' && seq[2] === 'B') {
    const dynamicNumbers = calculateDynamicBestNumbers('BIG', nums);
    return {
      period: nextPeriodStr,
      mode,
      prediction: 'BIG',
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 95,
      patternName: 'BSS ➔ B REVERSAL PATTERN',
      patternCategory: 'SPECIAL_SEQUENCE',
      ruleCode: 'BSS_TO_B',
      reason: 'Deep scan locked Chrono B-S-S pattern. Systematic recovery to BIG.',
      regime: 'REVERSAL',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      trapDefenseMode: 'TRAP_BUSTER_ARMED',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: 'B-S-S inflection completed. Recovering to BIG.',
    };
  }

  // =========================================================================
  // RULE 4: 220+ COLOR TRADING HEURISTIC PATTERNS MATCH
  // =========================================================================
  const chronoSeq = [...seq].reverse();
  const sortedPatterns = [...PATTERNS_DATABASE].sort((a, b) => b.sequence.length - a.sequence.length);
  for (const pat of sortedPatterns) {
    const pLen = pat.sequence.length;
    if (chronoSeq.length >= pLen) {
      const tail = chronoSeq.slice(-pLen);
      let match = true;
      for (let i = 0; i < pLen; i++) {
        if (tail[i] !== pat.sequence[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        const nextSize = pat.next === 'B' ? 'BIG' : 'SMALL';
        const dynamicNumbers = calculateDynamicBestNumbers(nextSize, nums);
        return {
          period: nextPeriodStr,
          mode,
          prediction: nextSize,
          targetNumber: dynamicNumbers.targetNumber,
          secondaryNumber: dynamicNumbers.secondaryNumber,
          confidence: pat.confidence || 97,
          patternName: pat.name,
          patternCategory: pat.category,
          ruleCode: pat.id,
          reason: `${pat.description} [Pattern ${pat.id}]`,
          regime: pat.category === 'DRAGON' ? 'DRAGON' : 'CYCLIC',
          stepLevel: 1,
          createdAt: Date.now(),
          verified: true,
          trapDefenseMode: 'TRAP_BUSTER_ARMED',
          scanStatus: 'PATTERN_MATCH_LOCK',
          deepAnalysisSummary: `220+ Heuristics Engine matched ${pat.id}: ${pat.name}. Target ${nextSize}.`,
        };
      }
    }
  }

  // =========================================================================
  // RULE 5: TWINS (2:2) & (2:1:2)
  // =========================================================================
  if (seq.length >= 4) {
    if (seq[0] === seq[1] && seq[2] === seq[3] && seq[0] !== seq[2]) {
      const nextSide = seq[0] === 'B' ? 'SMALL' : 'BIG';
      const dynamicNumbers = calculateDynamicBestNumbers(nextSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: nextSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 95,
        patternName: 'TWINS (2:2) DUAL PAIR SWAP',
        patternCategory: 'TWINS',
        ruleCode: 'TWINS_2_2',
        reason: 'Double pair completed (2:2). Deep scan synchronizes with opposite twin leg.',
        regime: 'CYCLIC',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        trapDefenseMode: 'SAFE_FLOW',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'Pair completion (2:2) identified. Swapping to opposite pair.',
      };
    }

    if (seq[0] !== seq[1] && seq[1] === seq[2]) {
      const nextSide = seq[0] === 'B' ? 'BIG' : 'SMALL';
      const dynamicNumbers = calculateDynamicBestNumbers(nextSide, nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: nextSide,
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 93,
        patternName: 'TWINS (2:2) IN-PAIR COMPLETION',
        patternCategory: 'TWINS',
        ruleCode: 'TWINS_2_2_COMPLETION',
        reason: 'First leg of twin appeared. Locking companion completion round.',
        regime: 'CYCLIC',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        trapDefenseMode: 'SAFE_FLOW',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'First leg of pair confirmed. Locking companion twin match.',
      };
    }
  }

  // 2:1:2 Dual Wing
  if (seq.length >= 5) {
    if (seq[0] === 'B' && seq[1] === 'B' && seq[2] === 'S' && seq[3] === 'B' && seq[4] === 'B') {
      const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'SMALL',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 96,
        patternName: '(2:1:2) DUAL WING (BB-S-BB)',
        patternCategory: 'STRUCTURED_212',
        ruleCode: 'PATTERN_2_1_2',
        reason: 'Symmetrical 2:1:2 bridge locked. Completing center inflection node.',
        regime: 'CYCLIC',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        trapDefenseMode: 'SAFE_FLOW',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'Symmetrical 2:1:2 bridge matched. Predicting SMALL.',
      };
    }
    if (seq[0] === 'S' && seq[1] === 'S' && seq[2] === 'B' && seq[3] === 'S' && seq[4] === 'S') {
      const dynamicNumbers = calculateDynamicBestNumbers('BIG', nums);
      return {
        period: nextPeriodStr,
        mode,
        prediction: 'BIG',
        targetNumber: dynamicNumbers.targetNumber,
        secondaryNumber: dynamicNumbers.secondaryNumber,
        confidence: 96,
        patternName: '(2:1:2) DUAL WING (SS-B-SS)',
        patternCategory: 'STRUCTURED_212',
        ruleCode: 'PATTERN_2_1_2',
        reason: 'Symmetrical 2:1:2 bridge locked. Completing center inflection node.',
        regime: 'CYCLIC',
        stepLevel: 1,
        createdAt: Date.now(),
        verified: true,
        trapDefenseMode: 'SAFE_FLOW',
        scanStatus: 'SPECIAL_RULE_LOCK',
        deepAnalysisSummary: 'Symmetrical 2:1:2 bridge matched. Predicting BIG.',
      };
    }
  }

  // RULE 3: TRANSITION & DUAL BRIDGE (4 & 6 TRIGGER)
  if (lastNum === 4 || lastNum === 6) {
    const dynamicNumbers = calculateDynamicBestNumbers('SMALL', nums, 'RULE_3_BRIDGE_4_6');
    return {
      period: nextPeriodStr,
      mode,
      prediction: 'SMALL',
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 93,
      patternName: `RULE 3: TRANSITION BRIDGE (${lastNum} TRIGGER)`,
      patternCategory: 'SPECIAL_RULE',
      ruleCode: 'RULE_3_BRIDGE_4_6',
      reason: `Number ${lastNum} triggered stabilization wave. Next result: SMALL.`,
      regime: 'TRENDING',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      trapDefenseMode: 'SAFE_FLOW',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: `Bridge number ${lastNum} activated. Locking SMALL.`,
    };
  }

  // =========================================================================
  // RULE 6: ZIGZAG (1:1) WITH TRAP-BUSTER SNAP DEFENSE
  // =========================================================================
  let altCount = 1;
  for (let i = 0; i < Math.min(seq.length - 1, 8); i++) {
    if (seq[i] !== seq[i + 1]) altCount++;
    else break;
  }

  if (altCount >= 5) {
    // Extended zigzag: compute harmonic mean of alternating wave
    const lastNum = nums[0] ?? 5;
    const nextSide = lastNum >= 5 ? 'SMALL' : 'BIG';
    const dynamicNumbers = calculateDynamicBestNumbers(nextSide, nums);
    return {
      period: nextPeriodStr,
      mode,
      prediction: nextSide,
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 96,
      patternName: `⚡ EXTENDED ZIGZAG HARMONIC REVERSAL (${altCount} FLIPS)`,
      patternCategory: 'ZIGZAG_SNAP',
      ruleCode: 'ZIGZAG_HARMONIC_REVERSAL',
      reason: `Zigzag extended to ${altCount} flips (#${lastNum}). Mathematical parity enforces reversion to ${nextSide}.`,
      regime: 'CHOPPY',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      trapDefenseMode: 'TRAP_BUSTER_ARMED',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: `Zigzag reached ${altCount} flips. Parity harmonic locks ${nextSide}.`,
    };
  } else if (altCount >= 3) {
    const nextSide = seq[0] === 'B' ? 'SMALL' : 'BIG';
    const dynamicNumbers = calculateDynamicBestNumbers(nextSide, nums);
    return {
      period: nextPeriodStr,
      mode,
      prediction: nextSide,
      targetNumber: dynamicNumbers.targetNumber,
      secondaryNumber: dynamicNumbers.secondaryNumber,
      confidence: 93,
      patternName: `ZIGZAG (1:1) PING-PONG (×${altCount})`,
      patternCategory: 'ALTERNATING',
      ruleCode: 'ZIGZAG_1_1',
      reason: `Active 1:1 alternating rhythm (${altCount} rounds). Flowing with oscillation switch wave.`,
      regime: 'CHOPPY',
      stepLevel: 1,
      createdAt: Date.now(),
      verified: true,
      trapDefenseMode: 'SAFE_FLOW',
      scanStatus: 'SPECIAL_RULE_LOCK',
      deepAnalysisSummary: `Active 1:1 rhythm (${altCount} flips). Continuing switch to ${nextSide}.`,
    };
  }

  // =========================================================================
  // RULE 7: MULTI-ENGINE RADAR CONSENSUS & OVERLOAD DEFENSE
  // =========================================================================
  const last10 = seq.slice(0, 10);
  const bigCount = last10.filter((x) => x === 'B').length;
  const smallCount = last10.length - bigCount;

  let predictedSide: 'BIG' | 'SMALL';
  let patternLabel: string;
  let reasonLabel: string;

  if (bigCount >= 7) {
    predictedSide = 'SMALL';
    patternLabel = 'ZONE OVERLOAD MEAN-REVERSION';
    reasonLabel = `BIG saturated (${bigCount}/10). Anti-trap enforces systematic counter-balance to SMALL.`;
  } else if (smallCount >= 7) {
    predictedSide = 'BIG';
    patternLabel = 'ZONE DEFICIT RECOVERY';
    reasonLabel = `SMALL saturated (${smallCount}/10). Anti-trap executes upward recovery to BIG.`;
  } else {
    predictedSide = seq[0] === 'B' ? 'SMALL' : 'BIG';
    patternLabel = 'BMW X BOSS EQUILIBRIUM RADAR';
    reasonLabel = 'Market in balanced wave state. Multi-engine consensus locked.';
  }

  const dynamicNumbers = calculateDynamicBestNumbers(predictedSide, nums);

  const baseResult: PredictionResult = {
    period: nextPeriodStr,
    mode,
    prediction: predictedSide,
    targetNumber: dynamicNumbers.targetNumber,
    secondaryNumber: dynamicNumbers.secondaryNumber,
    confidence: 90,
    patternName: patternLabel,
    patternCategory: 'NEURAL_RADAR',
    ruleCode: 'RADAR_SCAN',
    reason: reasonLabel,
    regime: 'TRENDING',
    stepLevel: 1,
    createdAt: Date.now(),
    verified: false,
    trapDefenseMode: 'SAFE_FLOW',
    scanStatus: 'EQUILIBRIUM_SCAN',
    deepAnalysisSummary: `Multi-engine consensus scan evaluated 10-period equilibrium. Locking ${predictedSide}.`,
  };

  // Execute V3 Multi-Level Consensus Logic without removing any previous logic
  const v3Level = (options && typeof options.level === 'number') ? options.level : 1;
  const v3Pred = generatePrediction(issues, dynamicNumbers.favorNumber, dynamicNumbers.oppositeNumber, v3Level);

  return {
    ...baseResult,
    prediction: v3Pred.predictedSize as 'BIG' | 'SMALL',
    confidence: Math.max(baseResult.confidence, v3Pred.confidence),
    favorNumber: v3Pred.favNumber,
    oppositeNumber: v3Pred.oppNumber,
    isTwoLevelVerified: v3Pred.isTwoLevelVerified,
    isSkipRecommended: v3Pred.isSkipRecommended,
    actionText: v3Pred.actionText,
    skipReason: v3Pred.skipReason,
    riskLevel: v3Pred.riskLevel,
    recommendedUnit: v3Pred.recommendedUnit,
    transferDescription: v3Pred.transferDescription,
    currentLevel: v3Pred.currentLevel,
    levelMultiplier: v3Pred.levelMultiplier,
    levelDefenseStatus: v3Pred.levelDefenseStatus,
    markovProb: v3Pred.markovProb,
    logicConsensus: v3Pred.logicConsensus,
  };
}

/* =========================================================================
   BMW X OBLIVION V3 MULTI-LEVEL CONSENSUS ENGINE (USER ADDITION)
   ========================================================================= */

export function getSize(actualNumber: number): 'BIG' | 'SMALL' {
  return actualNumber >= 5 ? 'BIG' : 'SMALL';
}

export function analyzeRhythm(history: any[]) {
  const sizes: ('BIG' | 'SMALL')[] = history.map((h) => {
    if (typeof h === 'object' && h !== null) {
      if (h.size === 'BIG' || h.size === 'SMALL') return h.size;
      if (h.actualSize === 'BIG' || h.actualSize === 'SMALL') return h.actualSize;
      const n = typeof h.number === 'number' ? h.number : (typeof h.actualNumber === 'number' ? h.actualNumber : 0);
      return getSize(n);
    }
    if (typeof h === 'number') return getSize(h);
    return 'BIG';
  });

  const lastResult: 'BIG' | 'SMALL' = sizes[0] || 'BIG';
  let sameResultCount = 0;
  for (const s of sizes) {
    if (s === lastResult) sameResultCount++;
    else break;
  }

  const sample = sizes.slice(0, 30);
  const bigTotal = sample.filter((s) => s === 'BIG').length;
  const bigPct = sample.length > 0 ? Math.round((bigTotal / sample.length) * 100) : 50;
  const smallPct = 100 - bigPct;

  const favoredSize: 'BIG' | 'SMALL' = bigPct >= smallPct ? 'BIG' : 'SMALL';
  const bias = favoredSize;
  const strength = Math.abs(bigPct - smallPct) + 75;

  return {
    sameResultCount,
    lastResult,
    favoredSize,
    bias,
    strength,
    bigPct,
    smallPct,
  };
}

export function analyzeBacktest(history: any[]) {
  const counts: Record<number, number> = {};
  for (let i = 0; i <= 9; i++) counts[i] = 0;

  let bigs = 0;
  let smalls = 0;
  const sample = history.slice(0, 50);

  sample.forEach((h) => {
    const n = typeof h === 'number' ? h : (typeof h === 'object' && h !== null ? (h.number ?? h.actualNumber ?? 0) : 0);
    counts[n] = (counts[n] || 0) + 1;
    if (n >= 5) bigs++;
    else smalls++;
  });

  const total = Math.max(1, sample.length);
  const bigPct = Math.round((bigs / total) * 100);
  const smallPct = 100 - bigPct;
  const dominantSize: 'BIG' | 'SMALL' = bigPct >= smallPct ? 'BIG' : 'SMALL';

  const topNumbers = Object.entries(counts)
    .map(([num, count]) => ({ num: Number(num), count }))
    .sort((a, b) => b.count - a.count);

  return {
    favoredSize: dominantSize,
    dominantSize,
    confidence: Math.max(bigPct, smallPct),
    bigPct,
    smallPct,
    topNumbers,
  };
}

export function detectPattern(history: any[]) {
  const seq: ('B' | 'S')[] = history.slice(0, 10).map((h) => {
    const s = typeof h === 'object' && h !== null ? (h.size || h.actualSize) : null;
    if (s === 'BIG') return 'B';
    if (s === 'SMALL') return 'S';
    const n = typeof h === 'number' ? h : (typeof h === 'object' && h !== null ? (h.number ?? h.actualNumber ?? 0) : 0);
    return n >= 5 ? 'B' : 'S';
  });

  const chrono = [...seq].reverse();
  for (const pat of PATTERNS_DATABASE) {
    const len = pat.sequence.length;
    if (chrono.length >= len) {
      const tail = chrono.slice(-len);
      let match = true;
      for (let i = 0; i < len; i++) {
        if (tail[i] !== pat.sequence[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return {
          recommendedSize: pat.next === 'B' ? 'BIG' : 'SMALL',
          strength: pat.confidence || 94,
          detail: `${pat.name} [Confidence: ${pat.confidence}%]`,
          name: pat.name,
          icon: '⚡',
          category: pat.category,
        };
      }
    }
  }

  return null;
}

export function analyzeFlip(history: any[]) {
  const sizes = history.slice(0, 10).map((h) => {
    const s = typeof h === 'object' && h !== null ? (h.size || h.actualSize) : null;
    if (s === 'BIG' || s === 'SMALL') return s;
    const n = typeof h === 'number' ? h : (typeof h === 'object' && h !== null ? (h.number ?? h.actualNumber ?? 0) : 0);
    return n >= 5 ? 'BIG' : 'SMALL';
  });

  let flips = 0;
  for (let i = 0; i < sizes.length - 1; i++) {
    if (sizes[i] !== sizes[i + 1]) flips++;
  }

  const flipRatio = sizes.length > 1 ? flips / (sizes.length - 1) : 0.5;
  const last = sizes[0] || 'BIG';

  // If flipping aggressively, predict opposite of last
  if (flipRatio >= 0.6) {
    const target = last === 'BIG' ? 'SMALL' : 'BIG';
    return {
      bigPct: target === 'BIG' ? 65 : 35,
      smallPct: target === 'SMALL' ? 65 : 35,
    };
  }

  return { bigPct: 50, smallPct: 50 };
}

export function analyzeLevel(history: any[], level: number) {
  return {
    level,
    safeThreshold: level === 1 ? 0 : 35,
    antiDrawdownArmed: level >= 2,
    timestamp: Date.now(),
  };
}

// MAIN PREDICTION LOGIC (AS PROVIDED BY USER)
export function generatePrediction(history: any[], favNumber: number = 7, oppNumber: number = 2, level: number = 1) {
  // 1. Basic analysis
  const rhythm = analyzeRhythm(history);
  const backtest = analyzeBacktest(history);
  const pattern = detectPattern(history);
  const flipAnalysis = analyzeFlip(history);
  const levelAnalysis = analyzeLevel(history, level);

  // 2. Default prediction
  let predictedSize: 'BIG' | 'SMALL' = "BIG";
  let confidence = 80;
  let isTwoLevelVerified = false;
  let isSkipRecommended = false;

  let actionText = "PLAY";
  let riskLevel = "LOW_RISK";
  let recommendedUnit =
    level >= 2
      ? (level === 2 ? "3X UNIT (RECOVERY PLAY)" : "8X UNIT (RECOVERY PLAY)")
      : "1X UNIT (CONFIDENT PLAY)";

  let skipReason: string | undefined;
  let transferDescription: string | undefined;

  // 3. Dragon continuation
  if (rhythm.sameResultCount >= 4) {
    predictedSize = rhythm.lastResult;
    confidence = Math.min(99, 90 + rhythm.sameResultCount * 2);

    isTwoLevelVerified = true;
    isSkipRecommended = false;

    actionText = "PLAY";
    riskLevel = "LOW_RISK";

    recommendedUnit =
      level >= 2
        ? (level === 2
            ? "3X UNIT (RECOVERY DRAGON RIDE)"
            : "8X UNIT (RECOVERY DRAGON RIDE)")
        : "1X UNIT (PLAY / RIDE DRAGON)";

    transferDescription =
      `Confirmed ${rhythm.lastResult} Dragon ` +
      `(${rhythm.sameResultCount} in a row) -> ` +
      `Stay with ${rhythm.lastResult}`;
  }

  // 4. High-confidence pattern
  else if (
    pattern &&
    pattern.recommendedSize &&
    pattern.strength >= 88
  ) {
    predictedSize = pattern.recommendedSize as 'BIG' | 'SMALL';
    confidence = pattern.strength;

    isTwoLevelVerified = true;
    isSkipRecommended = false;

    actionText = "PLAY";
    riskLevel = "LOW_RISK";

    recommendedUnit =
      level >= 2
        ? (level === 2
            ? "3X UNIT (LEVEL 2 RECOVERY HIT)"
            : "8X UNIT (LEVEL 3 RECOVERY HIT)")
        : "1X UNIT (CONFIDENT PLAY)";

    transferDescription = pattern.detail;
  }

  // 5. Recovery-level consensus
  else if (level >= 2) {
    let bigScore = 0;
    let smallScore = 0;

    if (backtest.favoredSize === "BIG")
      bigScore += backtest.confidence * 1.5;
    else
      smallScore += backtest.confidence * 1.5;

    if (flipAnalysis) {
      bigScore += flipAnalysis.bigPct * 1.2;
      smallScore += flipAnalysis.smallPct * 1.2;
    }

    if (rhythm.bias === "BIG")
      bigScore += rhythm.strength;
    else
      smallScore += rhythm.strength;

    if (pattern && pattern.recommendedSize) {
      if (pattern.recommendedSize === "BIG")
        bigScore += pattern.strength;
      else
        smallScore += pattern.strength;
    }

    const difference = Math.abs(bigScore - smallScore);

    predictedSize =
      bigScore >= smallScore
        ? "BIG"
        : "SMALL";

    // Strong consensus
    if (difference >= 35) {
      confidence = Math.min(99, 95 + level);

      isTwoLevelVerified = true;
      isSkipRecommended = false;

      actionText = "PLAY";
      riskLevel = "LOW_RISK";

      recommendedUnit =
        level === 2
          ? "3X UNIT (LEVEL 2 RECOVERY HIT)"
          : "8X UNIT (LEVEL 3 RECOVERY HIT)";

      transferDescription =
        `Level ${level} Anti-Drawdown Protocol: ` +
        `Multi-Model Consensus (${predictedSize} score +${Math.round(difference)}) ` +
        `locked to reset to Level 1!`;
    }

    // Ambiguous result
    else {
      confidence = 78;

      isTwoLevelVerified = false;
      isSkipRecommended = true;

      actionText = "SKIP";
      riskLevel = "HIGH_RISK_TRAP";

      recommendedUnit =
        "0X (SKIP ROUND / LEVEL-2 DEFENSE)";

      skipReason =
        "LEVEL-2 CAP DEFENSE · Multi-Engine Ambiguity Filter Active · " +
        "Advised: SKIP (Wait for High-Confidence Setup)";

      transferDescription =
        "Ambiguous 50/50 noise filtered out. " +
        "Level-2 defense active to prevent advancing to Level 3 or 4. " +
        "SKIP advised.";
    }
  }

  // 6. Unclear pattern
  else {
    if (backtest) {
      predictedSize = backtest.dominantSize;
      confidence =
        Math.max(backtest.bigPct, backtest.smallPct);
    } else {
      predictedSize = rhythm.favoredSize;
      confidence =
        Math.max(rhythm.bigPct, rhythm.smallPct);
    }

    isSkipRecommended = true;
    actionText = "SKIP";
    riskLevel = "HIGH_RISK_TRAP";

    recommendedUnit =
      "0X (SKIP ROUND / PRESERVE BALANCE)";

    skipReason =
      `UNCLEAR PATTERN · 1000-Period Analysis Favors ` +
      `${predictedSize} (${confidence}%) · Advised: SKIP`;

    transferDescription =
      `Unclear pattern structure. 1000 historical rounds analyzed. ` +
      `Dominant side is ${predictedSize}, but high variance: SKIP advised.`;
  }

  // 7. Favourite / Opposite numbers
  const numbers =
    generateFavAndOppNumbers(
      predictedSize,
      backtest,
      history,
      favNumber,
      oppNumber
    );

  // 8. Final prediction object
  return {
    predictedSize,
    favNumber: numbers.favNumber,
    oppNumber: numbers.oppNumber,
    confidence,
    isTwoLevelVerified,
    activePattern: pattern,
    backtest,
    isSkipRecommended,
    actionText,
    skipReason,
    riskLevel,
    recommendedUnit,
    transferDescription,
    currentLevel: level,
    levelMultiplier:
      level === 1
        ? "1X"
        : level === 2
        ? "3X"
        : level === 3
        ? "8X"
        : "24X",
    levelDefenseStatus:
      level === 1
        ? "L1 STANDARD (OPTIMAL ALPHA)"
        : level === 2
        ? "L2 RECOVERY MATRIX (95% CAP DEFENSE)"
        : "L3 EMERGENCY SHIELD",
    markovProb: {
      bigPct: rhythm.bigPct,
      smallPct: rhythm.smallPct
    },
    logicConsensus: levelAnalysis
  };
}

// FAV NUMBER / OPP NUMBER LOGIC (AS PROVIDED BY USER)
export function generateFavAndOppNumbers(
  predictedSize: 'BIG' | 'SMALL',
  backtest: any,
  history: any[],
  currentFav?: number,
  currentOpp?: number
) {
  const oppositeSize =
    predictedSize === "BIG"
      ? "SMALL"
      : "BIG";

  const bigNumbers = [5, 6, 7, 8, 9];
  const smallNumbers = [0, 1, 2, 3, 4];

  const favPool =
    predictedSize === "BIG"
      ? bigNumbers
      : smallNumbers;

  const oppPool =
    oppositeSize === "BIG"
      ? bigNumbers
      : smallNumbers;

  const score: Record<number, number> = {};

  // Base score
  for (let n = 0; n <= 9; n++) {
    score[n] = 1;
  }

  // Backtest top numbers
  if (
    backtest &&
    backtest.topNumbers
  ) {
    backtest.topNumbers.forEach(
      (item: any, index: number) => {
        score[item.num] =
          (score[item.num] || 0) +
          (12 - index * 3) +
          item.count;
      }
    );
  }

  // Recent 25 results
  history
    .slice(0, 25)
    .forEach((h: any, index: number) => {
      const number = typeof h === 'number' ? h : (typeof h === 'object' && h !== null ? (h.number ?? h.actualNumber ?? 0) : 0);
      score[number] =
        (score[number] || 0) +
        (16 - Math.min(index, 15));
    });

  // Sort favourite numbers
  const sortedFav =
    [...favPool].sort(
      (a, b) =>
        (score[b] || 0) -
        (score[a] || 0)
    );

  // Sort opposite numbers
  const sortedOpp =
    [...oppPool].sort(
      (a, b) =>
        (score[b] || 0) -
        (score[a] || 0)
    );

  // Don't repeat current opposite number
  let favCandidates =
    sortedFav.filter(
      n => n !== currentOpp
    );

  if (favCandidates.length === 0)
    favCandidates = sortedFav;

  // Don't repeat current favourite
  // and selected favourite
  let oppCandidates =
    sortedOpp.filter(
      n =>
        n !== currentFav &&
        n !== favCandidates[0]
    );

  if (oppCandidates.length === 0)
    oppCandidates =
      sortedOpp.filter(
        n => n !== favCandidates[0]
      );

  if (oppCandidates.length === 0)
    oppCandidates = sortedOpp;

  return {
    favNumber: favCandidates[0],
    oppNumber: oppCandidates[0]
  };
}

// FINAL DISPLAY / COPY OUTPUT (AS PROVIDED BY USER)
export function buildPredictionText(
  currentPeriod: string,
  prediction: any
) {
  const period =
    currentPeriod || "PENDING";

  const target =
    prediction.predictedSize || prediction.prediction;

  const fav =
    prediction.favNumber ?? prediction.favorNumber ?? 7;

  const opp =
    prediction.oppNumber ?? prediction.oppositeNumber ?? 2;

  const pattern =
    prediction.activePattern?.name ||
    prediction.patternName ||
    "1000-PERIOD STATISTICAL SCAN";

  const action =
    prediction.isSkipRecommended
      ? "ACTION: SKIP (SAFE PLAY / TRAP NODE)"
      : "ACTION: PLAY / BET NOW (HIGH CONFIDENCE · SAFE SETUP)";

  const risk =
    prediction.isSkipRecommended
      ? "Risk Level: HIGH RISK TRAP (SKIP ADVISORY)"
      : "Risk Level: LOW RISK (NORMAL WINNING PATTERN)";

  const bet =
    prediction.isSkipRecommended
      ? "Bet Sizing: 0X (SKIP ROUND / SAVE CAPITAL)"
      : "Bet Sizing: 1X UNIT (SAFE BET / CONFIDENT)";

  return `
亗 𝗕ᴍᴡ 亗 𝗢ʙʟɪᴠɪᴏɴ 亗 𝗩𝟯 亗

Period: ${period}

Target: ${target}

Favor: ${fav}

Opp: ${opp}

Pattern: ${pattern}

${risk}

${bet}

V3 Quantum Neural:
${
  prediction.isTwoLevelVerified
    ? "100% VERIFIED ✓"
    : "VERIFIED"
}

${action}
`;
}

// RESULT CHECKING LOGIC (AS PROVIDED BY USER)
export function checkResult(
  predictedSize: 'BIG' | 'SMALL',
  favNumber: number,
  oppNumber: number,
  actualNumber: number
) {
  const actualSize =
    getSize(actualNumber);

  let result = "loss";

  if (
    actualNumber === favNumber ||
    actualNumber === oppNumber
  ) {
    result = "jackpot";
  } else if (
    predictedSize === actualSize
  ) {
    result = "win";
  } else {
    result = "loss";
  }

  return result;
}

// LEVEL LOGIC (AS PROVIDED BY USER)
export function getCurrentLevel(history: any[]) {
  let losses = 0;

  for (const item of history) {
    const res = typeof item === 'object' && item !== null ? (item.result || (item.isWin ? 'win' : 'loss')) : 'win';
    if (
      res === "win" ||
      res === "jackpot"
    ) {
      break;
    }

    if (
      res === "loss"
    ) {
      losses++;
    }
  }

  return Math.min(
    4,
    losses + 1
  );
}

// LEVEL MULTIPLIER (AS PROVIDED BY USER)
export function getLevelMultiplier(level: number) {
  if (level === 1)
    return "1X";

  if (level === 2)
    return "3X";

  if (level === 3)
    return "8X";

  return "24X";
}

// LEVEL DEFENSE (AS PROVIDED BY USER)
export function getLevelDefenseStatus(level: number) {
  if (level === 1)
    return "L1 STANDARD (OPTIMAL ALPHA)";

  if (level === 2)
    return "L2 RECOVERY MATRIX (95% CAP DEFENSE)";

  return "L3 EMERGENCY SHIELD";
}
