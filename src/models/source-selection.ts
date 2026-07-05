// Primary source types

export type PrimarySourceType = 'contacts' | 'transactions' | 'messages';

export type Channel = 'email' | 'sms' | 'push';

export type JoinStrategy = 'most_recent' | 'all_records';

export type MessageStatus = 'delivered' | 'bounced' | 'failed' | 'opened';

// --- Contacts filter ---

export type ContactsFilterType = 'field_filter';

export interface ContactsFilterConfig {
  type: ContactsFilterType;
  fieldFilters?: FieldFilterRow[];
}

/** System fields available for contact filtering */
export const CONTACT_SYSTEM_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'reference_id', label: 'Reference ID' },
  { key: 'person_id', label: 'Person ID' },
  { key: 'create_date', label: 'Create Date' },
  { key: 'last_modified', label: 'Last Modified' },
  { key: 'source', label: 'Source' },
  { key: 'version', label: 'Version' },
] as const;

// --- Transactions filter ---

export type TransactionsFilterType =
  | 'all'
  | 'created_in_last_n_days'
  | 'field_filter';

export interface FieldFilterRow {
  field: string;
  operator: string;
  value: string;
}

export interface TransactionsFilterConfig {
  type: TransactionsFilterType;
  days?: number;
  fieldFilters?: FieldFilterRow[];
}

// --- Messages filter ---

export type MessagesFilterType = 'field_filter';

export interface MessagesFilterConfig {
  type: MessagesFilterType;
  fieldFilters?: FieldFilterRow[];
  /** Specific email/message IDs selected for the export */
  selectedMessageIds?: string[];
}

/** System fields available for mailout/message filtering */
export const MESSAGE_SYSTEM_FIELDS = [
  { key: 'was_included', label: 'Was included' },
  { key: 'is_read', label: 'Is read' },
  { key: 'has_clicked', label: 'Has clicked' },
  { key: 'is_opted_out', label: 'Is opted out' },
  { key: 'message_status', label: 'Message status' },
  { key: 'marked_as_spam', label: 'Marked as spam' },
  { key: 'is_read_more_than_once', label: 'Is read more than once' },
  { key: 'read_on', label: 'Read on' },
  { key: 'read_first_on', label: 'Read first on' },
] as const;

// --- Enrichment ---

export type EnrichmentEntity = 'contacts' | 'transactions' | 'messages';

export interface TransactionEnrichmentOptions {
  entity: 'transactions';
  tableId: string;
  joinStrategy: JoinStrategy;
}

export interface MessageEnrichmentOptions {
  entity: 'messages';
  channel: Channel;
  statuses: MessageStatus[];
}

export interface ContactEnrichmentOptions {
  entity: 'contacts';
}

export type EnrichmentConfig =
  | TransactionEnrichmentOptions
  | MessageEnrichmentOptions
  | ContactEnrichmentOptions;

// --- Source configs ---

export interface ContactsSourceConfig {
  primarySource: 'contacts';
  filter: ContactsFilterConfig;
  enrichment: EnrichmentConfig | null;
  enrichments: EnrichmentConfig[];
}

export interface TransactionsSourceConfig {
  primarySource: 'transactions';
  tableId: string;
  filter: TransactionsFilterConfig;
  enrichment: EnrichmentConfig | null;
  enrichments: EnrichmentConfig[];
}

export interface MessagesSourceConfig {
  primarySource: 'messages';
  channels: Channel[];
  filter: MessagesFilterConfig;
  enrichment: EnrichmentConfig | null;
  enrichments: EnrichmentConfig[];
}

export type SourceConfig =
  | ContactsSourceConfig
  | TransactionsSourceConfig
  | MessagesSourceConfig;

// --- Enrichment helpers ---

/**
 * Returns a unique string identifier for an EnrichmentConfig.
 * - Messages enrichment → "messages"
 * - Transactions enrichment → "txn:{tableId}"
 * - Contacts enrichment → "contacts"
 */
export function enrichmentKey(config: EnrichmentConfig): string {
  switch (config.entity) {
    case 'messages':
      return 'messages';
    case 'transactions':
      return `txn:${config.tableId}`;
    case 'contacts':
      return 'contacts';
  }
}

/**
 * Maps an EnrichmentConfig to the `source` string used on SourceFieldDefinition.
 * - Messages enrichment → "messages"
 * - Transactions enrichment → "txn:{tableId}"
 * - Contacts enrichment → "contacts"
 */
export function getSourceTag(config: EnrichmentConfig): string {
  switch (config.entity) {
    case 'messages':
      return 'messages';
    case 'transactions':
      return `txn:${config.tableId}`;
    case 'contacts':
      return 'contacts';
  }
}
