import type {
  SourceConfig,
  PrimarySourceType,
  EnrichmentEntity,
  EnrichmentConfig,
  Channel,
  ContactsSourceConfig,
  TransactionsSourceConfig,
  MessagesSourceConfig,
} from '../models/source-selection';
import { isSourceConfigComplete } from './source-selection-validation';
import { segments } from '../data/segments';
import { campaigns } from '../data/campaigns';
import { transactionalDatabases } from '../data/transactionalData';

// ─── Stale Reference Detection ──────────────────────────────────────────────

export interface StaleReference {
  field: string;
  type: 'segment' | 'campaign' | 'table';
  id: string;
}

// ─── Field Definition ────────────────────────────────────────────────────────

export interface SourceFieldDefinition {
  key: string;
  label: string;
  source: string;
}

// ─── Static field arrays per source type ─────────────────────────────────────

const CONTACTS_FIELDS: SourceFieldDefinition[] = [
  { key: 'contact_email', label: 'Email', source: 'contacts' },
  { key: 'contact_firstName', label: 'First Name', source: 'contacts' },
  { key: 'contact_lastName', label: 'Last Name', source: 'contacts' },
  { key: 'contact_createdAt', label: 'Created At', source: 'contacts' },
  { key: 'contact_status', label: 'Status', source: 'contacts' },
  { key: 'contact_phone', label: 'Phone', source: 'contacts' },
  { key: 'contact_segment', label: 'Segment', source: 'contacts' },
];

const TRANSACTIONS_FIELDS: SourceFieldDefinition[] = [
  { key: 'transaction_id', label: 'Transaction ID', source: 'transactions' },
  { key: 'transaction_contactId', label: 'Contact ID', source: 'transactions' },
  { key: 'transaction_amount', label: 'Amount', source: 'transactions' },
  { key: 'transaction_date', label: 'Date', source: 'transactions' },
  { key: 'transaction_type', label: 'Type', source: 'transactions' },
  { key: 'transaction_status', label: 'Status', source: 'transactions' },
];

const MESSAGES_FIELDS: SourceFieldDefinition[] = [
  { key: 'message_id', label: 'Message ID', source: 'messages' },
  { key: 'message_contactId', label: 'Contact ID', source: 'messages' },
  { key: 'message_channel', label: 'Channel', source: 'messages' },
  { key: 'message_status', label: 'Status', source: 'messages' },
  { key: 'message_sentAt', label: 'Sent At', source: 'messages' },
  { key: 'message_campaignId', label: 'Campaign ID', source: 'messages' },
];

function getPrimaryFields(primarySource: PrimarySourceType): SourceFieldDefinition[] {
  switch (primarySource) {
    case 'contacts':
      return CONTACTS_FIELDS;
    case 'transactions':
      return TRANSACTIONS_FIELDS;
    case 'messages':
      return MESSAGES_FIELDS;
  }
}

function getEnrichmentFields(enrichment: EnrichmentConfig): SourceFieldDefinition[] {
  const entityFields = getPrimaryFields(enrichment.entity);
  const prefix = enrichment.entity.charAt(0).toUpperCase() + enrichment.entity.slice(1, -1);

  return entityFields.map((field) => ({
    key: `enrichment_${enrichment.entity}_${field.key}`,
    label: `${prefix}: ${field.label}`,
    source: enrichment.entity,
  }));
}

// ─── Exported functions ──────────────────────────────────────────────────────

/**
 * Returns primary source fields + enrichment fields (prefixed with entity name).
 */
export function getFieldsForSourceConfig(config: SourceConfig): SourceFieldDefinition[] {
  const primaryFields = getPrimaryFields(config.primarySource);

  if (!config.enrichment) {
    return primaryFields;
  }

  const enrichmentFields = getEnrichmentFields(config.enrichment);
  return [...primaryFields, ...enrichmentFields];
}

/**
 * Returns null if config is incomplete; otherwise returns JSON string.
 */
export function serialiseSourceConfig(config: SourceConfig): string | null {
  if (!isSourceConfigComplete(config)) {
    return null;
  }
  return JSON.stringify(config);
}

/**
 * Parses JSON back to typed SourceConfig.
 */
export function deserialiseSourceConfig(json: string): SourceConfig {
  return JSON.parse(json) as SourceConfig;
}

/**
 * Human-readable summary for the Review step.
 */
