import { GameCycle, HistoryIssue } from '../types';

const API_ENDPOINT = 'https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json';

const PROXIES: ((url: string) => string)[] = [
  (u) => u,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
];

function normalizePayload(d: any): any[] {
  const raw = d?.data?.list ?? d?.data?.gameslist ?? d?.data?.records ?? d?.data ?? d?.list ?? d?.records ?? d;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    for (const k of ['list', 'gameslist', 'records', 'history', 'data', 'items']) {
      if (Array.isArray(raw[k])) return raw[k];
    }
  }
  return [];
}

export async function fetchLiveWingoIssues(_mode: GameCycle = '1m'): Promise<HistoryIssue[]> {
  const urlWithTs = `${API_ENDPOINT}?ts=${Date.now()}`;

  for (const proxy of PROXIES) {
    try {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeout = ctl ? setTimeout(() => ctl.abort(), 4500) : null;

      const res = await fetch(proxy(urlWithTs), {
        cache: 'no-store',
        headers: { Accept: 'application/json, text/plain, */*' },
        signal: ctl ? ctl.signal : undefined,
      });

      if (timeout) clearTimeout(timeout);
      if (!res.ok) continue;

      const json = await res.json();
      const rawList = normalizePayload(json);

      if (rawList && rawList.length > 0) {
        const parsed: HistoryIssue[] = [];
        for (const item of rawList) {
          const rawNum = item?.number ?? item?.openCode ?? item?.winNumber ?? item?.result ?? item?.num;
          const issueStr = String(item?.issueNumber ?? item?.issue ?? item?.periodNumber ?? item?.period ?? item?.id ?? '');
          const number = parseInt(rawNum, 10);
          if (!Number.isFinite(number) || !issueStr) continue;

          const size: 'BIG' | 'SMALL' = number >= 5 ? 'BIG' : 'SMALL';
          let color: 'RED' | 'GREEN' | 'VIOLET' = [0, 2, 4, 6, 8].includes(number) ? 'RED' : 'GREEN';
          if (number === 0 || number === 5) {
            color = 'VIOLET';
          }

          parsed.push({
            issue: issueStr,
            number,
            size,
            color,
            timestamp: Date.now(),
          });
        }

        if (parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Try next proxy
    }
  }

  // Fallback simulator generator if offline or proxy restricted
  return generateSimulatedFallback(_mode);
}

/**
 * Deterministic PRNG Hash for any Wingo Issue Period
 * Guarantees that EVERY device worldwide sees the EXACT SAME number for any given round!
 */
export function getDeterministicNumberForPeriod(periodStr: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < periodStr.length; i++) {
    h ^= periodStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = h ^ (h >>> 16);
  return Math.abs(h) % 10;
}

function generateSimulatedFallback(_mode: GameCycle = '1m'): HistoryIssue[] {
  const now = new Date();
  const ymd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
  // Minute index in UTC: 0 to 1439
  const currentPeriodIndex = now.getUTCHours() * 60 + now.getUTCMinutes();
  const durSec = 60;

  const issues: HistoryIssue[] = [];

  for (let i = 0; i < 30; i++) {
    let pIdx = currentPeriodIndex - i;
    let targetYmd = ymd;
    if (pIdx < 1) {
      pIdx += 1440;
      // Preceding UTC day
      const yesterday = new Date(Date.now() - 86400000);
      targetYmd = `${yesterday.getUTCFullYear()}${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}${String(yesterday.getUTCDate()).padStart(2, '0')}`;
    }

    const periodNum = String(pIdx).padStart(4, '0');
    const issue = `${targetYmd}${periodNum}`;
    const number = getDeterministicNumberForPeriod(issue);

    const size: 'BIG' | 'SMALL' = number >= 5 ? 'BIG' : 'SMALL';
    let color: 'RED' | 'GREEN' | 'VIOLET' = [0, 2, 4, 6, 8].includes(number) ? 'RED' : 'GREEN';
    if (number === 0 || number === 5) color = 'VIOLET';

    issues.push({
      issue,
      number,
      size,
      color,
      timestamp: Date.now() - i * durSec * 1000,
    });
  }

  return issues;
}

export function computeNextPeriod(currentLatestIssue: string, _mode: GameCycle = '1m'): string {
  try {
    if (!currentLatestIssue) {
      const now = new Date();
      const ymd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
      const nextIdx = now.getUTCHours() * 60 + now.getUTCMinutes() + 1;
      return `${ymd}${String(nextIdx).padStart(4, '0')}`;
    }
    return (BigInt(currentLatestIssue) + 1n).toString();
  } catch {
    return String(Number(currentLatestIssue || '1000') + 1);
  }
}
