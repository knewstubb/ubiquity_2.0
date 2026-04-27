import { supabase, isSupabaseConfigured } from '../supabase';
import type { Connector } from '../../models/connector';
import { migrateFilters } from '../../utils/filterMigration';

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToConnector(row: any): Connector {
  return {
    id: row.id,
    connectionId: row.connection_id,
    name: row.name,
    direction: row.direction,
    dataType: row.data_type,
    transactionalSource: row.transactional_source ?? undefined,
    enrichmentKeyField: row.enrichment_key_field ?? undefined,
    selectedFields: row.selected_fields ?? [],
    fileType: row.file_type,
    formatOptions: row.format_options,
    fileNamingPattern: row.file_naming_pattern,
    schedule: row.schedule,
    filters: migrateFilters(row.filters),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapConnectorToRow(connector: Connector) {
  return {
    id: connector.id,
    connection_id: connector.connectionId,
    name: connector.name,
    direction: connector.direction,
    data_type: connector.dataType,
    transactional_source: connector.transactionalSource ?? null,
    enrichment_key_field: connector.enrichmentKeyField ?? null,
    selected_fields: connector.selectedFields,
    file_type: connector.fileType,
    format_options: connector.formatOptions,
    file_naming_pattern: connector.fileNamingPattern,
    schedule: connector.schedule,
    filters: connector.filters,
    status: connector.status,
    created_at: connector.createdAt,
    updated_at: connector.updatedAt,
  };
}

export async function getAll(): Promise<Connector[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase!.from('connectors').select('*');
  if (error || !data) return [];

  return data.map(mapRowToConnector);
}

export async function add(connector: Connector): Promise<Connector> {
  if (!isSupabaseConfigured()) return connector;

  const userId = await getCurrentUserId();
  const row = { ...mapConnectorToRow(connector), modified_by: userId };

  const { data, error } = await supabase!.from('connectors').insert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to add connector');

  return mapRowToConnector(data);
}

export async function update(id: string, updates: Partial<Connector>): Promise<Connector> {
  if (!isSupabaseConfigured()) return { id, ...updates } as Connector;

  const userId = await getCurrentUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = { modified_by: userId };
  if (updates.connectionId !== undefined) row.connection_id = updates.connectionId;
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.direction !== undefined) row.direction = updates.direction;
  if (updates.dataType !== undefined) row.data_type = updates.dataType;
  if (updates.transactionalSource !== undefined) row.transactional_source = updates.transactionalSource ?? null;
  if (updates.enrichmentKeyField !== undefined) row.enrichment_key_field = updates.enrichmentKeyField ?? null;
  if (updates.selectedFields !== undefined) row.selected_fields = updates.selectedFields;
  if (updates.fileType !== undefined) row.file_type = updates.fileType;
  if (updates.formatOptions !== undefined) row.format_options = updates.formatOptions;
  if (updates.fileNamingPattern !== undefined) row.file_naming_pattern = updates.fileNamingPattern;
  if (updates.schedule !== undefined) row.schedule = updates.schedule;
  if (updates.filters !== undefined) row.filters = updates.filters;
  if (updates.status !== undefined) row.status = updates.status;

  const { data, error } = await supabase!.from('connectors').update(row).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to update connector');

  return mapRowToConnector(data);
}

export async function del(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase!.from('connectors').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
