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

import * as adapter from '../campaigns-adapter';
import { campaigns as localCampaigns, journeys as localJourneys } from '../../../data/campaigns';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true; vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

const cmpRow = { id: 'cmp-1', name: 'Summer', account_id: 'acc-1', goal: 'Engage', date_range: { start: '2024-06-01', end: '2024-08-31' }, status: 'active', journey_ids: ['j-1'], tags: ['summer'] };
const jRow = { id: 'j-1', name: 'Welcome', campaign_id: 'cmp-1', account_id: 'acc-1', status: 'draft', node_count: 3, entry_count: 100, type: 'welcome' };

describe('campaigns-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getAllCampaigns fetches and maps rows', async () => {
      set([cmpRow]);
      const result = await adapter.getAllCampaigns();
      expect(from).toHaveBeenCalledWith('campaigns');
      expect(result[0].accountId).toBe('acc-1');
      expect(result[0].journeyIds).toEqual(['j-1']);
    });

    it('getAllCampaigns falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAllCampaigns()).toBe(localCampaigns);
    });

    it('getAllJourneys fetches with specific columns', async () => {
      set([jRow]);
      const result = await adapter.getAllJourneys();
      expect(from).toHaveBeenCalledWith('journeys');
      expect(qb.select).toHaveBeenCalledWith('id, name, campaign_id, account_id, status, node_count, entry_count, type');
      expect(result[0].campaignId).toBe('cmp-1');
      expect(result[0].nodeCount).toBe(3);
    });

    it('getAllJourneys falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await adapter.getAllJourneys()).toBe(localJourneys);
    });

    it('addCampaign inserts with modified_by', async () => {
      set(cmpRow);
      const campaign = { id: 'cmp-1', name: 'Summer', accountId: 'acc-1', goal: 'Engage', dateRange: { start: '2024-06-01', end: '2024-08-31' }, status: 'active' as const, journeyIds: ['j-1'], tags: ['summer'] };
      const result = await adapter.addCampaign(campaign);
      expect(qb.insert).toHaveBeenCalledWith(expect.objectContaining({ account_id: 'acc-1', modified_by: 'test-user-id' }));
      expect(result.id).toBe('cmp-1');
    });

    it('updateCampaign sends partial row', async () => {
      set({ ...cmpRow, name: 'Winter' });
      const result = await adapter.updateCampaign('cmp-1', { name: 'Winter' });
      expect(qb.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Winter', modified_by: 'test-user-id' }));
      expect(result.name).toBe('Winter');
    });

    it('deleteCampaign deletes child journeys then campaign', async () => {
      set(null);
      await adapter.deleteCampaign('cmp-1');
      expect(from).toHaveBeenCalledWith('journeys');
      expect(from).toHaveBeenCalledWith('campaigns');
    });

    it('addJourney inserts journey and updates parent campaign', async () => {
      set(jRow);
      const journey = { id: 'j-1', name: 'Welcome', campaignId: 'cmp-1', accountId: 'acc-1', status: 'draft' as const, nodeCount: 3, entryCount: 100, type: 'welcome' as const };
      const result = await adapter.addJourney(journey);
      expect(from).toHaveBeenCalledWith('journeys');
      expect(from).toHaveBeenCalledWith('campaigns');
      expect(result.id).toBe('j-1');
    });

    it('deleteJourney removes journey and updates parent campaign', async () => {
      set({ campaign_id: 'cmp-1', journey_ids: ['j-1', 'j-2'] });
      await adapter.deleteJourney('j-1');
      expect(from).toHaveBeenCalledWith('journeys');
      expect(from).toHaveBeenCalledWith('campaigns');
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getAllCampaigns returns local campaigns', async () => {
      expect(await adapter.getAllCampaigns()).toBe(localCampaigns);
      expect(from).not.toHaveBeenCalled();
    });

    it('getAllJourneys returns local journeys', async () => {
      expect(await adapter.getAllJourneys()).toBe(localJourneys);
    });

    it('addCampaign returns campaign as-is', async () => {
      const c = { id: 'cmp-1' } as never;
      expect(await adapter.addCampaign(c)).toBe(c);
    });

    it('deleteCampaign is a no-op', async () => {
      await adapter.deleteCampaign('cmp-1');
      expect(from).not.toHaveBeenCalled();
    });

    it('addJourney returns journey as-is', async () => {
      const j = { id: 'j-1' } as never;
      expect(await adapter.addJourney(j)).toBe(j);
    });

    it('deleteJourney is a no-op', async () => {
      await adapter.deleteJourney('j-1');
      expect(from).not.toHaveBeenCalled();
    });
  });
});
