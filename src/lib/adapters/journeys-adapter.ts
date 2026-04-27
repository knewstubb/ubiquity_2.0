import { supabase, isSupabaseConfigured } from '../supabase';
import type { JourneyDefinition, JourneyNode, JourneyEdge } from '../../models/journey';
import { journeyDefinitions as localJourneyDefinitions } from '../../data/journeySeeds';

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToJourneyDefinition(row: any): JourneyDefinition {
  return {
    id: row.id,
    name: row.name,
    campaignId: row.campaign_id,
    accountId: row.account_id,
    status: row.status,
    nodeCount: row.node_count,
    entryCount: row.entry_count,
    type: row.type,
    nodes: row.nodes ?? [],
    edges: row.edges ?? [],
    settings: row.settings ?? {},
  };
}

function mapJourneyDefinitionToRow(journey: JourneyDefinition) {
  return {
    id: journey.id,
    name: journey.name,
    campaign_id: journey.campaignId,
    account_id: journey.accountId,
    status: journey.status,
    node_count: journey.nodeCount,
    entry_count: journey.entryCount,
    type: journey.type,
    nodes: journey.nodes,
    edges: journey.edges,
    settings: journey.settings,
  };
}

export async function getAll(): Promise<JourneyDefinition[]> {
  if (!isSupabaseConfigured()) return localJourneyDefinitions;

  const { data, error } = await supabase!.from('journeys').select('*');
  if (error || !data) return localJourneyDefinitions;

  return data.map(mapRowToJourneyDefinition);
}

export async function addJourney(journey: JourneyDefinition): Promise<JourneyDefinition> {
  if (!isSupabaseConfigured()) return journey;

  const userId = await getCurrentUserId();
  const row = { ...mapJourneyDefinitionToRow(journey), modified_by: userId };

  const { data, error } = await supabase!.from('journeys').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add journey definition');

  return mapRowToJourneyDefinition(data);
}

export async function updateJourney(id: string, updates: Partial<JourneyDefinition>): Promise<JourneyDefinition> {
  if (!isSupabaseConfigured()) return { id, ...updates } as JourneyDefinition;

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
  if (updates.nodes !== undefined) row.nodes = updates.nodes;
  if (updates.edges !== undefined) row.edges = updates.edges;
  if (updates.settings !== undefined) row.settings = updates.settings;

  const { data, error } = await supabase!.from('journeys').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update journey definition');

  return mapRowToJourneyDefinition(data);
}

export async function deleteJourney(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!.from('journeys').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateNode(journeyId: string, nodeId: string, updates: Partial<JourneyNode>): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: journey, error: fetchError } = await supabase!.from('journeys').select('nodes').eq('id', journeyId).single();
  if (fetchError || !journey) throw new Error(fetchError?.message ?? 'Journey not found');

  const nodes: JourneyNode[] = journey.nodes ?? [];
  const idx = nodes.findIndex((n: JourneyNode) => n.id === nodeId);
  if (idx === -1) throw new Error(`Node ${nodeId} not found in journey ${journeyId}`);

  nodes[idx] = { ...nodes[idx], ...updates };

  const userId = await getCurrentUserId();
  const { error } = await supabase!.from('journeys').update({ nodes, modified_by: userId }).eq('id', journeyId);
  if (error) throw new Error(error.message);
}

export async function addNode(journeyId: string, node: JourneyNode): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: journey, error: fetchError } = await supabase!.from('journeys').select('nodes').eq('id', journeyId).single();
  if (fetchError || !journey) throw new Error(fetchError?.message ?? 'Journey not found');

  const nodes: JourneyNode[] = [...(journey.nodes ?? []), node];

  const userId = await getCurrentUserId();
  const { error } = await supabase!.from('journeys').update({ nodes, modified_by: userId }).eq('id', journeyId);
  if (error) throw new Error(error.message);
}

export async function removeNode(journeyId: string, nodeId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: journey, error: fetchError } = await supabase!.from('journeys').select('nodes').eq('id', journeyId).single();
  if (fetchError || !journey) throw new Error(fetchError?.message ?? 'Journey not found');

  const nodes: JourneyNode[] = (journey.nodes ?? []).filter((n: JourneyNode) => n.id !== nodeId);

  const userId = await getCurrentUserId();
  const { error } = await supabase!.from('journeys').update({ nodes, modified_by: userId }).eq('id', journeyId);
  if (error) throw new Error(error.message);
}

export async function addEdge(journeyId: string, edge: JourneyEdge): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: journey, error: fetchError } = await supabase!.from('journeys').select('edges').eq('id', journeyId).single();
  if (fetchError || !journey) throw new Error(fetchError?.message ?? 'Journey not found');

  const edges: JourneyEdge[] = [...(journey.edges ?? []), edge];

  const userId = await getCurrentUserId();
  const { error } = await supabase!.from('journeys').update({ edges, modified_by: userId }).eq('id', journeyId);
  if (error) throw new Error(error.message);
}

export async function removeEdge(journeyId: string, edgeId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { data: journey, error: fetchError } = await supabase!.from('journeys').select('edges').eq('id', journeyId).single();
  if (fetchError || !journey) throw new Error(fetchError?.message ?? 'Journey not found');

  const edges: JourneyEdge[] = (journey.edges ?? []).filter((e: JourneyEdge) => e.id !== edgeId);

  const userId = await getCurrentUserId();
  const { error } = await supabase!.from('journeys').update({ edges, modified_by: userId }).eq('id', journeyId);
  if (error) throw new Error(error.message);
}
