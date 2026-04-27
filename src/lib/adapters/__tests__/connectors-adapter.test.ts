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
vi.mock('../../../utils/filterMigration', () => ({ migrateFilters: vi.fn((v: unknown) => v) }));

import * as adapter from '../connectors-adapter';
import { migrateFilters } from '../../../utils/filterMigration';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true; vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

const row = {
  id: 'ctr-1', connection_id: 'conn-1', name: 'Daily Export', direction: 'export',
  data_type: 'contact', transactional_source: null, enrichment_key_field: null,
  selected_fields: ['email'], file_type: 'csv', format_options: { delimiter: ',' },
  file_naming_pattern: '{name}_{date}', schedule: 'daily',
  filters: { combinator: 'AND', rules: [] }, status: 'active',
  created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
};

describe('connectors-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getAll fetches, maps rows, and applies migrateFilters on read', async () => {
      set([row]);
      const result = await adapter.getAll();
      expect(from).toHaveBeenCalledWith('connectors');
      expect(migrateFilters).toHaveBeenCalledWith(row.filters);
      expect(result[0].connectionId).toBe('conn-1');
      expect(result[0].dataType).toBe('contact');
    });

    it('getAll returns empty array on error (no seed data)', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAll()).toEqual([]);
    });

    it('add inserts with modified_by', async () => {
      set(row);
      const connector = {
        id: 'ctr-1', connectionId: 'conn-1', name: 'Daily Export', direction: 'export' as const,
        dataType: 'contact', selectedFields: ['email'] as string[], fileType: 'csv' as const,
        formatOptions: { delimiter: ',' }, fileNamingPattern: '{name}_{date}',
        schedule: 'daily', filters: { combinator: 'AND' as const, rules: [] as never[], groups: [] as never[] },
        status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
      };
      const result = await adapter.add(connector);
      expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({ connection_id: 'conn-1', modified_by: 'test-user-id' }));
      expect(result.id).toBe('ctr-1');
    });

    it('update sends partial row with modified_by', async () => {
      set({ ...row, name: 'Updated' });
      const result = await adapter.update('ctr-1', { name: 'Updated' });
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated', modified_by: 'test-user-id' }));
      expect(result.name).toBe('Updated');
    });

    it('del deletes by id', async () => {
      set(null);
      await adapter.del('ctr-1');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('id', 'ctr-1');
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getAll returns empty array (no seed data)', async () => {
      expect(await adapter.getAll()).toEqual([]);
      expect(from).not.toHaveBeenCalled();
    });

    it('add returns connector as-is', async () => {
      const c = { id: 'ctr-1', name: 'Test' } as never;
      expect(await adapter.add(c)).toBe(c);
    });

    it('del is a no-op', async () => {
      await adapter.del('ctr-1');
      expect(from).not.toHaveBeenCalled();
    });
  });
});
