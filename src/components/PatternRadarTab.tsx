import React, { useState, useMemo } from 'react';
import { PATTERNS_DATABASE } from '../utils/patternEngine';
import { HistoryIssue, PredictionResult } from '../types';
import { DragonAuraIcon, TrapShieldIcon, RadarPulseIcon, ZapEnergyIcon } from './CustomIcons';
import { Sparkles, Search } from 'lucide-react';

interface PatternRadarTabProps {
  prediction: PredictionResult | null;
  recentIssues: HistoryIssue[];
}

export const PatternRadarTab: React.FC<PatternRadarTabProps> = ({ prediction, recentIssues }) => {
  const currentSeq = recentIssues.slice(0, 10).map((x) => (x.number >= 5 ? 'B' : 'S'));

  const specialRules = [
    {
      name: '🛡️ B-SS-B ANTI-TRAP & TWIST SUITE',
      code: 'BSSB_TWIST_SUITE',
      desc: 'B-SS-B / S-BB-S trap buster: predicts Small on B-SS-B, tracks Twist on B-SS-BB, and handles 2-Small bounce.',
      category: 'SPECIAL_SEQUENCE',
      isActive:
        prediction?.ruleCode?.includes('BSSB') ||
        prediction?.ruleCode?.includes('SBBS') ||
        prediction?.ruleCode?.includes('TWIST_PATTERN'),
    },
    {
      name: '📊 10-RESULT MACRO EVALUATION (STREAK 3)',
      code: 'MACRO_10_EVAL',
      desc: 'Evaluates entire 10-period window on 3-streak (BBB/SSS) to match 3:3 mirror, oscillation density, or momentum ride.',
      category: 'SPECIAL_SEQUENCE',
      isActive: prediction?.ruleCode?.startsWith('MACRO_10_'),
    },
    {
      name: '⚖️ 1:3 INCLINE PIVOT (S-BBB ➔ S / B-SSS ➔ B)',
      code: 'INCLINE_1_3',
      desc: '1 opposite result followed by exactly 3 of the same side. Locks pivot transition back to opposite.',
      category: 'SPECIAL_SEQUENCE',
      isActive: prediction?.ruleCode?.startsWith('INCLINE_1_3_'),
    },
    {
      name: '🐉 DRAGON UNDISTURBED LOCK (4+ LIVE)',
      code: 'DRAGON_LOCK',
      desc: '4+ consecutive same-side results. Pure Dragon Policy: Never disturbs live dragon. Rides streak unbroken.',
      category: 'DRAGON',
      isActive: prediction?.isDragonActive && (prediction?.dragonStreak ?? 0) >= 4,
    },
    {
      name: '⚖️ 3:3 MIRROR DUAL WING (TRIPLE-TRIPLE)',
      code: 'MIRROR_3_3_TRANSITION',
      desc: '3-Round streak interrupted by opposite outcome. Deep scan locks 3:3 mirror transition leg 2.',
      category: 'MIRROR',
      isActive: prediction?.ruleCode === 'MIRROR_3_3_TRANSITION',
    },
    {
      name: '🔄 DRAGON RETURN (FAKEOUT)',
      code: 'DRAGON_RETURN_FAKEOUT',
      desc: 'Catches single-round dragon disruption fakeout (e.g. B-B-B-S-B). Re-rides original dragon.',
      category: 'ANTI_TRAP',
      isActive: prediction?.ruleCode === 'DRAGON_RETURN_FAKEOUT',
    },
    {
      name: 'ZIGZAG (1:1) PING-PONG',
      code: 'ZIGZAG_1_1',
      desc: 'Alternating sequence B-S-B-S. Reversal oscillation follow-up.',
      category: 'OSCILLATION',
      isActive: prediction?.ruleCode === 'ZIGZAG_1_1',
    },
    {
      name: '⚡ ZIGZAG SNAP DEFENSE',
      code: 'ZIGZAG_SNAP_BYPASS',
      desc: 'Anti-trap detects 5+ flip exhaustion. Avoids 1:1 trap by predicting twin breakout.',
      category: 'ANTI_TRAP',
      isActive: prediction?.ruleCode === 'ZIGZAG_SNAP_BYPASS',
    },
    {
      name: 'TWINS (2:2) DOUBLE PAIR',
      code: 'TWINS_2_2',
      desc: 'BB-SS-BB or SS-BB-SS pairing cycles with companion completion.',
      category: 'CYCLIC',
      isActive: prediction?.ruleCode?.includes('TWINS_2_2'),
    },
    {
      name: '(2:1:2) DUAL WING PATTERN',
      code: 'PATTERN_2_1_2',
      desc: 'BB-S-BB or SS-B-SS symmetrical bridge with inflection turning point.',
      category: 'SYMMETRIC',
      isActive: prediction?.ruleCode === 'PATTERN_2_1_2',
    },
    {
      name: 'SBB ➔ S CONTINUATION',
      code: 'SBB_TO_S',
      desc: 'Chrono S-B-B sequence triggers systematic transition to SMALL.',
      category: 'REVERSAL',
      isActive: prediction?.ruleCode === 'SBB_TO_S',
    },
    {
      name: 'BSS ➔ B CONTINUATION',
      code: 'BSS_TO_B',
      desc: 'Chrono B-S-S sequence triggers systematic recovery to BIG.',
      category: 'REVERSAL',
      isActive: prediction?.ruleCode === 'BSS_TO_B',
    },
    {
      name: 'RULE 1: 5-REPEAT BIGG TRIGGER',
      code: 'RULE_1_REPEAT_5',
      desc: 'Two consecutive 5s (5 -> 5) enforce continuous strong BIGG momentum.',
      category: 'SPECIAL_TRIGGER',
      isActive: prediction?.ruleCode === 'RULE_1_REPEAT_5',
    },
    {
      name: 'RULE 2: 4-REPEAT SMALL TRIGGER',
      code: 'RULE_2_REPEAT_4',
      desc: 'Two consecutive 4s (4 -> 4) enforce continuous deep SMALL trend.',
      category: 'SPECIAL_TRIGGER',
      isActive: prediction?.ruleCode === 'RULE_2_REPEAT_4',
    },
    {
      name: 'RULE 3: TRANSITION BRIDGE (4/6)',
      code: 'RULE_3_BRIDGE_4_6',
      desc: 'Number 4 or 6 stabilization wave initiates 2 consecutive SMALL turns.',
      category: 'SPECIAL_TRIGGER',
      isActive: prediction?.ruleCode === 'RULE_3_BRIDGE_4_6',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Current Trend Stream Matrix with Anti-Trap Telemetry */}
      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 shadow">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-orbitron font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <RadarPulseIcon className="w-3.5 h-3.5 text-cyan-400" />
            LIVE DRAW STREAM (LATEST FIRST)
          </span>
          <div className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <TrapShieldIcon className="w-3 h-3 text-emerald-400" />
            <span>TRAP-BUSTER ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {currentSeq.map((side, idx) => (
            <div
              key={idx}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-orbitron font-black text-xs shrink-0 shadow-sm ${
                side === 'B'
                  ? 'bg-amber-500/20 border border-amber-400/60 text-amber-300'
                  : 'bg-cyan-500/20 border border-cyan-400/60 text-cyan-300'
              }`}
            >
              {side}
            </div>
          ))}
        </div>
      </div>

      {/* Special Rule & Pattern Cards - Compact */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-orbitron font-black tracking-wider text-amber-300 uppercase flex items-center gap-1">
            <ZapEnergyIcon className="w-3.5 h-3.5" />
            CORE RULEBOOK & DRAGON PATTERNS
          </span>
          <span className="text-[9px] font-mono text-slate-400">ANTI-TRAP MATRIX</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {specialRules.map((rule) => (
            <div
              key={rule.code}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                rule.isActive
                  ? 'bg-gradient-to-r from-amber-500/25 to-violet-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)] ring-1 ring-amber-400'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-orbitron font-black text-[11px] text-white flex items-center gap-1">
                  {rule.isActive && <Sparkles className="w-3 h-3 text-amber-400 animate-spin-slow" />}
                  {rule.name}
                </span>
                <span
                  className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase ${
                    rule.isActive ? 'bg-amber-400 text-black' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {rule.isActive ? 'LOCKED' : rule.category}
                </span>
              </div>
              <p className="text-[10px] font-rajdhani text-slate-300 leading-snug">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Database 220+ Color Trading Pattern Catalog */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-white/10 pb-2">
          <div>
            <span className="font-orbitron font-black text-xs text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
              <ZapEnergyIcon className="w-4 h-4 text-amber-400" />
              220+ COLOR TRADING HEURISTICS MATRIX ({PATTERNS_DATABASE.length} PATTERNS)
            </span>
            <p className="text-[9.5px] font-rajdhani text-slate-400">
              Exhaustive mathematical pattern catalog loaded: Dragons, Zigzags, Mirrors, Staircases & Twist Busters.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-mono text-emerald-300 font-bold">
              235 LOGICS ARMED
            </span>
          </div>
        </div>

        {/* Filter Categories and Search Input */}
        <PatternDatabaseCatalog prediction={prediction} />
      </div>
    </div>
  );
};

interface PatternDatabaseCatalogProps {
  prediction: PredictionResult | null;
}

const PatternDatabaseCatalog: React.FC<PatternDatabaseCatalogProps> = ({ prediction }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'ALL (235)' },
    { id: 'DRAGON', label: 'DRAGON (25)' },
    { id: 'ZIGZAG', label: 'ZIGZAG (35)' },
    { id: 'MIRROR', label: 'MIRROR (40)' },
    { id: 'STAIRCASE', label: 'STAIRCASE (40)' },
    { id: 'TWIST', label: 'TWIST (40)' },
    { id: 'FIBONACCI', label: 'FIBONACCI (30)' },
    { id: 'MACRO_PARITY', label: 'PARITY (25)' },
  ];

  const filteredPatterns = useMemo(() => {
    return PATTERNS_DATABASE.filter((pat) => {
      const matchesCat = selectedCategory === 'ALL' || pat.category === selectedCategory;
      const matchesSearch =
        searchTerm === '' ||
        pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pat.sequence.join('-').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="space-y-2">
      {/* Category Pills & Search Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 235 patterns (e.g. BSSB, Dragon, Mirror, Staircase)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-white placeholder-slate-500 font-mono focus:border-amber-400/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Category horizontal scrolling bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-2 py-0.5 rounded-lg text-[8.5px] font-orbitron font-bold tracking-wider whitespace-nowrap transition ${
              selectedCategory === c.id
                ? 'bg-amber-400 text-black shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredPatterns.map((p) => {
          const isMatched = prediction?.ruleCode === p.id;
          return (
            <div
              key={p.id}
              className={`p-2 rounded-xl border flex items-center justify-between text-[11px] font-mono transition ${
                isMatched
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/60'
                  : 'bg-black/35 border-white/5 text-slate-400 hover:border-white/15'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[9.5px] text-slate-200 truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-1 text-[8.5px] text-slate-500 mt-0.5">
                  <span className="text-slate-400">Seq: {p.sequence.slice(-6).join('-')}</span>
                  <span>•</span>
                  <span>
                    Next: <strong className={p.next === 'B' ? 'text-amber-300' : 'text-cyan-300'}>{p.next === 'B' ? 'BIG' : 'SMALL'}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400">{p.confidence}%</span>
                </div>
              </div>

              {isMatched ? (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black font-orbitron text-[8px] font-black shrink-0 animate-pulse">
                  ACTIVE MATCH
                </span>
              ) : (
                <span className="text-[7.5px] font-mono font-bold text-slate-500 bg-white/5 px-1.5 py-0.2 rounded shrink-0">
                  {p.id}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
