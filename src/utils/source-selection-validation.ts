import type {
  SourceConfig,
  ContactsSourceConfig,
  TransactionsSourceConfig,
  MessagesSourceConfig,
  ContactsFilterConfig,
  TransactionsFilterConfig,
  MessagesFilterConfig,
  EnrichmentConfig,
  TransactionEnrichmentOptions,
  MessageEnrichmentOptions,
} from '../models/source-selection';

/**
 * Returns true iff value is an integer in range 1–365 inclusive.
 */
export function validateDays(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 365;
}

/**
 * Returns true iff start ≤ end (chronological comparison of ISO date strings).
 */
export function validateDateRange(start: string, end: string): boolean {
  return start <= end;
}

/**
 * Returns true when the filter within a source config is valid.
 * Delegates to the appropriate filter validator based on primary source type.
 */
export function isFilterComplete(config: SourceConfig): boolean {
  switch (config.primarySource) {
    case 'contacts':
      return isContactsFilterComplete(config.filter);
    case 'transactions':
      return isTransactionsFilterComplete(config.filter);
    case 'messages':
      return isMessagesFilterComplete(config.filter);
  }
}

function isContactsFilterComplete(filter: ContactsFilterConfig): boolean {
  const rows = filter.fieldFilters;
  if (!rows || rows.length === 0) return true; // No filters = export all (delta)
  return rows.every(
    (row) => row.field.length > 0 && row.operator.length > 0 && row.value.length > 0
  );
}

function isTransactionsFilterComplete(filter: TransactionsFilterConfig): boolean {
  switch (filter.type) {
    case 'all':
      return true;
    case 'created_in_last_n_days':
      return filter.days !== undefined && validateDays(filter.days);
    case 'field_filter': {
      const rows = filter.fieldFilters;
      if (!rows || rows.length === 0) return false;
      return rows.every(
        (row) => row.field.length > 0 && row.operator.length > 0 && row.value.length > 0
      );
    }
  }
}

function isMessagesFilterComplete(filter: MessagesFilterConfig): boolean {
  const rows = filter.fieldFilters;
  if (!rows || rows.length === 0) return true; // No filters = export all (delta)
  return rows.every(
    (row) => {
      if (row.operator === 'is_true' || row.operator === 'is_false') {
        return row.field.length > 0 && row.operator.length > 0;
      }
      return row.field.length > 0 && row.operator.length > 0 && row.value.length > 0;
    }
  );
}

/**
 * Returns true when enrichment config (if present) is fully configured.
 * - null → true (no enrichment is valid)
 * - TransactionEnrichmentOptions: requires non-empty tableId
 * - MessageEnrichmentOptions: requires non-empty channel and at least one status
 * - ContactEnrichmentOptions: always complete (no required fields)
 */
export function isEnrichmentComplete(enrichment: EnrichmentConfig | null): boolean {
  if (enrichment === null) return true;

  switch (enrichment.entity) {
    case 'transactions': {
      const txn = enrichment as TransactionEnrichmentOptions;
      return txn.tableId.length > 0;
    }
    case 'messages': {
      const msg = enrichment as MessageEnrichmentOptions;
      return msg.channel.length > 0 && msg.statuses.length > 0;
    }
    case 'contacts':
      return true;
  }
}

/**
 * Returns true when the source config is complete enough to proceed.
 * - null → false
 * - Contacts: filter must be complete, enrichment must be complete
 * - Transactions: tableId must be non-empty, filter must be complete, enrichment must be complete
 * - Messages: channel must be non-empty, filter must be complete, enrichment must be complete
 */
export function isSourceConfigComplete(config: SourceConfig | null): boolean {
  if (config === null) return false;

  switch (config.primarySource) {
    case 'contacts': {
      const c = config as ContactsSourceConfig;
      return isFilterComplete(c) && isEnrichmentComplete(c.enrichment);
    }
    case 'transactions': {
      const t = config as TransactionsSourceConfig;
      return t.tableId.length > 0 && isFilterComplete(t) && isEnrichmentComplete(t.enrichment);
    }
    case 'messages': {
      const m = config as MessagesSourceConfig;
      return m.channels.length > 0 && isFilterComplete(m) && isEnrichmentComplete(m.enrichment);
    }
  }
}
