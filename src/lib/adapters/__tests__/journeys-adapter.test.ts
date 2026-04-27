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

import * as adapter from '../journeys-adapter';
import { journeyDefinitions as localJourneyDefs } from '../../../data/journeySeeds';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true; vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

const jRow = {
  id: 'jd-1', name: 'Welcome Flow', campaign_id: 'cmp-1', account_id: 'acc-1',
  status: 'draft', node_count: 2, entry_count: 50, type: 'welcome',
  nodes: [{ id: 'n1', type: 'entry', data: {} }],
  edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  settings: { maxEntries: 100 },
};

const jDef = {
  id: 'jd-1', name: 'Welcome Flow', campaignId: 'cmp-1', accountId: 'acc-1',
  status: 'draft' as const, nodeCount: 2, entryCount: 50, type: 'welcome' as const,
  nodes: [{ id: 'n1', type: 'entry', data: {} }],
  edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  settings: { maxEntries: 100 },
};

describe('journeys-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getAll fetches and maps rows including JSONB columns', async () => {
      set([jRow]);
      const result = await adapter.getAll();
      expect(from).toHaveBeenCalledWith('journeys');
      expect(result[0].campaignId).toBe('cmp-1');
      expect(result[0].nodes).toEqual([{ id: 'n1', type: 'entry', data: {} }]);
      expect(result[0].settings).toEqual({ maxEntries: 100 });
    });

    it('getAll falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAll()).toBe(localJourneyDefs);
    });

    it('addJourney inserts with modified_by', async () => {
      set(jRow);
      const result = await adapter.addJourney(jDef as never);
      expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({ campaign_id: 'cmp-1', modified_by: 'test-user-id' }));
      expect(result.id).toBe('jd-1');
    });

    it('updateJourney sends partial row', async () => {
      set({ ...jRow, name: 'Updated' });
      const result = await adapter.updateJourney('jd-1', { name: 'Updated' });
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated', modified_by: 'test-user-id' }));
      expect(result.name).toBe('Updated');
    });

    it('deleteJourney deletes by id', async () => {
      set(null);
      await adapter.deleteJourney('jd-1');
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('id', 'jd-1');
    });

    it('updateNode fetches journey, updates node in JSONB, and saves', async () => {
      set({ nodes: [{ id: 'n1', type: 'entry', label: 'Old' }] });
      await adapter.updateNode('jd-1', 'n1', { label: 'New' } as never);
      expect(qb.select).toHaveBeenCalledWith('nodes');
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({
        nodes: [{ id: 'n1', type: 'entry', label: 'New' }], modified_by: 'test-user-id',
      }));
    });

    it('updateNode throws if node not found', async () => {
      set({ nodes: [{ id: 'n1' }] });
      await expect(adapter.updateNode('jd-1', 'n999', {})).rejects.toThrow('Node n999 not found');
    });

    it('addNode appends node to JSONB array', async () => {
      set({ nodes: [{ id: 'n1' }] });
      await adapter.addNode('jd-1', { id: 'n2', type: 'action' } as never);
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({
        nodes: [{ id: 'n1' }, { id: 'n2', type: 'action' }], modified_by: 'test-user-id',
      }));
    });

    it('removeNode filters node from JSONB array', async () => {
      set({ nodes: [{ id: 'n1' }, { id: 'n2' }] });
      await adapter.removeNode('jd-1', 'n1');
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({
        nodes: [{ id: 'n2' }], modified_by: 'test-user-id',
      }));
    });

    it('addEdge appends edge to JSONB array', async () => {
      set({ edges: [{ id: 'e1' }] });
      await adapter.addEdge('jd-1', { id: 'e2', source: 'n1', target: 'n3' } as never);
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({
        edges: [{ id: 'e1' }, { id: 'e2', source: 'n1', target: 'n3' }], modified_by: 'test-user-id',
      }));
    });

    it('removeEdge filters edge from JSONB array', async () => {
      set({ edges: [{ id: 'e1' }, { id: 'e2' }] });
      await adapter.removeEdge('jd-1', 'e1');
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({
        edges: [{ id: 'e2' }], modified_by: 'test-user-id',
      }));
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getAll returns local journey definitions', async () => {
      expect(await adapter.getAll()).toBe(localJourneyDefs);
      expect(from).not.toHaveBeenCalled();
    });

    it('addJourney returns journey as-is', async () => {
      expect(await adapter.addJourney(jDef as never)).toBe(jDef);
    });

    it('deleteJourney is a no-op', async () => {
      await adapter.deleteJourney('jd-1');
      expect(from).not.toHaveBeenCalled();
    });

    it('node/edge operations are no-ops', async () => {
      await adapter.updateNode('jd-1', 'n1', {});
      await adapter.addNode('jd-1', { id: 'n2' } as never);
      await adapter.removeNode('jd-1', 'n1');
      await adapter.addEdge('jd-1', { id: 'e2' } as never);
      await adapter.removeEdge('jd-1', 'e1');
      expect(from).not.toHaveBeenCalled();
    });
  });
});
