import { supabase, isSupabaseConfigured } from '../supabase';
import type { Segment } from '../../models/segment';
import { segments as localSegments } from '../../data/segments';

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToSegment(row: any): Segment {
  return {
    id: row.id,
    name: row.name,
    accountId: row.account_id,
    type: row.type,
    rootGroup: row.root_group,
    memberCount: row.member_count,
  };
}

function mapSegmentToRow(segment: Segment) {
  return {
    id: segment.id,
    name: segment.name,
    account_id: segment.accountId,
    type: segment.type,
    root_group: segment.rootGroup,
    member_count: segment.memberCount,
  };
}

export async function getAll(): Promise<Segment[]> {
  if (!isSupabaseConfigured()) return localSegments;

  const { data, error } = await supabase!.from('segments').select('*');
  if (error || !data) return localSegments;

  return data.map(mapRowToSegment);
}

export async function add(segment: Segment): Promise<Segment> {
  if (!isSupabaseConfigured()) return segment;

  const userId = await getCurrentUserId();
  const row = { ...mapSegmentToRow(segment), modified_by: userId };

  const { data, error } = await supabase!.from('segments').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add segment');

  return mapRowToSegment(data);
}

export async function update(id: string, updates: Partial<Segment>): Promise<Segment> {
  if (!isSupabaseConfigured()) return { id, ...updates } as Segment;

  const userId = await getCurrentUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = { modified_by: userId };
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.accountId !== undefined) row.account_id = updates.accountId;
  if (updates.type !== undefined) row.type = updates.type;
  if (updates.rootGroup !== undefined) row.root_group = updates.rootGroup;
  if (updates.memberCount !== undefined) row.member_count = updates.memberCount;

  const { data, error } = await supabase!.from('segments').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update segment');

  return mapRowToSegment(data);
}

export async function del(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!.from('segments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
