import { describe, it, expect, vi, beforeEach } from 'vitest';

const { s, from, qb, auth } = vi.hoisted(() => {
  const s = { data: null as unknown, error: null as unknown, configured: true };
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  qb.eq = vi.fn().mockImplementation(() => t(qb)); qb.single = vi.fn().mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select = vi.fn().mockImplementation(() => t(qb)); qb.insert = vi.fn().mockImplementation(() => t(qb));
  qb.update = vi.fn().mockImplementation(() => t(qb)); qb.delete = vi.fn().mockImplementation(() => t(qb));
  const from = vi.fn().mockImplementation(() => t(qb));
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }) };
  return { s, from, qb, auth };
});

vi.mock('../../supabase', () => ({ supabase: { from, auth }, isSupabaseConfigured: () => s.configured }));

import * as adapter from '../segments-adapter';
import { segments as localSegments } from '../../../data/segments';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true; vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

const row = { id: 'seg-1', name: 'Gold Members', account_id: 'acc-1', type: 'smart', root_group: { combinator: 'AND', rules: [] }, member_count: 42 };
const seg = { id: 'seg-1', name: 'Gold Members', accountId: 'acc-1', type: 'smart' as const, rootGroup: { combinator: 'AND', rules: [] }, memberCount: 42 };

describe('segments-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getAll fetches and maps rows', async () => {
      set([row]);
      expect(await adapter.getAll()).toEqual([seg]);
      expect(from).toHaveBeenCalledWith('segments');
    });

    it('getAll falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAll()).toBe(localSegments);
    });

    it('add inserts with modified_by', async () => {
      set(row);
      expect(await adapter.add(seg)).toEqual(seg);
      expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({ id: 'seg-1', modified_by: 'test-user-id' }));
    });

    it('update sends partial row with modified_by', async () => {
      set({ ...row, name: 'Platinum' });
      const result = await adapter.update('seg-1', { name: 'Platinum' });
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Platinum', modified_by: 'test-user-id' }));
      expect(result.name).toBe('Platinum');
    });

    it('del deletes by id', async () => {
      set(null);
      await adapter.del('seg-1');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('id', 'seg-1');
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getAll returns local segments', async () => {
      expect(await adapter.getAll()).toBe(localSegments);
      expect(from).not.toHaveBeenCalled();
    });

    it('add returns segment as-is', async () => {
      expect(await adapter.add(seg)).toBe(seg);
    });

    it('update returns partial merge', async () => {
      const result = await adapter.update('seg-1', { name: 'Updated' });
      expect(result.id).toBe('seg-1');
      expect(result.name).toBe('Updated');
    });

    it('del is a no-op', async () => {
      await adapter.del('seg-1');
      expect(from).not.toHaveBeenCalled();
    });
  });
});
