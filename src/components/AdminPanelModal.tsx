import React, { useState } from 'react';
import {
  ShieldAlert,
  Download,
  Copy,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  UserCheck,
  Calendar,
  Mail,
  Key,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import {
  DeviceAuthorizationRecord,
  getAllDeviceRecords,
  adminAuthorizeDevice,
  adminRevokeDevice,
} from '../utils/licenseSecurity';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassphrase, setAdminPassphrase] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Manual Device Authorization form state
  const [manualDeviceId, setManualDeviceId] = useState('');
  const [manualDays, setManualDays] = useState<number>(7);
  const [manualNote, setManualNote] = useState('');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Password visibility map for user table
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Device records list
  const [deviceRecords, setDeviceRecords] = useState<DeviceAuthorizationRecord[]>(() =>
    getAllDeviceRecords()
  );

  const refreshList = () => {
    setDeviceRecords(getAllDeviceRecords());
  };

  if (!isOpen) return null;

  // Master Admin Passphrase verification
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminPassphrase.trim();
    if (clean === 'BMWX-ADMIN-ROOT' || clean === '909090' || clean === 'ADMIN777' || clean === 'BOSS777') {
      sounds.playJackpot();
      setIsAdminAuthenticated(true);
      setAuthError('');
      refreshList();
    } else {
      sounds.playLoss();
      setAuthError('ACCESS DENIED: INVALID MASTER ADMIN PASSPHRASE');
      setTimeout(() => setAuthError(''), 3500);
    }
  };

  // Authorize a registered device
  const handleAuthorizeDevice = (deviceId: string, days: number, note?: string) => {
    sounds.playWin();
    adminAuthorizeDevice(deviceId, days, note);
    refreshList();
  };

  // Revoke device
  const handleRevokeDevice = (deviceId: string) => {
    sounds.playLoss();
    adminRevokeDevice(deviceId);
    refreshList();
  };

  // Handle Manual Device Authorization
  const handleManualAuthorizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualDeviceId.trim();
    if (!cleanId) return;

    sounds.playWin();
    adminAuthorizeDevice(cleanId, manualDays, manualNote || 'Direct Admin Activation');
    setManualDeviceId('');
    setManualNote('');
    setManualSuccessMsg(`Device ${cleanId} authorized for ${manualDays} days!`);
    setTimeout(() => setManualSuccessMsg(''), 3500);
    refreshList();
  };

  const togglePasswordVisibility = (deviceId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  const copyToClipboard = (text: string) => {
    sounds.playClick();
    navigator.clipboard.writeText(text);
  };

  // Downloads
  const handleDownloadAdminHtml = () => {
    sounds.playJackpot();
    const link = document.createElement('a');
    link.href = '/bmw-admin-panel.html';
    link.download = 'bmw-admin-panel.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPredictorHtml = () => {
    sounds.playJackpot();
    const link = document.createElement('a');
    link.href = '/bmw-x-predictor.html';
    link.download = 'bmw-x-predictor.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHdImage = () => {
    sounds.playJackpot();
    const link = document.createElement('a');
    link.href = '/bmw-admin-banner.jpg';
    link.download = 'bmw-admin-banner.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020309]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[30px] bg-gradient-to-b from-[#101736] via-[#090d22] to-[#030612] border border-amber-500/40 p-4 sm:p-6 text-center shadow-[0_0_100px_rgba(245,158,11,0.25)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xs shadow-md">
              ☠︎
            </div>
            <div className="flex flex-col text-left">
              <span className="font-orbitron font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                MASTER ADMIN CONTROL PANEL
              </span>
              <span className="text-[8.5px] font-mono text-emerald-400 font-bold">
                DEVICE HARDWARE AUTHORIZER & USER REGISTRY
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Auth Gate if not logged in */}
        {!isAdminAuthenticated ? (
          <div className="space-y-4 py-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-transparent border border-rose-500/40 text-left">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-orbitron font-black text-rose-300 uppercase">
                  ADMIN AUTH REQUIRED
                </span>
              </div>
              <p className="text-[10px] font-rajdhani text-slate-300">
                Double-click detected on root lock emblem. Enter Master Administrator Passphrase to authorize devices and view client credentials.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-[9px] font-orbitron font-bold text-slate-300 mb-1">
                  MASTER PASSPHRASE
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassphrase}
                    onChange={(e) => setAdminPassphrase(e.target.value)}
                    placeholder="ENTER MASTER PASS (DEFAULT: 909090)"
                    className="w-full bg-black/70 border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1.5 bg-rose-500/15 p-2 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-orbitron font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition"
              >
                <Lock className="w-4 h-4 text-black" />
                <span>AUTHENTICATE MASTER ADMIN</span>
              </button>
            </form>

            <div className="text-[9px] font-mono text-slate-500">
              DEFAULT ADMIN PASS: <span className="text-amber-300">909090</span> or <span className="text-amber-300">BMWX-ADMIN-ROOT</span>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="space-y-3 overflow-y-auto pr-1 text-left scrollbar-none flex-1">
            {/* HD Admin Banner Asset */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-md">
              <img
                src="/bmw-admin-banner.jpg"
                alt="BMW Admin Shield"
                className="w-full h-20 sm:h-24 object-cover brightness-105 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[10px] font-orbitron font-black text-amber-300 tracking-wider">
                  👑 USER REGISTRY & HARDWARE AUTHORIZER
                </span>
              </div>
            </div>

            {/* Manual Authorize Box (For IDs received via WhatsApp/Telegram) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-amber-400/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-orbitron font-black text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  AUTHORIZE DEVICE ID (@BMWXNARUTO / @LX_OWNER0001)
                </span>
                <span className="text-[8px] font-mono text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  STRICT 1-DEVICE ONLY
                </span>
              </div>

              <form onSubmit={handleManualAuthorizeSubmit} className="space-y-2">
                <div>
                  <label className="block text-[8.5px] font-orbitron font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>PASTE CLIENT DEVICE ID</span>
                    <span className="text-amber-400 font-mono text-[7.5px]">RECEIVED VIA TELEGRAM</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualDeviceId}
                    onChange={(e) => setManualDeviceId(e.target.value.toUpperCase())}
                    placeholder="e.g. DEV-84C1-A902"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-300 outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] font-orbitron font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>SELECT VALIDITY DURATION</span>
                    <span className="text-emerald-400 text-[8px] font-bold">AUTO-EXPIRES AFTER DURATION</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                    {[
                      { days: 1, label: '1D' },
                      { days: 3, label: '3D' },
                      { days: 7, label: '7D' },
                      { days: 15, label: '15D' },
                      { days: 30, label: '30D' },
                      { days: 90, label: '90D' },
                      { days: 3650, label: 'LIFE' },
                    ].map((d) => (
                      <button
                        key={d.days}
                        type="button"
                        onClick={() => {
                          setManualDays(d.days);
                          sounds.playClick();
                        }}
                        className={`py-1 rounded-lg text-center font-orbitron font-black text-[8.5px] transition ${
                          manualDays === d.days
                            ? 'bg-amber-400 text-black shadow-sm'
                            : 'bg-black/50 text-slate-400 border border-white/5'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="Note / User name (e.g. VIP Rahul)"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1 text-[10px] font-mono text-white outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 text-black font-orbitron font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-black" />
                  <span>AUTHORIZE (1 DEVICE ONLY · {manualDays >= 3650 ? 'LIFETIME' : `${manualDays} DAYS`}) ⚡</span>
                </button>

                {manualSuccessMsg && (
                  <div className="text-[9px] font-mono text-emerald-400 font-bold text-center animate-fadeIn">
                    ✓ {manualSuccessMsg}
                  </div>
                )}
              </form>
            </div>

            {/* Registered Users & Device Requests Table */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-orbitron font-black text-slate-300 tracking-wider uppercase">
                  REGISTERED CLIENTS & DEVICES ({deviceRecords.length})
                </span>
                <button
                  type="button"
                  onClick={refreshList}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[8.5px] font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>REFRESH</span>
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none pr-1">
                {deviceRecords.map((dev) => (
                  <div
                    key={dev.deviceId}
                    className="p-3 rounded-2xl bg-black/60 border border-white/5 space-y-2 text-[9px] font-mono"
                  >
                    {/* Top Row: Device ID & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-orbitron font-bold text-amber-300">{dev.deviceId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(dev.deviceId)}
                          title="Copy Device ID"
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[7.5px] font-bold ${
                          dev.status === 'AUTHORIZED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : dev.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {dev.status}
                      </span>
                    </div>

                    {/* Middle Row: User Email & Password Display (Full view as requested!) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 rounded-xl bg-black/40 border border-white/5 text-[8.5px]">
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="text-slate-400">EMAIL:</span>
                        <span className="text-white font-bold truncate">{dev.email}</span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 truncate">
                          <Key className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="text-slate-400">PASS:</span>
                          <span className="text-amber-300 font-bold font-mono">
                            {revealedPasswords[dev.deviceId] ? dev.password : '••••••••'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(dev.deviceId)}
                          className="text-slate-400 hover:text-white"
                        >
                          {revealedPasswords[dev.deviceId] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expiry Details */}
                    <div className="flex items-center justify-between text-[8px] text-slate-400">
                      <span>PLAN: <strong className="text-white">{dev.durationLabel || 'None'}</strong></span>
                      {dev.expiresAt && (
                        <span>
                          EXPIRES:{' '}
                          <strong className={Date.now() > dev.expiresAt ? 'text-rose-400' : 'text-emerald-400'}>
                            {Date.now() > dev.expiresAt ? 'EXPIRED' : new Date(dev.expiresAt).toLocaleDateString()}
                          </strong>
                        </span>
                      )}
                      {dev.note && <span className="italic truncate">• {dev.note}</span>}
                    </div>

                    {/* Quick Action Buttons: Approve 1D, 7D, 30D, Life, or Revoke */}
                    <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-white/5">
                      <span className="text-[7.5px] font-orbitron font-bold text-slate-400 mr-1">APPROVE:</span>
                      {[1, 3, 7, 30, 3650].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handleAuthorizeDevice(dev.deviceId, d, `Approved (${d >= 3650 ? 'Life' : `${d}D`})`)}
                          className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-[7.5px] font-bold active:scale-95 transition"
                        >
                          +{d >= 3650 ? 'LIFE' : `${d}D`}
                        </button>
                      ))}

                      {dev.status === 'AUTHORIZED' && (
                        <button
                          type="button"
                          onClick={() => handleRevokeDevice(dev.deviceId)}
                          className="ml-auto px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-[7.5px] font-bold active:scale-95 transition flex items-center gap-0.5"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>REVOKE</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Standalone Download Buttons Suite */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-violet-600/10 to-transparent border border-white/10 space-y-1.5">
              <span className="text-[9.5px] font-orbitron font-black text-cyan-300 tracking-wider uppercase block">
                STANDALONE EXPORTS (GITHUB / OFFLINE)
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={handleDownloadAdminHtml}
                  className="p-2 rounded-xl bg-black/60 border border-amber-400/40 hover:bg-amber-400/10 text-amber-300 flex items-center justify-center gap-1 font-bold text-[9.5px] transition"
                >
                  <Download className="w-3 h-3" />
                  <span>ADMIN HTML</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPredictorHtml}
                  className="p-2 rounded-xl bg-black/60 border border-cyan-400/40 hover:bg-cyan-400/10 text-cyan-300 flex items-center justify-center gap-1 font-bold text-[9.5px] transition"
                >
                  <Download className="w-3 h-3" />
                  <span>PREDICTOR HTML</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadHdImage}
                  className="p-2 rounded-xl bg-black/60 border border-violet-400/40 hover:bg-violet-400/10 text-violet-300 flex items-center justify-center gap-1 font-bold text-[9.5px] transition"
                >
                  <Download className="w-3 h-3" />
                  <span>HD BANNER</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
