import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock state (runs before any imports) ---
const { mockState, mockFrom, mockQueryBuilder, mockAuth } = vi.hoisted(() => {
  const state = { data: null as unknown, error: null as unknown, configured: true };
  const makeThenable = (obj: Record<string, unknown>) =>
    Object.assign(obj, {
      then: (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
        Promise.resolve({ data: state.data, error: state.error }).then(res, rej),
    });
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  qb.eq = vi.fn().mockImplementation(() => makeThenable(qb));
  qb.single = vi.fn().mockImplementation(() => Promise.resolve({ data: state.data, error: state.error }));
  qb.select = vi.fn().mockImplementation(() => makeThenable(qb));
  qb.insert = vi.fn().mockImplementation(() => makeThenable(qb));
  qb.update = vi.fn().mockImplementation(() => makeThenable(qb));
  qb.delete = vi.fn().mockImplementation(() => makeThenable(qb));
  qb.upsert = vi.fn().mockImplementation(() => makeThenable(qb));
  const from = vi.fn().mockImplementation(() => makeThenable(qb));
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }) };
  return { mockState: state, mockFrom: from, mockQueryBuilder: qb, mockAuth: auth };
});

vi.mock('../../supabase', () => ({
  supabase: { from: mockFrom, auth: mockAuth },
  isSupabaseConfigured: () => mockState.configured,
}));

import * as accountsAdapter from '../accounts-adapter';
import { accounts as localAccounts } from '../../../data/accounts';

function setResponse(data: unknown, error: unknown = null) {
  mockState.data = data;
  mockState.error = error;
}

function resetMocks() {
  mockState.data = null;
  mockState.error = null;
  mockState.configured = true;
  vi.clearAllMocks();
  // Re-wire after clearAllMocks
  const makeThenable = (obj: Record<string, unknown>) =>
    Object.assign(obj, {
      then: (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
        Promise.resolve({ data: mockState.data, error: mockState.error }).then(res, rej),
    });
  mockQueryBuilder.eq.mockImplementation(() => makeThenable(mockQueryBuilder));
  mockQueryBuilder.single.mockImplementation(() => Promise.resolve({ data: mockState.data, error: mockState.error }));
  mockQueryBuilder.select.mockImplementation(() => makeThenable(mockQueryBuilder));
  mockQueryBuilder.insert.mockImplementation(() => makeThenable(mockQueryBuilder));
  mockQueryBuilder.update.mockImplementation(() => makeThenable(mockQueryBuilder));
  mockQueryBuilder.delete.mockImplementation(() => makeThenable(mockQueryBuilder));
  mockFrom.mockImplementation(() => makeThenable(mockQueryBuilder));
  mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

describe('accounts-adapter', () => {
  beforeEach(() => resetMocks());

  describe('Supabase mode', () => {
    it('getAll fetches from Supabase and maps snake_case to camelCase', async () => {
      setResponse([
        { id: 'acc-1', name: 'Acme', parent_id: null, child_ids: ['acc-2'], region: 'NZ', status: 'active' },
        { id: 'acc-2', name: 'Sub', parent_id: 'acc-1', child_ids: [], region: 'AU', status: 'inactive' },
      ]);
      const result = await accountsAdapter.getAll();
      expect(mockFrom).toHaveBeenCalledWith('accounts');
      expect(result).toEqual([
        { id: 'acc-1', name: 'Acme', parentId: null, childIds: ['acc-2'], region: 'NZ', status: 'active' },
        { id: 'acc-2', name: 'Sub', parentId: 'acc-1', childIds: [], region: 'AU', status: 'inactive' },
      ]);
    });

    it('getAll falls back to local data on Supabase error', async () => {
      setResponse(null, { message: 'Network error' });
      const result = await accountsAdapter.getAll();
      expect(result).toBe(localAccounts);
    });

    it('getById fetches single row from Supabase', async () => {
      setResponse({ id: 'acc-1', name: 'Acme', parent_id: null, child_ids: [], region: 'NZ', status: 'active' });
      const result = await accountsAdapter.getById('acc-1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'acc-1');
      expect(result).toEqual({ id: 'acc-1', name: 'Acme', parentId: null, childIds: [], region: 'NZ', status: 'active' });
    });

    it('getById falls back to local data on error', async () => {
      setResponse(null, { message: 'Not found' });
      const result = await accountsAdapter.getById(localAccounts[0].id);
      expect(result).toEqual(localAccounts[0]);
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { mockState.configured = false; });

    it('getAll returns local accounts', async () => {
      const result = await accountsAdapter.getAll();
      expect(result).toBe(localAccounts);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('getById returns matching local account', async () => {
      const result = await accountsAdapter.getById(localAccounts[0].id);
      expect(result).toEqual(localAccounts[0]);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('getById returns undefined for unknown id', async () => {
      const result = await accountsAdapter.getById('nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
