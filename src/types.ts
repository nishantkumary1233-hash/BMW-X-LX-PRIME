export type GameCycle = '1m';

export interface HistoryIssue {
  issue: string;
  number: number;
  size: 'BIG' | 'SMALL';
  color: 'RED' | 'GREEN' | 'VIOLET';
  timestamp?: number;
}

export interface PredictionResult {
  period: string;
  mode: GameCycle;
  prediction: 'BIG' | 'SMALL';
  targetNumber: number;
  secondaryNumber: number;
  favorNumber?: number;
  oppositeNumber?: number;
  confidence: number;
  patternName: string;
  patternCategory: string;
  ruleCode: string;
  reason: string;
  regime: 'TRENDING' | 'CHOPPY' | 'DRAGON' | 'CYCLIC' | 'REVERSAL' | 'NEUTRAL';
  stepLevel: number;
  createdAt: number;
  verified: boolean;
  dragonStreak?: number;
  isDragonActive?: boolean;
  dragonSide?: 'BIG' | 'SMALL';
  trapDefenseMode?: 'TRAP_BUSTER_ARMED' | 'FAKEOUT_BYPASS' | 'EXHAUSTION_SHIELD' | 'DRAGON_LOCK' | 'SAFE_FLOW';
  scanStatus?: 'DRAGON_LOCK' | 'DRAGON_BREAK_DEEP_SCAN' | 'PATTERN_MATCH_LOCK' | 'SPECIAL_RULE_LOCK' | 'EQUILIBRIUM_SCAN';
  deepAnalysisSummary?: string;

  // V3 Multi-Level Consensus & Defense Protocol properties
  isTwoLevelVerified?: boolean;
  isSkipRecommended?: boolean;
  actionText?: string;
  skipReason?: string;
  riskLevel?: string;
  recommendedUnit?: string;
  transferDescription?: string;
  currentLevel?: number;
  levelMultiplier?: string;
  levelDefenseStatus?: string;
  markovProb?: {
    bigPct: number;
    smallPct: number;
  };
  logicConsensus?: any;
}

export interface HistoryRecord {
  id: string;
  period: string;
  mode: GameCycle;
  prediction: 'BIG' | 'SMALL';
  targetNumber: number;
  secondaryNumber: number;
  favorNumber?: number;
  oppositeNumber?: number;
  actualNumber: number;
  actualSize: 'BIG' | 'SMALL';
  actualColor: string;
  pattern: string;
  confidence: number;
  isWin: boolean;
  isJackpot: boolean;
  jackpotMatchedType?: 'FAVOR' | 'OPPOSITE' | null;
  timestamp: number;
}

export interface TargetChaseState {
  wallet: number;
  targetProfit: number;
  baseBalance: number;
  currentProfit: number;
  currentLevel: number;
  levels: number[];
  totalLevelCount?: 3 | 4;
  active: boolean;
  completed: boolean;
  paused: boolean;
  lostLevels: number[];
}

export type ThemeName = 'gold' | 'emerald' | 'crimson' | 'ocean' | 'violet';
