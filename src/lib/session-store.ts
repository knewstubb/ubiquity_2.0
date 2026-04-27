import type { FilterGroup } from '../models/segment';

export type SimulatedRole = 'admin' | 'marketer' | 'viewer';

export interface SessionState {
  selectedAccountId: string;
  activeFilters: {
    segmentFilters?: FilterGroup;
    campaignTags?: string[];
    assetTypeFilter?: string;
  };
  openPanels: string[];
  simulatedRole: SimulatedRole;
  lastRoute: string;
}

const STORAGE_PREFIX = 'ubiquity-session-';

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function saveSession(userId: string, state: Partial<SessionState>): void {
  try {
    const existing = loadSession(userId);
    const merged: SessionState = {
      ...(existing ?? {
        selectedAccountId: '',
        activeFilters: {},
        openPanels: [],
        simulatedRole: 'admin' as SimulatedRole,
        lastRoute: '',
      }),
      ...state,
    };
    localStorage.setItem(storageKey(userId), JSON.stringify(merged));
  } catch (e) {
    console.warn('session-store: failed to save session', e);
  }
}

export function loadSession(userId: string): SessionState | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function clearSession(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch (e) {
    console.warn('session-store: failed to clear session', e);
  }
}
