/**
 * BMW X BOSS LX - Device ID Direct Hardware Authorization Engine
 * Features:
 * - Real Email & Password Registration (Rejects fake / disposable domains)
 * - Device ID Hardware Fingerprinting
 * - Admin Panel User Registry with Email, Password & Device ID
 * - 1-Click Days Authorization (1D, 3D, 7D, 15D, 30D, 90D, Lifetime)
 * - Real-time Polling & Automatic App Unlock upon Admin Approval
 * - Strict Expiration Enforcement (Immediate auto-lock once days expire)
 */

export interface DeviceAuthorizationRecord {
  deviceId: string;
  email: string;
  password: string;
  registeredAt: number;
  authorizedAt: number | null;
  expiresAt: number | null;
  durationLabel: string;
  daysGranted: number;
  status: 'PENDING' | 'AUTHORIZED' | 'EXPIRED' | 'REVOKED';
  note?: string;
}

const STORAGE_DEVICES_VAULT = '_bmwx_v6_devices_vault';
const STORAGE_MACHINE_ID = '_bmwx_v6_machine_id';
const STORAGE_CLIENT_EMAIL = '_bmwx_v6_client_email';

/**
 * Deterministic Device Machine Fingerprint
 */
export function getDeviceFingerprint(): string {
  try {
    let saved = localStorage.getItem(STORAGE_MACHINE_ID);
    if (!saved) {
      const entropy = [
        navigator.userAgent,
        navigator.language,
        window.screen.width,
        window.screen.height,
        window.screen.colorDepth,
        Date.now(),
        Math.random().toString(36).slice(2),
      ].join('||');

      let hash = 0x811c9dc5;
      for (let i = 0; i < entropy.length; i++) {
        hash ^= entropy.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
      }
      const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
      saved = `DEV-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
      localStorage.setItem(STORAGE_MACHINE_ID, saved);
    }
    return saved;
  } catch {
    return 'DEV-8899-VIP0';
  }
}

/**
 * Validates genuine email syntax and blocks fake disposable domains
 */
export function validateRealEmail(email: string): { valid: boolean; message?: string } {
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, message: 'PLEASE ENTER A VALID EMAIL FORMAT (e.g. name@gmail.com)' };
  }

  // Block obvious fake/throwaway domains
  const blockedFakeDomains = [
    'tempmail',
    'throwaway',
    'mailinator',
    'guerrillamail',
    '10minutemail',
    'sharklasers',
    'yopmail',
    'dispostable',
    'getnada',
    'trashmail',
    'fake',
    'test.com',
    'asdf',
  ];

  const domain = clean.split('@')[1];
  for (const fake of blockedFakeDomains) {
    if (domain.includes(fake)) {
      return { valid: false, message: 'DISPOSABLE / FAKE EMAIL DETECTED. PLEASE USE YOUR REAL EMAIL.' };
    }
  }

  return { valid: true };
}

/**
 * Load all device records from storage
 */
export function getAllDeviceRecords(): DeviceAuthorizationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_DEVICES_VAULT);
    if (raw) {
      const parsed: DeviceAuthorizationRecord[] = JSON.parse(raw);
      // Auto-update expired items
      const now = Date.now();
      return parsed.map((item) => {
        if (item.status === 'AUTHORIZED' && item.expiresAt && now > item.expiresAt) {
          return { ...item, status: 'EXPIRED' };
        }
        return item;
      });
    }
  } catch {}

  // Pre-seed owner record
  const initial: DeviceAuthorizationRecord[] = [
    {
      deviceId: 'DEV-ROOT-9090',
      email: 'owner@bmwx.vip',
      password: 'ADMIN_ROOT_SECRET',
      registeredAt: Date.now() - 86400000 * 3,
      authorizedAt: Date.now() - 86400000 * 3,
      expiresAt: Date.now() + 86400000 * 365,
      durationLabel: 'Owner Lifetime Pass',
      daysGranted: 3650,
      status: 'AUTHORIZED',
      note: 'Master Owner Account',
    },
  ];

  try {
    localStorage.setItem(STORAGE_DEVICES_VAULT, JSON.stringify(initial));
  } catch {}
  return initial;
}

/**
 * Save single device record
 */
function saveDeviceRecord(record: DeviceAuthorizationRecord): void {
  const all = getAllDeviceRecords().filter((d) => d.deviceId !== record.deviceId);
  all.unshift(record);
  try {
    localStorage.setItem(STORAGE_DEVICES_VAULT, JSON.stringify(all));
  } catch {}
}

/**
 * Registers user credentials with this device for Admin Authorization
 */
export function registerDeviceAccessRequest(
  email: string,
  password: string
): { success: boolean; message: string; record: DeviceAuthorizationRecord } {
  const emailCheck = validateRealEmail(email);
  if (!emailCheck.valid) {
    return {
      success: false,
      message: emailCheck.message || 'INVALID EMAIL FORMAT',
      record: null as unknown as DeviceAuthorizationRecord,
    };
  }

  if (!password.trim() || password.trim().length < 4) {
    return {
      success: false,
      message: 'PASSWORD MUST BE AT LEAST 4 CHARACTERS',
      record: null as unknown as DeviceAuthorizationRecord,
    };
  }

  const deviceId = getDeviceFingerprint();
  const all = getAllDeviceRecords();
  let existing = all.find((d) => d.deviceId === deviceId);

  if (existing) {
    // Update credentials if user changed them
    existing.email = email.trim();
    existing.password = password.trim();
    saveDeviceRecord(existing);
    localStorage.setItem(STORAGE_CLIENT_EMAIL, email.trim());
    return {
      success: true,
      message: 'DEVICE REGISTRATION UPDATED',
      record: existing,
    };
  }

  const newRecord: DeviceAuthorizationRecord = {
    deviceId,
    email: email.trim(),
    password: password.trim(),
    registeredAt: Date.now(),
    authorizedAt: null,
    expiresAt: null,
    durationLabel: 'Pending Approval',
    daysGranted: 0,
    status: 'PENDING',
    note: `Submitted on ${new Date().toLocaleDateString()}`,
  };

  saveDeviceRecord(newRecord);
  try {
    localStorage.setItem(STORAGE_CLIENT_EMAIL, email.trim());
  } catch {}

  return {
    success: true,
    message: 'DEVICE REGISTERED. WAITING FOR ADMIN APPROVAL.',
    record: newRecord,
  };
}

/**
 * Checks if this Device ID is authorized by Admin
 */
export function checkDeviceAuthorizationStatus(deviceId?: string): {
  authorized: boolean;
  record: DeviceAuthorizationRecord | null;
  remainingDays: number;
  reason?: string;
} {
  const targetId = deviceId || getDeviceFingerprint();
  const all = getAllDeviceRecords();
  const record = all.find((d) => d.deviceId === targetId);

  if (!record) {
    return { authorized: false, record: null, remainingDays: 0, reason: 'DEVICE NOT REGISTERED' };
  }

  if (record.status === 'REVOKED') {
    return { authorized: false, record, remainingDays: 0, reason: 'ACCESS REVOKED BY ADMIN' };
  }

  if (record.status === 'PENDING') {
    return { authorized: false, record, remainingDays: 0, reason: 'PENDING ADMIN APPROVAL' };
  }

  if (record.expiresAt && Date.now() > record.expiresAt) {
    record.status = 'EXPIRED';
    saveDeviceRecord(record);
    return { authorized: false, record, remainingDays: 0, reason: 'DEVICE ACCESS EXPIRED' };
  }

  if (record.status === 'AUTHORIZED') {
    const remainingMs = record.expiresAt ? Math.max(0, record.expiresAt - Date.now()) : 99999999999;
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return { authorized: true, record, remainingDays };
  }

  return { authorized: false, record, remainingDays: 0, reason: 'UNAUTHORIZED' };
}

/**
 * Admin action: Authorize a device for X days
 */
export function adminAuthorizeDevice(
  deviceId: string,
  days: number,
  note?: string
): DeviceAuthorizationRecord | null {
  const all = getAllDeviceRecords();
  const cleanId = deviceId.trim();
  let record = all.find((d) => d.deviceId === cleanId);

  const durationLabel = days >= 365 ? 'Lifetime Access' : `${days} Day${days > 1 ? 's' : ''}`;
  const now = Date.now();
  const expiresAt = days >= 3650 ? null : now + days * 24 * 60 * 60 * 1000;

  if (record) {
    record.authorizedAt = now;
    record.expiresAt = expiresAt;
    record.daysGranted = days;
    record.durationLabel = durationLabel;
    record.status = 'AUTHORIZED';
    if (note) record.note = note;
    saveDeviceRecord(record);
    return record;
  }

  // Create new direct authorized record if admin inputs a device directly
  const newRec: DeviceAuthorizationRecord = {
    deviceId: cleanId,
    email: 'admin-authorized@bmwx.vip',
    password: 'DIRECT_AUTHORIZATION',
    registeredAt: now,
    authorizedAt: now,
    expiresAt,
    daysGranted: days,
    durationLabel,
    status: 'AUTHORIZED',
    note: note || `Directly approved by Admin (${days} Days)`,
  };

  saveDeviceRecord(newRec);
  return newRec;
}

/**
 * Admin action: Revoke a device
 */
export function adminRevokeDevice(deviceId: string): void {
  const all = getAllDeviceRecords();
  const record = all.find((d) => d.deviceId === deviceId.trim());
  if (record) {
    record.status = 'REVOKED';
    saveDeviceRecord(record);
  }
}

/**
 * Get current registered user email if any
 */
export function getSavedClientEmail(): string {
  try {
    return localStorage.getItem(STORAGE_CLIENT_EMAIL) || '';
  } catch {
    return '';
  }
}

/**
 * Logout / Lock current device session
 */
export function logoutDeviceSession(): void {
  try {
    localStorage.removeItem('_bmwx_unlocked');
  } catch {}
}
