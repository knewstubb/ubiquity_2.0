// Primary source types

export type PrimarySourceType = 'contacts' | 'transactions' | 'messages';

export type Channel = 'email' | 'sms' | 'push';

export type JoinStrategy = 'most_recent' | 'all_records';

export type MessageStatus = 'delivered' | 'bounced' | 'failed' | 'opened';

// --- Contacts filter ---

export type ContactsFilterType =
  | 'all'
  | 'created_in_last_n_days'
  | 'in_list_segment'
  | 'unsubscribed'
  | 'not_sent_campaign';

export interface ContactsFilterConfig {
  type: ContactsFilterType;
  days?: number;
  segmentId?: string;
  campaignId?: string;
}

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

export type MessagesFilterType =
  | 'all'
  | 'by_status'
  | 'for_campaign'
  | 'in_date_range';

export interface MessagesFilterConfig {
  type: MessagesFilterType;
  statuses?: MessageStatus[];
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}

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
}

export interface TransactionsSourceConfig {
  primarySource: 'transactions';
  tableId: string;
  filter: TransactionsFilterConfig;
  enrichment: EnrichmentConfig | null;
}

export interface MessagesSourceConfig {
  primarySource: 'messages';
  channel: Channel;
  filter: MessagesFilterConfig;
  enrichment: EnrichmentConfig | null;
}

export type SourceConfig =
  | ContactsSourceConfig
  | TransactionsSourceConfig
  | MessagesSourceConfig;
