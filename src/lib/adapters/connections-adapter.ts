import { supabase, isSupabaseConfigured } from '../supabase';
import type { Connection } from '../../models/connection';
import { connections as localConnections } from '../../data/connections';

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToConnection(row: any): Connection {
  return {
    id: row.id,
    name: row.name,
    protocol: row.protocol,
    status: row.status,
    basePath: row.base_path,
    accountId: row.account_id,
    config: row.config,
  };
}

function mapConnectionToRow(connection: Connection) {
  return {
    id: connection.id,
    name: connection.name,
    protocol: connection.protocol,
    status: connection.status,
    base_path: connection.basePath,
    account_id: connection.accountId,
    config: connection.config,
  };
}

export async function getAll(): Promise<Connection[]> {
  if (!isSupabaseConfigured()) return localConnections;

  const { data, error } = await supabase!.from('connections').select('*');
  if (error || !data) return localConnections;

  return data.map(mapRowToConnection);
}

export async function add(connection: Connection): Promise<Connection> {
  if (!isSupabaseConfigured()) return connection;

  const userId = await getCurrentUserId();
  const row = { ...mapConnectionToRow(connection), modified_by: userId };

  const { data, error } = await supabase!.from('connections').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add connection');

  return mapRowToConnection(data);
}

export async function update(id: string, updates: Partial<Connection>): Promise<Connection> {
  if (!isSupabaseConfigured()) return { id, ...updates } as Connection;

  const userId = await getCurrentUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = { modified_by: userId };
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.protocol !== undefined) row.protocol = updates.protocol;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.basePath !== undefined) row.base_path = updates.basePath;
  if (updates.accountId !== undefined) row.account_id = updates.accountId;
  if (updates.config !== undefined) row.config = updates.config;

  const { data, error } = await supabase!.from('connections').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update connection');

  return mapRowToConnection(data);
}

export async function del(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!.from('connections').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
