import { supabase, isSupabaseConfigured } from '../supabase';
import type { Asset } from '../../models/asset';
import { seedAssets } from '../../data/assets';

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToAsset(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    scope: row.scope,
    accountId: row.account_id,
    campaignId: row.campaign_id ?? null,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    colourValue: row.colour_value ?? undefined,
  };
}

function mapAssetToRow(asset: Omit<Asset, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) {
  return {
    ...(asset.id ? { id: asset.id } : {}),
    name: asset.name,
    type: asset.type,
    scope: asset.scope,
    account_id: asset.accountId,
    campaign_id: asset.campaignId ?? null,
    tags: asset.tags,
    ...(asset.createdAt ? { created_at: asset.createdAt } : {}),
    colour_value: asset.colourValue ?? null,
  };
}

export async function getAll(): Promise<Asset[]> {
  if (!isSupabaseConfigured()) return seedAssets;

  const { data, error } = await supabase!.from('assets').select('*');
  if (error || !data) return seedAssets;

  return data.map(mapRowToAsset);
}

export async function add(asset: Omit<Asset, 'id' | 'createdAt'>): Promise<Asset> {
  if (!isSupabaseConfigured()) {
    return { ...asset, id: `asset-${Date.now()}`, createdAt: new Date().toISOString() } as Asset;
  }

  const userId = await getCurrentUserId();
  const row = { ...mapAssetToRow(asset), modified_by: userId };

  const { data, error } = await supabase!.from('assets').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add asset');

  return mapRowToAsset(data);
}

export async function update(id: string, updates: Partial<Asset>): Promise<Asset> {
  if (!isSupabaseConfigured()) return { id, ...updates } as Asset;

  const userId = await getCurrentUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = { modified_by: userId };
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.scope !== undefined) row.scope = updates.scope;
  if (updates.accountId !== undefined) row.account_id = updates.accountId;
  if (updates.campaignId !== undefined) row.campaign_id = updates.campaignId ?? null;
  if (updates.tags !== undefined) row.tags = updates.tags;
  if (updates.colourValue !== undefined) row.colour_value = updates.colourValue ?? null;

  const { data, error } = await supabase!.from('assets').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update asset');

  return mapRowToAsset(data);
}

export async function del(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!.from('assets').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
