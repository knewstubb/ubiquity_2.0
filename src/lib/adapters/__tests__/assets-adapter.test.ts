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

import * as adapter from '../assets-adapter';
import { seedAssets } from '../../../data/assets';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true; vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

const row = { id: 'asset-1', name: 'Logo', type: 'image', scope: 'global', account_id: 'acc-1', campaign_id: null, tags: ['branding'], created_at: '2024-01-01T00:00:00Z', colour_value: null };

describe('assets-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getAll fetches and maps rows', async () => {
      set([row]);
      const result = await adapter.getAll();
      expect(from).toHaveBeenCalledWith('assets');
      expect(result[0].accountId).toBe('acc-1');
      expect(result[0].tags).toEqual(['branding']);
    });

    it('getAll falls back to seed data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAll()).toBe(seedAssets);
    });

    it('add inserts with modified_by', async () => {
      set(row);
      const result = await adapter.add({ name: 'Logo', type: 'image', scope: 'global', accountId: 'acc-1', campaignId: null, tags: ['branding'] });
      expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({ modified_by: 'test-user-id' }));
      expect(result.id).toBe('asset-1');
    });

    it('add throws on error', async () => {
      set(null, { message: 'Insert failed' });
      await expect(adapter.add({ name: 'Logo', type: 'image', scope: 'global', accountId: 'acc-1', campaignId: null, tags: [] })).rejects.toThrow('Insert failed');
    });

    it('update sends partial row with modified_by', async () => {
      set({ ...row, name: 'New Logo' });
      const result = await adapter.update('asset-1', { name: 'New Logo' });
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Logo', modified_by: 'test-user-id' }));
      expect(result.name).toBe('New Logo');
    });

    it('del deletes by id', async () => {
      set(null);
      await adapter.del('asset-1');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('id', 'asset-1');
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getAll returns seed assets', async () => {
      expect(await adapter.getAll()).toBe(seedAssets);
      expect(from).not.toHaveBeenCalled();
    });

    it('add returns asset with generated id and createdAt', async () => {
      const result = await adapter.add({ name: 'Logo', type: 'image', scope: 'global', accountId: 'acc-1', campaignId: null, tags: [] });
      expect(result.id).toMatch(/^asset-/);
      expect(result.createdAt).toBeDefined();
    });

    it('update returns partial merge', async () => {
      const result = await adapter.update('asset-1', { name: 'Updated' });
      expect(result.id).toBe('asset-1');
      expect(result.name).toBe('Updated');
    });

    it('del is a no-op', async () => {
      await adapter.del('asset-1');
      expect(from).not.toHaveBeenCalled();
    });
  });
});
