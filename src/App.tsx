import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { HistoryIssue, PredictionResult, HistoryRecord, TargetChaseState, ThemeName } from './types';
import { fetchLiveWingoIssues, computeNextPeriod } from './utils/apiService';
import { analyzePatternSequence } from './utils/patternEngine';
import { computeTargetLevels } from './utils/targetChaseEngine';
import { syncCorpus1000 } from './utils/backtestEngine';
import { preloadBallImages } from './constants/ballImages';
import { sounds } from './utils/soundEffects';

import { Navbar } from './components/Navbar';
import { Ticker } from './components/Ticker';
import { PredictorCard } from './components/PredictorCard';
import { TargetChaseTab } from './components/TargetChaseTab';
import { PatternRadarTab } from './components/PatternRadarTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsTab } from './components/SettingsTab';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { ThemeModal } from './components/ThemeModal';
import { WinModal } from './components/WinModal';
import { JackpotModal } from './components/JackpotModal';
import { FloatingGameRunner } from './components/FloatingGameRunner';
import { LoginGate } from './components/LoginGate';
import { checkDeviceAuthorizationStatus } from './utils/licenseSecurity';

export default function App() {
  // Authorization Gate State - Checks Valid Active Hardware Device Authorization
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const status = checkDeviceAuthorizationStatus();
    return !status.authorized;
  });

  // Cycle locked strictly to WinGo 1M
  const currentCycle = '1m';
  const cycleDuration = 60; // 60 seconds per draw

  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<ActiveTab>('command');
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('gold');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Stream & Timing State
  const [issues, setIssues] = useState<HistoryIssue[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [isAnalysing, setIsAnalysing] = useState(false);

  // Prediction State
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const lastProcessedIssueRef = useRef<string>('');

  // History State
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bmwx_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Regular Win Modal State
  const [winModalState, setWinModalState] = useState<{
    isOpen: boolean;
    period: string;
    prediction: string;
    predictedNumber: number;
    actualNumber: number;
    actualSize: string;
    isJackpot: boolean;
  }>({
    isOpen: false,
    period: '',
    prediction: '',
    predictedNumber: 0,
    actualNumber: 0,
    actualSize: '',
    isJackpot: false,
  });

  // Dedicated Mega Jackpot Modal State
  const [jackpotModalState, setJackpotModalState] = useState<{
    isOpen: boolean;
    period: string;
    prediction: string;
    predictedNumber: number;
    actualNumber: number;
    actualSize: string;
    matchedType?: 'FAVOR' | 'OPPOSITE' | null;
  }>({
    isOpen: false,
    period: '',
    prediction: '',
    predictedNumber: 0,
    actualNumber: 0,
    actualSize: '',
    matchedType: null,
  });

  // Track emergency penalization state on loss for 1,000-draw recovery
  const lastLossRef = useRef<{ wasLoss: boolean; failedSide?: 'BIG' | 'SMALL' }>({ wasLoss: false });

  // Target Chase State
  const [chaseState, setChaseState] = useState<TargetChaseState>(() => {
    try {
      const saved = localStorage.getItem('bmwx_chase');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      wallet: 1000,
      targetProfit: 200,
      baseBalance: 1000,
      currentProfit: 0,
      currentLevel: 1,
      levels: computeTargetLevels(1000, 4),
      totalLevelCount: 4,
      active: false,
      completed: false,
      paused: false,
      lostLevels: [],
    };
  });

  // Preload ball images on mount
  useEffect(() => {
    preloadBallImages();
  }, []);

  // Real-time device authorization expiration & status enforcer (runs every 3 seconds)
  useEffect(() => {
    const checkLicenseValidity = () => {
      const status = checkDeviceAuthorizationStatus();
      if (!status.authorized) {
        setIsLocked(true);
      }
    };

    checkLicenseValidity();
    const interval = setInterval(checkLicenseValidity, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync theme to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Persist history and target chase
  useEffect(() => {
    try {
      localStorage.setItem('bmwx_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('bmwx_chase', JSON.stringify(chaseState));
    } catch {}
  }, [chaseState]);

  // Unlock callback
  const handleUnlock = () => {
    setIsLocked(false);
    try {
      localStorage.setItem('bmwx_unlocked', 'true');
    } catch {}
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  // Fetch and sync WinGo 1M data
  const loadData = useCallback(async () => {
    try {
      const fetched = await fetchLiveWingoIssues('1m');
      if (fetched && fetched.length > 0) {
        setIssues(fetched);
        setIsLive(true);
        syncCorpus1000(fetched);
      }
    } catch {
      setIsLive(false);
    }
  }, []);

  // Polling loop
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Real-time 60-second countdown clock for WinGo 1M
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const sec = now.getSeconds();
      const rem = 60 - sec;
      setSecondsRemaining(rem === 0 ? 60 : rem);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Result verification and prediction generation
  useEffect(() => {
    if (!issues || issues.length === 0) return;

    const latest = issues[0];
    const latestIssue = latest.issue;

    // Check if new draw appeared and settle prior prediction
    if (lastProcessedIssueRef.current !== '' && lastProcessedIssueRef.current !== latestIssue) {
      if (prediction && prediction.period === latestIssue) {
        const actualNum = latest.number;
        const actualSize = latest.size;

        // Favor & Opposite Ball Jackpot Verification
        // "donon mein se koi bhi number actual result ke sath match karne per Jackpot likhega"
        const favorBall = prediction.favorNumber ?? prediction.targetNumber;
        const oppBall = prediction.oppositeNumber ?? prediction.secondaryNumber;
        const isFavorMatch = actualNum === favorBall;
        const isOppositeMatch = actualNum === oppBall;
        const isJackpot = isFavorMatch || isOppositeMatch;
        const jackpotMatchedType: 'FAVOR' | 'OPPOSITE' | null = isFavorMatch
          ? 'FAVOR'
          : isOppositeMatch
          ? 'OPPOSITE'
          : null;

        // "opposite number Jackpot hit hota hai to yah loss mein account karta hai to loss mein nahin usko Jackpot ke sath Vin mein account Karega"
        // A direct size match OR any Jackpot ball match (Favor or Opposite) is an absolute WIN!
        const isSizeWin = actualSize === prediction.prediction;
        const isWin = isSizeWin || isJackpot;

        // Record in History
        const newRecord: HistoryRecord = {
          id: `${latestIssue}-${Date.now()}`,
          period: latestIssue,
          mode: '1m',
          prediction: prediction.prediction,
          targetNumber: favorBall,
          secondaryNumber: oppBall,
          favorNumber: favorBall,
          oppositeNumber: oppBall,
          actualNumber: actualNum,
          actualSize,
          actualColor: latest.color,
          pattern: prediction.patternName,
          confidence: prediction.confidence,
          isWin,
          isJackpot,
          jackpotMatchedType,
          timestamp: Date.now(),
        };

        setHistory((prev) => [newRecord, ...prev.slice(0, 150)]);

        // Emergency loss penalization tracking for 1,000-draw background backtest recovery
        if (!isWin) {
          lastLossRef.current = { wasLoss: true, failedSide: prediction.prediction };
        } else {
          lastLossRef.current = { wasLoss: false };
        }

        // Target Chase progression
        if (chaseState.active && !chaseState.completed) {
          const currentBet = chaseState.levels[chaseState.currentLevel - 1] || 10;
          let newWallet = chaseState.wallet - currentBet;

          if (isWin) {
            const winMultiplier = isJackpot ? 9.82 : 1.96;
            newWallet += Math.round(currentBet * winMultiplier);
            const newProfit = Math.round(newWallet - chaseState.baseBalance);

            if (newProfit >= chaseState.targetProfit) {
              setChaseState((prev) => ({
                ...prev,
                wallet: newWallet,
                currentProfit: newProfit,
                completed: true,
                active: false,
              }));
            } else {
              // ON WIN: "aur agar Mera profit hote Gaya to iska Jo amount hai beta amount vah badhta Chala jaega usi mein jaldi target complete hoga"
              // Re-scale the 3-4 levels with the new higher bankroll so bets grow as profits accumulate!
              const levelCount = (chaseState.totalLevelCount || chaseState.levels.length || 4) as 3 | 4;
              const scaledLevels = computeTargetLevels(newWallet, levelCount);

              setChaseState((prev) => ({
                ...prev,
                wallet: newWallet,
                currentProfit: newProfit,
                currentLevel: 1,
                lostLevels: [],
                levels: scaledLevels,
              }));
            }
          } else {
            // ON LOSS: "aur agar loss hoga to jo pahle wala amount check ke hisab se level tha vahi level ke hisab se show Karega"
            // Advances to next level but strictly preserves the exact established ladder!
            const nextLevel = chaseState.currentLevel + 1;
            const newLost = [...chaseState.lostLevels, chaseState.currentLevel];
            const newProfit = Math.round(newWallet - chaseState.baseBalance);

            if (nextLevel > chaseState.levels.length) {
              setChaseState((prev) => ({
                ...prev,
                wallet: newWallet,
                currentProfit: newProfit,
                paused: true,
                active: false,
                lostLevels: newLost,
              }));
            } else {
              setChaseState((prev) => ({
                ...prev,
                wallet: newWallet,
                currentProfit: newProfit,
                currentLevel: nextLevel,
                lostLevels: newLost,
              }));
            }
          }
        }

        // Trigger victory popup and sounds
        if (isJackpot) {
          // Trigger Standalone Mega Jackpot Modal!
          sounds.playJackpot();
          try {
            confetti({
              particleCount: 160,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#facc15', '#fbbf24', '#f59e0b', '#ef4444', '#22d3ee'],
            });
          } catch {}

          setJackpotModalState({
            isOpen: true,
            period: latestIssue,
            prediction: prediction.prediction,
            predictedNumber: isFavorMatch ? favorBall : oppBall,
            actualNumber: actualNum,
            actualSize,
            matchedType: jackpotMatchedType,
          });
        } else if (isWin) {
          // Regular Win Modal
          sounds.playWin();
          try {
            confetti({
              particleCount: 70,
              spread: 65,
              origin: { y: 0.6 },
              colors: ['#10e07f', '#22d3ee', '#fbbf24'],
            });
          } catch {}

          setWinModalState({
            isOpen: true,
            period: latestIssue,
            prediction: prediction.prediction,
            predictedNumber: prediction.targetNumber,
            actualNumber: actualNum,
            actualSize,
            isJackpot: false,
          });
        } else {
          sounds.playLoss();
        }
      }
    }

    lastProcessedIssueRef.current = latestIssue;

    // Calculate prediction for the upcoming period
    const nextPeriod = computeNextPeriod(latestIssue, '1m');
    if (!prediction || prediction.period !== nextPeriod) {
      const wasLoss = lastLossRef.current?.wasLoss ?? false;
      const failedSide = lastLossRef.current?.failedSide;

      const newPred = analyzePatternSequence(issues, nextPeriod, '1m', {
        lastResultWasLoss: wasLoss,
        failedSide,
      });
      setPrediction(newPred);
      lastLossRef.current = { wasLoss: false };
      sounds.playSignalAlert();
    }
  }, [issues, prediction, chaseState]);

  // Manual re-analyse trigger
  const handleManualReanalyse = () => {
    if (!issues || issues.length === 0) return;
    setIsAnalysing(true);
    setTimeout(() => {
      const nextPeriod = computeNextPeriod(issues[0].issue, '1m');
      const wasLoss = lastLossRef.current?.wasLoss ?? false;
      const failedSide = lastLossRef.current?.failedSide;

      const newPred = analyzePatternSequence(issues, nextPeriod, '1m', {
        lastResultWasLoss: wasLoss,
        failedSide,
      });
      setPrediction(newPred);
      setIsAnalysing(false);
      sounds.playSignalAlert();
    }, 600);
  };

  // Target Chase Handlers
  const handleStartChase = (wallet: number, target: number, levelCount: 3 | 4 = 4) => {
    const levels = computeTargetLevels(wallet, levelCount);

    setChaseState({
      wallet,
      targetProfit: target,
      baseBalance: wallet,
      currentProfit: 0,
      currentLevel: 1,
      levels,
      totalLevelCount: levelCount,
      active: true,
      completed: false,
      paused: false,
      lostLevels: [],
    });
  };

  const handleResetChase = () => {
    setChaseState((prev) => {
      const levelCount = (prev.totalLevelCount || 4) as 3 | 4;
      const reset: TargetChaseState = {
        ...prev,
        active: false,
        completed: false,
        paused: false,
        currentProfit: 0,
        currentLevel: 1,
        lostLevels: [],
        levels: computeTargetLevels(prev.wallet, levelCount),
      };
      try {
        localStorage.setItem('bmwx_chase', JSON.stringify(reset));
      } catch {}
      return reset;
    });
    sounds.playClick();
  };

  // Fully working Clear History handler
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('bmwx_history');
    } catch {}
    sounds.playClick();
  };

  // Clear full data handler
  const handleClearAllData = () => {
    setHistory([]);
    handleResetChase();
    try {
      localStorage.removeItem('bmwx_history');
      localStorage.removeItem('bmwx_chase');
    } catch {}
    setChaseState({
      wallet: 1000,
      targetProfit: 200,
      baseBalance: 1000,
      currentProfit: 0,
      currentLevel: 1,
      levels: computeTargetLevels(1000, 4),
      totalLevelCount: 4,
      active: false,
      completed: false,
      paused: false,
      lostLevels: [],
    });
    sounds.playClick();
  };

  // Calculate current win streak
  let winStreak = 0;
  for (const item of history) {
    if (item.isWin) winStreak++;
    else break;
  }

  const winCount = history.filter((h) => h.isWin).length;

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col relative selection:bg-amber-400/30 selection:text-amber-200 overflow-x-hidden">
      {/* Video Background Layer - Crystal Clear & Vivid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://image.mux.com/z3HdBtQ6EJ00Uy72xl02RzILJdbOBfU1pAMoNwLmfSQo4/thumbnail.jpg?time=5"
          className="absolute inset-0 w-full h-full object-cover opacity-90 sm:opacity-95 filter brightness-105 contrast-110 scale-105"
        >
          <source src="/bmw-bg.mp4" type="video/mp4" />
          <source src="https://stream.mux.com/z3HdBtQ6EJ00Uy72xl02RzILJdbOBfU1pAMoNwLmfSQo4.m3u8" type="application/x-mpegURL" />
        </video>
        {/* Subtle Vignette Edge Tint - Keeps Video Sharp & Clear */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/70 pointer-events-none" />
        
        {/* Subtle Ambient Edge Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Top Navigation - WinGo 1M Dedicated */}
      <Navbar
        isLive={isLive}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        currentTheme={currentTheme}
      />

      {/* Marquee Ticker */}
      <Ticker />

      {/* Main Content Area - Compact Width & Height */}
      <main className="flex-1 w-full max-w-[430px] mx-auto px-2.5 sm:px-3 py-2.5 pb-20 relative z-10 space-y-2.5">
        {activeTab === 'command' && (
          <PredictorCard
            prediction={prediction}
            secondsRemaining={secondsRemaining}
            cycleDuration={cycleDuration}
            currentCycle={currentCycle}
            onManualReanalyse={handleManualReanalyse}
            isAnalysing={isAnalysing}
            winStreak={winStreak}
          />
        )}

        {activeTab === 'target' && (
          <TargetChaseTab
            chaseState={chaseState}
            currentPrediction={prediction}
            onStartChase={handleStartChase}
            onResetChase={handleResetChase}
          />
        )}

        {activeTab === 'radar' && (
          <PatternRadarTab
            prediction={prediction}
            recentIssues={issues}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Floating Game Web Runner */}
      <FloatingGameRunner
        prediction={prediction}
        secondsRemaining={secondsRemaining}
      />

      {/* Bottom Dock Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        winCount={winCount}
      />

      {/* VIP Palette Theme Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* Regular Win Modal */}
      <WinModal
        isOpen={winModalState.isOpen}
        onClose={() => setWinModalState((prev) => ({ ...prev, isOpen: false }))}
        period={winModalState.period}
        prediction={winModalState.prediction}
        predictedNumber={winModalState.predictedNumber}
        actualNumber={winModalState.actualNumber}
        actualSize={winModalState.actualSize}
        isJackpot={winModalState.isJackpot}
      />

      {/* Dedicated Standalone Mega Jackpot Modal */}
      <JackpotModal
        isOpen={jackpotModalState.isOpen}
        onClose={() => setJackpotModalState((prev) => ({ ...prev, isOpen: false }))}
        period={jackpotModalState.period}
        prediction={jackpotModalState.prediction}
        predictedNumber={jackpotModalState.predictedNumber}
        actualNumber={jackpotModalState.actualNumber}
        actualSize={jackpotModalState.actualSize}
        matchedType={jackpotModalState.matchedType}
      />

      {/* Authorization Key Gate */}
      <LoginGate
        isLocked={isLocked}
        onUnlock={handleUnlock}
      />
    </div>
  );
}
