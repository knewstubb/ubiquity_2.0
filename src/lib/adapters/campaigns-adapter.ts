import { supabase, isSupabaseConfigured } from '../supabase';
import type { Campaign, Journey } from '../../models/campaign';
import { campaigns as localCampaigns, journeys as localJourneys } from '../../data/campaigns';

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToCampaign(row: any): Campaign {
  return {
    id: row.id,
    name: row.name,
    accountId: row.account_id,
    goal: row.goal,
    dateRange: row.date_range,
    status: row.status,
    journeyIds: row.journey_ids ?? [],
    tags: row.tags ?? [],
  };
}

function mapCampaignToRow(campaign: Campaign) {
  return {
    id: campaign.id,
    name: campaign.name,
    account_id: campaign.accountId,
    goal: campaign.goal,
    date_range: campaign.dateRange,
    status: campaign.status,
    journey_ids: campaign.journeyIds,
    tags: campaign.tags,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToJourney(row: any): Journey {
  return {
    id: row.id,
    name: row.name,
    campaignId: row.campaign_id,
    accountId: row.account_id,
    status: row.status,
    nodeCount: row.node_count,
    entryCount: row.entry_count,
    type: row.type,
  };
}

function mapJourneyToRow(journey: Journey) {
  return {
    id: journey.id,
    name: journey.name,
    campaign_id: journey.campaignId,
    account_id: journey.accountId,
    status: journey.status,
    node_count: journey.nodeCount,
    entry_count: journey.entryCount,
    type: journey.type,
  };
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  if (!isSupabaseConfigured()) return localCampaigns;

  const { data, error } = await supabase!.from('campaigns').select('*');
  if (error || !data) return localCampaigns;

  return data.map(mapRowToCampaign);
}

export async function getAllJourneys(): Promise<Journey[]> {
  if (!isSupabaseConfigured()) return localJourneys;

  const { data, error } = await supabase!.from('journeys').select('id, name, campaign_id, account_id, status, node_count, entry_count, type');
  if (error || !data) return localJourneys;

  return data.map(mapRowToJourney);
}

export async function addCampaign(campaign: Campaign): Promise<Campaign> {
  if (!isSupabaseConfigured()) return campaign;

  const userId = await getCurrentUserId();
  const row = { ...mapCampaignToRow(campaign), modified_by: userId };

  const { data, error } = await supabase!.from('campaigns').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add campaign');

  return mapRowToCampaign(data);
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
  if (!isSupabaseConfigured()) return { id, ...updates } as Campaign;

  const userId = await getCurrentUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = { modified_by: userId };
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.accountId !== undefined) row.account_id = updates.accountId;
  if (updates.goal !== undefined) row.goal = updates.goal;
  if (updates.dateRange !== undefined) row.date_range = updates.dateRange;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.journeyIds !== undefined) row.journey_ids = updates.journeyIds;
  if (updates.tags !== undefined) row.tags = updates.tags;

  const { data, error } = await supabase!.from('campaigns').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update campaign');

  return mapRowToCampaign(data);
}

export async function deleteCampaign(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Delete child journeys first
  await supabase!.from('journeys').delete().eq('campaign_id', id);
  const { error } = await supabase!.from('campaigns').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addJourney(journey: Journey): Promise<Journey> {
  if (!isSupabaseConfigured()) return journey;

  const userId = await getCurrentUserId();
  const row = { ...mapJourneyToRow(journey), modified_by: userId };

  const { data, error } = await supabase!.from('journeys').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add journey');

  // Update parent campaign's journey_ids
  const { data: campaign } = await supabase!.from('campaigns').select('journey_ids').eq('id', journey.campaignId).single();
  if (campaign) {
    const journeyIds = [...(campaign.journey_ids ?? []), journey.id];
    await supabase!.from('campaigns').update({ journey_ids: journeyIds, modified_by: userId }).eq('id', journey.campaignId);
  }

  return mapRowToJourney(data);
}

export async function updateJourney(id: string, updates: Partial<Journey>): Promise<Journey> {
  if (!isSupabaseConfigured()) return { id, ...updates } as Journey;

  const userId = await getCurrentUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = { modified_by: userId };
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.campaignId !== undefined) row.campaign_id = updates.campaignId;
  if (updates.accountId !== undefined) row.account_id = updates.accountId;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.nodeCount !== undefined) row.node_count = updates.nodeCount;
  if (updates.entryCount !== undefined) row.entry_count = updates.entryCount;
  if (updates.type !== undefined) row.type = updates.type;

  const { data, error } = await supabase!.from('journeys').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update journey');

  return mapRowToJourney(data);
}

export async function deleteJourney(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  // Get the journey to find its parent campaign
  const { data: journey } = await supabase!.from('journeys').select('campaign_id').eq('id', id).single();

  const { error } = await supabase!.from('journeys').delete().eq('id', id);
  if (error) throw new Error(error.message);

  // Update parent campaign's journey_ids
  if (journey) {
    const userId = await getCurrentUserId();
    const { data: campaign } = await supabase!.from('campaigns').select('journey_ids').eq('id', journey.campaign_id).single();
    if (campaign) {
      const journeyIds = (campaign.journey_ids ?? []).filter((jid: string) => jid !== id);
      await supabase!.from('campaigns').update({ journey_ids: journeyIds, modified_by: userId }).eq('id', journey.campaign_id);
    }
  }
}