export function formatSourceConfigSummary(config: SourceConfig): string {
  const parts: string[] = [];

  // Primary source label
  const sourceLabel = config.primarySource.charAt(0).toUpperCase() + config.primarySource.slice(1);
  parts.push(sourceLabel);

  // Sub-source detail
  if (config.primarySource === 'transactions' && config.tableId) {
    parts[0] = `${sourceLabel} (${config.tableId})`;
  } else if (config.primarySource === 'messages' && config.channels.length > 0) {
    parts[0] = `${sourceLabel} (${config.channels.map(c => c.toUpperCase()).join(', ')})`;
  }

  // Filter description
  const filterDesc = formatFilterDescription(config);
  parts.push(filterDesc);

  // Enrichment
  if (config.enrichment) {
    const enrichLabel = config.enrichment.entity.charAt(0).toUpperCase() + config.enrichment.entity.slice(1);
    parts.push(`enriched with ${enrichLabel}`);
  }

  return parts.join(' — ');
}

function formatFilterDescription(config: SourceConfig): string {
  const filter = config.filter;

  switch (filter.type) {
    case 'all':
      return `All ${config.primarySource}`;
    case 'created_in_last_n_days':
      return `Created in last ${filter.days ?? '?'} days`;
    case 'field_filter':
      return 'Custom field filter';
    default:
      return 'Filtered';
  }
}

/**
 * Creates a default EnrichmentConfig for a given entity.
 * - contacts: { entity: 'contacts' }
 * - transactions: { entity: 'transactions', tableId: '', joinStrategy: 'most_recent' }
 * - messages: { entity: 'messages', channel: 'email', statuses: ['delivered'] }
 */
export function createDefaultEnrichmentConfig(entity: EnrichmentEntity): EnrichmentConfig {
  switch (entity) {
    case 'contacts':
      return { entity: 'contacts' };
    case 'transactions':
      return { entity: 'transactions', tableId: '', joinStrategy: 'most_recent' };
    case 'messages':
      return { entity: 'messages', channel: 'email', statuses: ['delivered'] };
  }
}

/**
 * Returns enrichment entities excluding the primary source.
 */
export function getAvailableEnrichments(primarySource: PrimarySourceType): EnrichmentEntity[] {
  const all: EnrichmentEntity[] = ['contacts', 'transactions', 'messages'];
  return all.filter((entity) => entity !== primarySource);
}

/**
 * Resets filter + enrichment when primary source changes.
 * Returns a new SourceConfig for the new source type with default/empty values.
 */
export function resetDownstreamOnSourceChange(
  _config: SourceConfig,
  newSource: PrimarySourceType
): SourceConfig {
  switch (newSource) {
    case 'contacts':
      return {
        primarySource: 'contacts',
        filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
        enrichment: null,
      } satisfies ContactsSourceConfig;

    case 'transactions':
      return {
        primarySource: 'transactions',
        tableId: '',
        filter: { type: 'all' },
        enrichment: null,
      } satisfies TransactionsSourceConfig;

    case 'messages':
      return {
        primarySource: 'messages',
        channels: [],
        filter: { type: 'field_filter', fieldFilters: [{ field: '', operator: '', value: '' }] },
        enrichment: null,
      } satisfies MessagesSourceConfig;
  }
}

/**
 * Locale-formatted count with thousand separators.
 */
export function formatMatchCount(count: number): string {
  return count.toLocaleString('en-NZ');
}

// ─── Config Hydration ────────────────────────────────────────────────────────

/**
 * Hydrates a SourceConfig from a persisted JSON string.
 * Returns the typed SourceConfig if valid, or null if the JSON is invalid/unparseable.
 */
export function hydrateSourceConfig(json: string | null): SourceConfig | null {
  if (!json) return null;

  try {
    const config = deserialiseSourceConfig(json);

    // Basic structural validation — ensure it has a valid primarySource discriminant
    if (
      !config ||
      !config.primarySource ||
      !['contacts', 'transactions', 'messages'].includes(config.primarySource)
    ) {
      return null;
    }

    return config;
  } catch {
    return null;
  }
}

/**
 * Detects stale references in a SourceConfig by checking referenced IDs
 * against the available mock data (segments, campaigns, transaction tables).
 *
 * Returns an array of StaleReference objects for any IDs that no longer exist.
 */
export function detectStaleReferences(config: SourceConfig): StaleReference[] {
  const stale: StaleReference[] = [];

  const validSegmentIds = new Set(segments.map((s) => s.id));
  const validCampaignIds = new Set(campaigns.map((c) => c.id));
  const validTableIds = new Set(transactionalDatabases.map((t) => t.id));

  // Check filter references
  if (config.primarySource === 'transactions') {
    // Check tableId
    if (config.tableId && !validTableIds.has(config.tableId)) {
      stale.push({ field: 'tableId', type: 'table', id: config.tableId });
    }
  }

  // Check enrichment references
  if (config.enrichment) {
    if (config.enrichment.entity === 'transactions' && 'tableId' in config.enrichment) {
      if (config.enrichment.tableId && !validTableIds.has(config.enrichment.tableId)) {
        stale.push({ field: 'enrichment.tableId', type: 'table', id: config.enrichment.tableId });
      }
    }
  }

  return stale;
}
