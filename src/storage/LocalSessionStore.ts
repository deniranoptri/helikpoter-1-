import { SessionResultSnapshot } from '../engine/ScoreEngine';

const STORAGE_KEY = 'heli-rescue-results-v1';
const MAX_RECORDS = 500;
const CURRENT_VERSION = 1;

interface StorageEnvelope {
  version: number;
  results: SessionResultSnapshot[];
}

function isAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isValidRecord(record: any): record is SessionResultSnapshot {
  if (!record || typeof record !== 'object') return false;
  if (typeof record.sessionId !== 'string') return false;
  if (typeof record.timestamp !== 'number') return false;
  if (typeof record.jenjang !== 'string') return false;
  if (typeof record.mataPelajaran !== 'string') return false;
  if (typeof record.gameMode !== 'string') return false;
  if (typeof record.duration !== 'number') return false;
  if (!record.globalStats || typeof record.globalStats !== 'object') return false;
  if (!record.players || typeof record.players !== 'object') return false;
  if (typeof record.winner !== 'string') return false;
  return true;
}

export const LocalSessionStore = {
  save(snapshot: SessionResultSnapshot): void {
    if (!isAvailable()) return;

    try {
      const envelope = this._loadRaw();
      let results = envelope.results || [];

      // Remove any existing record with the same sessionId
      results = results.filter(r => r.sessionId !== snapshot.sessionId);

      // Prepend the new snapshot
      results.unshift(snapshot);

      // Limit to 500 records
      if (results.length > MAX_RECORDS) {
        results = results.slice(0, MAX_RECORDS);
      }

      envelope.results = results;
      
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch (err) {
      console.warn('[LocalSessionStore] Failed to save session snapshot:', err);
    }
  },

  load(): SessionResultSnapshot[] {
    if (!isAvailable()) return [];

    try {
      const envelope = this._loadRaw();
      if (envelope.version !== CURRENT_VERSION) return [];
      
      if (!Array.isArray(envelope.results)) return [];

      // Filter invalid records
      const validResults = envelope.results.filter(isValidRecord);
      
      return validResults;
    } catch (err) {
      console.warn('[LocalSessionStore] Failed to load session snapshots:', err);
      return [];
    }
  },

  remove(sessionId: string): void {
    if (!isAvailable()) return;

    try {
      const envelope = this._loadRaw();
      if (!Array.isArray(envelope.results)) return;

      envelope.results = envelope.results.filter(r => r.sessionId !== sessionId);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch (err) {
      console.warn('[LocalSessionStore] Failed to remove session snapshot:', err);
    }
  },

  clear(): void {
    if (!isAvailable()) return;

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[LocalSessionStore] Failed to clear session store:', err);
    }
  },

  _loadRaw(): StorageEnvelope {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: CURRENT_VERSION, results: [] };

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { version: CURRENT_VERSION, results: [] };
      return {
        version: typeof parsed.version === 'number' ? parsed.version : CURRENT_VERSION,
        results: Array.isArray(parsed.results) ? parsed.results : []
      };
    } catch (e) {
      return { version: CURRENT_VERSION, results: [] };
    }
  }
};
