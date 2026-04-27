import { supabase, isSupabaseConfigured } from '../supabase';
import type { Account } from '../../models/account';
import { accounts as localAccounts } from '../../data/accounts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id ?? null,
    childIds: row.child_ids ?? [],
    region: row.region,
    status: row.status,
  };
}

export async function getAll(): Promise<Account[]> {
  if (!isSupabaseConfigured()) return localAccounts;

  const { data, error } = await supabase!.from('accounts').select('*');
  if (error || !data) return localAccounts;

  return data.map(mapRowToAccount);
}

export async function getById(id: string): Promise<Account | undefined> {
  if (!isSupabaseConfigured()) return localAccounts.find((a) => a.id === id);

  const { data, error } = await supabase!.from('accounts').select('*').eq('id', id).single();
  if (error || !data) return localAccounts.find((a) => a.id === id);

  return mapRowToAccount(data);
}
