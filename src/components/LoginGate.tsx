import React, { useState, useEffect, useRef } from 'react';
import { BmwBossCrown } from './CustomIcons';
import {
  ShieldCheck,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Smartphone,
  Send,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Fingerprint,
  Eye,
  EyeOff,
  ArrowLeft,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import {
  getDeviceFingerprint,
  registerDeviceAccessRequest,
  checkDeviceAuthorizationStatus,
  getSavedClientEmail,
} from '../utils/licenseSecurity';

interface LoginGateProps {
  isLocked: boolean;
  onUnlock: () => void;
}

type GateScreen = 'LOGIN_GATE' | 'DEVICE_ID_AUTHORIZATION' | 'ADMIN_SELECT_PAGE';

export const LoginGate: React.FC<LoginGateProps> = ({ isLocked, onUnlock }) => {
  const deviceId = getDeviceFingerprint();

  // ALWAYS START ON LOGIN GATE (Pahle device ID show nahi karega!)
  const [currentScreen, setCurrentScreen] = useState<GateScreen>('LOGIN_GATE');

  // Biometric hold scanner state for Login Gate
  const [isBiometricUnlocked, setIsBiometricUnlocked] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  // Email & Password Form state
  const [email, setEmail] = useState(() => getSavedClientEmail());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authorization Status State
  const [deviceStatus, setDeviceStatus] = useState(() => checkDeviceAuthorizationStatus(deviceId));
  const [copiedId, setCopiedId] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isAutoUnlocking, setIsAutoUnlocking] = useState(false);

  // Biometric Sensor Hold Logic
  useEffect(() => {
    if (isHolding) {
      sounds.playClick();
      holdIntervalRef.current = window.setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
            setIsHolding(false);
            sounds.playWin();
            setIsBiometricUnlocked(true);
            return 100;
          }
          return prev + 5;
        });
      }, 70);
    } else {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
    }

    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [isHolding]);

  // Polling loop: Real-time check if Admin has authorized this device
  useEffect(() => {
    if (!isLocked) return;

    const pollStatus = () => {
      const current = checkDeviceAuthorizationStatus(deviceId);
      setDeviceStatus(current);

      // If authorized by Admin, auto-unlock immediately!
      if (current.authorized) {
        setIsAutoUnlocking(true);
        sounds.playJackpot();
        setTimeout(() => {
          onUnlock();
        }, 1200);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2500);
    return () => clearInterval(interval);
  }, [isLocked, deviceId, onUnlock]);

  if (!isLocked) return null;

  // Handle Real Email & Password Login -> Transitions to Device ID screen
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const res = registerDeviceAccessRequest(email, password);
      setIsSubmitting(false);

      if (res.success) {
        sounds.playWin();
        const updated = checkDeviceAuthorizationStatus(deviceId);
        setDeviceStatus(updated);
        // Transition to Device ID screen ONLY AFTER entering email and password!
        setCurrentScreen('DEVICE_ID_AUTHORIZATION');
      } else {
        sounds.playLoss();
        setFormError(res.message);
        setTimeout(() => setFormError(''), 4000);
      }
    }, 450);
  };

  const handleCopyDeviceId = () => {
    sounds.playClick();
    navigator.clipboard.writeText(deviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const getFullAdminMessage = () => {
    return `Hello Admin, I want to buy VIP access for BMW X BOSS LX Engine. Please authorize my Device ID:\n\n📱 Device ID: ${deviceId}\n📧 Email: ${email || 'Registered User'}\n\nPlease approve for 1-Device VIP access.`;
  };

  const handleCopyFullMessage = () => {
    sounds.playClick();
    navigator.clipboard.writeText(getFullAdminMessage());
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  // Direct Telegram Dispatch to selected Admin
  const handleSendToSelectedAdmin = (username: string) => {
    sounds.playClick();
    const cleanUser = username.replace('@', '');
    const text = encodeURIComponent(getFullAdminMessage());
    // Direct Telegram link
    window.open(`https://t.me/${cleanUser}?text=${text}`, '_blank');
  };

  const isExpired = deviceStatus.reason === 'DEVICE ACCESS EXPIRED';
  const isRevoked = deviceStatus.reason === 'ACCESS REVOKED BY ADMIN';

  return (
    <div className="fixed inset-0 z-50 bg-[#02040a]/95 backdrop-blur-3xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Background Aurora */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-amber-500/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-violet-600/20 blur-[130px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#0e142c] via-[#080c1d] to-[#030611] border border-amber-500/40 p-5 sm:p-6 text-center shadow-[0_0_80px_rgba(245,158,11,0.2)] overflow-hidden my-auto">
        {/* Shimmer sweep animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shine-sweep_5s_infinite] pointer-events-none" />

        {/* Brand Crest Header */}
        <div className="relative w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-violet-700 p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.45)] mb-2 flex items-center justify-center">
          <div className="w-full h-full bg-[#080d22] rounded-[14px] flex items-center justify-center">
            <BmwBossCrown className="w-8 h-8" />
          </div>
        </div>

        <h2 className="font-orbitron font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 tracking-wider">
          ☠︎ 𝗕ᴍᴡ 〆 𝗫 〆 𝗟x 〆 𝗣ʀᴇᴅɪᴄᴛᴏʀ 𝟲.𝟮 ☠︎
        </h2>
        <div className="flex items-center justify-center gap-1.5 mt-0.5 mb-3 text-[8.5px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>SECURITY ACCESS GATE</span>
        </div>

        {/* Auto-Unlock Alert Banner */}
        {isAutoUnlocking && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-center space-y-1 animate-bounce mb-3">
            <div className="flex items-center justify-center gap-1.5 text-xs font-orbitron font-black text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ACCESS AUTHORIZED BY ADMIN!</span>
            </div>
            <p className="text-[9px] font-mono text-slate-200">
              Approved for {deviceStatus.record?.durationLabel}. Unlocking engine now...
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 1: LOGIN GATE (PAHLE YAHI KHULEGA, NO DEVICE ID SHOWN!) */}
        {/* ============================================================== */}
        {currentScreen === 'LOGIN_GATE' && (
          <div className="space-y-3.5 text-left animate-[fadeIn_0.3s_ease-out]">
            {/* Step Banner */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-violet-600/10 to-transparent border border-amber-400/40 text-center">
              <span className="text-[10px] font-orbitron font-black text-amber-300 block mb-0.5">
                🔐 MASTER LOGIN GATE
              </span>
              <p className="text-[9.5px] font-rajdhani text-slate-300">
                {!isBiometricUnlocked
                  ? 'Hold biometric sensor below to unlock secure credentials portal.'
                  : 'Enter your official email and password to verify your account.'}
              </p>
            </div>

            {/* Biometric Scan Section */}
            {!isBiometricUnlocked ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-white/10"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-amber-400 transition-all duration-75"
                      strokeWidth="5"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (holdProgress / 100) * 251.2}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  <button
                    type="button"
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className={`absolute w-18 h-18 rounded-full flex flex-col items-center justify-center transition-all select-none ${
                      isHolding
                        ? 'bg-amber-400 text-black scale-95 shadow-[0_0_25px_rgba(251,191,36,0.8)]'
                        : 'bg-black/60 border-2 border-amber-400/50 text-amber-300 hover:border-amber-400 active:scale-95'
                    }`}
                  >
                    <Fingerprint className={`w-8 h-8 ${isHolding ? 'animate-pulse text-black' : 'text-amber-400'}`} />
                    <span className="text-[7.5px] font-orbitron font-black mt-0.5">
                      {isHolding ? `${holdProgress}%` : 'HOLD'}
                    </span>
                  </button>
                </div>

                <div className="text-[9px] font-mono text-slate-400">
                  {isHolding ? (
                    <span className="text-amber-300 font-bold animate-pulse">
                      SCANNING BIOMETRICS... ({holdProgress}%)
                    </span>
                  ) : (
                    <span>HOLD 2 SECONDS TO ACCESS LOGIN</span>
                  )}
                </div>

                {/* Quick skip button for fast access */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsBiometricUnlocked(true);
                  }}
                  className="text-[8.5px] font-mono text-slate-500 hover:text-amber-400 underline"
                >
                  Direct Email Login →
                </button>
              </div>
            ) : (
              /* Real Email & Password Login Form (Device ID is HIDDEN!) */
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-[8.5px] font-orbitron font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-amber-400" />
                    <span>REAL OFFICIAL EMAIL ADDRESS</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com"
                    className="w-full bg-black/70 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs font-mono text-white outline-none"
                  />
                  <span className="text-[7.5px] font-mono text-slate-500 mt-0.5 block">
                    * Fake or throwaway email domains are strictly blocked.
                  </span>
                </div>

                <div>
                  <label className="block text-[8.5px] font-orbitron font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>ACCOUNT PASSWORD</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[8px] font-mono"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
                    </button>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-black/70 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs font-mono text-white outline-none"
                  />
                </div>

                {formError && (
                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-[9.5px] font-mono text-rose-300 text-center flex items-center justify-center gap-1.5 animate-shake">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-orbitron font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 text-black animate-spin" />
                  ) : (
                    <>
                      <span>LOGIN & GET DEVICE ID</span>
                      <ChevronRight className="w-4 h-4 text-black" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 2: DEVICE ID SCREEN (EMAIL PASSWORD DALNE KE BAAD HI AYEGA!) */}
        {/* ============================================================== */}
        {currentScreen === 'DEVICE_ID_AUTHORIZATION' && (
          <div className="space-y-3 text-left animate-[fadeIn_0.3s_ease-out]">
            {/* Status Header */}
            <div
              className={`p-3 rounded-2xl border text-center space-y-1 ${
                isExpired
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : isRevoked
                  ? 'bg-rose-900/20 border-rose-600/50 text-rose-300'
                  : 'bg-amber-500/10 border-amber-400/40 text-amber-300'
              }`}
            >
              <span className="text-[10px] font-orbitron font-black uppercase tracking-wider block">
                {isExpired
                  ? '⚠️ DEVICE ACCESS EXPIRED'
                  : isRevoked
                  ? '🚫 ACCESS REVOKED BY ADMIN'
                  : '⏳ WAITING FOR ADMIN APPROVAL'}
              </span>
              <p className="text-[9.5px] font-rajdhani text-slate-300">
                {isExpired
                  ? 'Your granted days have expired. Send Device ID to Admin to renew.'
                  : isRevoked
                  ? 'This device ID has been suspended.'
                  : 'Copy your Device ID below and send to Admin. App will automatically open as soon as Admin approves!'}
              </p>
            </div>

            {/* Hardware Device ID Card */}
            <div className="p-3.5 rounded-2xl bg-black/70 border border-amber-400/50 space-y-2">
              <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>YOUR HARDWARE DEVICE ID</span>
                </span>
                <span className="text-emerald-400 font-bold">1-DEVICE LOCKED ✓</span>
              </div>

              {/* Big Device ID Box */}
              <div
                onClick={handleCopyDeviceId}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-black to-amber-500/20 border border-amber-400 text-center font-orbitron font-black text-sm text-amber-300 tracking-wider cursor-pointer active:scale-95 transition shadow-inner select-all"
              >
                {deviceId}
              </div>

              {/* 1-Click Copy and Send to Admin Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyDeviceId}
                  className="py-2 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-orbitron font-black text-[9.5px] uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  {copiedId ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'COPIED!' : 'COPY DEVICE ID'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCurrentScreen('ADMIN_SELECT_PAGE');
                  }}
                  className="py-2 px-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-orbitron font-black text-[9.5px] uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>SEND TO ADMIN ➔</span>
                </button>
              </div>
            </div>

            {/* User Credentials Info Box */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-[9px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>REGISTERED EMAIL:</span>
                <span className="text-white font-bold">{email}</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span
                  className={`font-bold ${
                    deviceStatus.record?.status === 'AUTHORIZED'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {deviceStatus.record?.status || 'PENDING APPROVAL'}
                </span>
              </div>
              {deviceStatus.record?.durationLabel && (
                <div className="flex justify-between">
                  <span>VALIDITY:</span>
                  <span className="text-cyan-300 font-bold">{deviceStatus.record.durationLabel}</span>
                </div>
              )}
            </div>

            {/* Polling Pulse Status */}
            <div className="flex items-center justify-center gap-2 py-1 text-[9px] font-mono text-slate-400">
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Listening for Admin approval (Auto-syncing)...</span>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setCurrentScreen('LOGIN_GATE');
              }}
              className="w-full text-center text-[9px] font-mono text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1 pt-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Login Gate</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 3: ADMIN SELECTION PAGE (DO USERNAME WITH BILINGUAL NOTICE) */}
        {/* ============================================================== */}
        {currentScreen === 'ADMIN_SELECT_PAGE' && (
          <div className="space-y-3 text-left animate-[fadeIn_0.3s_ease-out]">
            {/* Bilingual Instruction Box - Exact requirement */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-black to-cyan-500/20 border border-amber-400/50 text-center space-y-1">
              <span className="text-[10px] font-orbitron font-black text-amber-300 block uppercase">
                📢 CHOOSE YOUR SELLER / एडमिन चुनें
              </span>
              <p className="text-[10px] font-bold text-amber-200 font-sans leading-tight">
                "आप जिससे buy कर रहे हैं, कृपया यह Device ID उन्हीं को भेजें"
              </p>
              <p className="text-[9px] font-medium text-cyan-200 font-mono leading-tight">
                "Please send this Device ID only to the Admin you are buying from"
              </p>
            </div>

            {/* Device ID Display pill */}
            <div className="p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-[9px] font-mono">
              <span className="text-slate-400">YOUR DEVICE ID:</span>
              <span className="text-amber-300 font-bold font-orbitron">{deviceId}</span>
              <button
                type="button"
                onClick={handleCopyDeviceId}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedId ? 'COPIED!' : 'COPY'}</span>
              </button>
            </div>

            {/* 2 Official Admin Cards */}
            <div className="space-y-2">
              {/* ADMIN 1: @BMWXNARUTO */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0b1333] via-black to-[#0b1333] border border-cyan-400/40 hover:border-cyan-400 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-orbitron font-black text-xs text-white">
                        ADMIN 1: <span className="text-cyan-300">@BMWXNARUTO</span>
                      </div>
                      <div className="text-[8px] font-mono text-slate-400">
                        OFFICIAL MASTER TELEGRAM ADMIN
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    VERIFIED
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendToSelectedAdmin('@BMWXNARUTO')}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-orbitron font-black text-[10px] uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SEND DEVICE ID TO @BMWXNARUTO</span>
                </button>
              </div>

              {/* ADMIN 2: @LX_OWNER0001 */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#170e2f] via-black to-[#170e2f] border border-violet-400/40 hover:border-violet-400 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-orbitron font-black text-xs text-white">
                        ADMIN 2: <span className="text-violet-300">@LX_OWNER0001</span>
                      </div>
                      <div className="text-[8px] font-mono text-slate-400">
                        OFFICIAL LX OWNER & DISTRIBUTOR
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    VERIFIED
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendToSelectedAdmin('@LX_OWNER0001')}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-orbitron font-black text-[10px] uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SEND DEVICE ID TO @LX_OWNER0001</span>
                </button>
              </div>
            </div>

            {/* Copy Complete Message Option */}
            <button
              type="button"
              onClick={handleCopyFullMessage}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-[9px] flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              {copiedMessage ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMessage ? 'FULL MESSAGE COPIED!' : '📋 COPY FULL MESSAGE TEXT'}</span>
            </button>

            {/* Back Button to Device ID screen */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setCurrentScreen('DEVICE_ID_AUTHORIZATION');
              }}
              className="w-full text-center text-[9px] font-mono text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1 pt-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Device ID</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
