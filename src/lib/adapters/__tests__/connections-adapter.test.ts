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

import * as adapter from '../connections-adapter';
import { connections as localConnections } from '../../../data/connections';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true; vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

const row = { id: 'conn-1', name: 'S3 Bucket', protocol: 'S3', status: 'connected', base_path: '/data', config: { region: 'us-east-1' } };
const conn = { id: 'conn-1', name: 'S3 Bucket', protocol: 'S3' as const, status: 'connected' as const, basePath: '/data', config: { region: 'us-east-1' } };

describe('connections-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getAll fetches and maps rows', async () => {
      set([row]);
      const result = await adapter.getAll();
      expect(from).toHaveBeenCalledWith('connections');
      expect(result).toEqual([conn]);
    });

    it('getAll falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAll()).toBe(localConnections);
    });

    it('add inserts with modified_by', async () => {
      set(row);
      const result = await adapter.add(conn);
      expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({ id: 'conn-1', modified_by: 'test-user-id' }));
      expect(result).toEqual(conn);
    });

    it('add throws on error', async () => {
      set(null, { message: 'Insert failed' });
      await expect(adapter.add(conn)).rejects.toThrow('Insert failed');
    });

    it('update sends partial row with modified_by', async () => {
      set({ ...row, name: 'Updated' });
      const result = await adapter.update('conn-1', { name: 'Updated' });
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated', modified_by: 'test-user-id' }));
      expect(result.name).toBe('Updated');
    });

    it('update throws on error', async () => {
      set(null, { message: 'Update failed' });
      await expect(adapter.update('conn-1', { name: 'x' })).rejects.toThrow('Update failed');
    });

    it('del deletes by id', async () => {
      set(null);
      await adapter.del('conn-1');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('id', 'conn-1');
    });

    it('del throws on error', async () => {
      set(null, { message: 'Delete failed' });
      await expect(adapter.del('conn-1')).rejects.toThrow('Delete failed');
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getAll returns local connections', async () => {
      expect(await adapter.getAll()).toBe(localConnections);
      expect(from).not.toHaveBeenCalled();
    });

    it('add returns connection as-is', async () => {
      expect(await adapter.add(conn)).toBe(conn);
    });

    it('update returns partial merge', async () => {
      const result = await adapter.update('conn-1', { name: 'Updated' });
      expect(result.id).toBe('conn-1');
      expect(result.name).toBe('Updated');
    });

    it('del is a no-op', async () => {
      await adapter.del('conn-1');
      expect(from).not.toHaveBeenCalled();
    });
  });
});
