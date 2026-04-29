import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSession, loadSession, clearSession, type SessionState } from '../session-store';

describe('SessionStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const userId = 'user-1';
  const storageKey = `ubiquity-session-${userId}`;

  const fullState: SessionState = {
    selectedAccountId: 'acc-1',
    selectedRootAccountId: 'root-1',
    activeFilters: { campaignTags: ['promo'], assetTypeFilter: 'image' },
    openPanels: ['feedback', 'inspector'],
    simulatedRole: 'marketer',
    lastRoute: '/automations/campaigns',
  };

  // --- saveSession / loadSession round-trip ---

  it('saves and loads session data keyed by user ID', () => {
    saveSession(userId, fullState);
    const loaded = loadSession(userId);
    expect(loaded).toEqual(fullState);
  });

  it('stores data in localStorage under the correct key', () => {
    saveSession(userId, { selectedAccountId: 'acc-2' });
    const raw = localStorage.getItem(storageKey);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).selectedAccountId).toBe('acc-2');
  });

  it('isolates sessions between different user IDs', () => {
    saveSession('user-a', { selectedAccountId: 'acc-a' });
    saveSession('user-b', { selectedAccountId: 'acc-b' });
    expect(loadSession('user-a')?.selectedAccountId).toBe('acc-a');
    expect(loadSession('user-b')?.selectedAccountId).toBe('acc-b');
  });

  // --- loadSession ---

  it('returns null when no session exists', () => {
    expect(loadSession(userId)).toBeNull();
  });

  // --- clearSession ---

  it('removes stored session for the user', () => {
    saveSession(userId, fullState);
    expect(loadSession(userId)).not.toBeNull();
    clearSession(userId);
    expect(loadSession(userId)).toBeNull();
  });

  it('does not affect other users when clearing', () => {
    saveSession('user-a', { selectedAccountId: 'acc-a' });
    saveSession('user-b', { selectedAccountId: 'acc-b' });
    clearSession('user-a');
    expect(loadSession('user-a')).toBeNull();
    expect(loadSession('user-b')?.selectedAccountId).toBe('acc-b');
  });

  // --- Partial merge ---

  it('merges partial updates into existing state', () => {
    saveSession(userId, fullState);
    saveSession(userId, { simulatedRole: 'viewer' });
    const loaded = loadSession(userId);
    expect(loaded?.simulatedRole).toBe('viewer');
    // Other fields preserved
    expect(loaded?.selectedAccountId).toBe('acc-1');
    expect(loaded?.openPanels).toEqual(['feedback', 'inspector']);
    expect(loaded?.lastRoute).toBe('/automations/campaigns');
  });

  it('provides defaults when saving partial state with no prior session', () => {
    saveSession(userId, { lastRoute: '/dashboard' });
    const loaded = loadSession(userId);
    expect(loaded).not.toBeNull();
    expect(loaded?.lastRoute).toBe('/dashboard');
    expect(loaded?.selectedAccountId).toBe('');
    expect(loaded?.selectedRootAccountId).toBeNull();
    expect(loaded?.simulatedRole).toBe('admin');
    expect(loaded?.openPanels).toEqual([]);
  });

  // --- selectedRootAccountId persistence ---

  it('stores null selectedRootAccountId as __all__ in localStorage', () => {
    saveSession(userId, { selectedRootAccountId: null });
    const raw = localStorage.getItem(storageKey);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).selectedRootAccountId).toBe('__all__');
  });

  it('loads __all__ from localStorage as null selectedRootAccountId', () => {
    saveSession(userId, { selectedRootAccountId: null });
    const loaded = loadSession(userId);
    expect(loaded?.selectedRootAccountId).toBeNull();
  });

  it('round-trips a specific root account ID', () => {
    saveSession(userId, { selectedRootAccountId: 'acc-master' });
    const loaded = loadSession(userId);
    expect(loaded?.selectedRootAccountId).toBe('acc-master');
  });

  it('round-trips null selectedRootAccountId (All Accounts Mode)', () => {
    saveSession(userId, { selectedRootAccountId: null });
    const loaded = loadSession(userId);
    expect(loaded?.selectedRootAccountId).toBeNull();
  });

  // --- Quota exceeded (silent failure) ---

  it('silently fails on localStorage quota exceeded', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    expect(() => saveSession(userId, fullState)).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });

  // --- Corrupted data ---

  it('returns null for corrupted localStorage data', () => {
    localStorage.setItem(storageKey, 'not-valid-json{{{');
    expect(loadSession(userId)).toBeNull();
  });
});
