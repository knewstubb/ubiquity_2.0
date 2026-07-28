export type SyncTableType = 'contact' | 'transaction';
export type SyncStatus = 'active' | 'paused';
export type OnMissingBehaviour = 'create' | 'skip';

export interface ColumnMapping {
  id: string;
  sourceColumn: string;
  targetColumn: string;
}

export interface SyncRule {
  id: string;
  sourceAccountId: string;
  targetAccountId: string;
  tableType: SyncTableType;
  /** For transaction rules, the specific transactional list in the source */
  sourceListName?: string;
  /** For transaction rules, the specific transactional list in the target */
  targetListName?: string;
  /** The parent contact sync rule (only for transaction rules) */
  parentRuleId?: string;
  matchColumnSource: string;
  matchColumnTarget: string;
  onMissing: OnMissingBehaviour;
  triggerOnMappedOnly: boolean;
  excludedCallerTypes: string[];
  columnMappings: ColumnMapping[];
  status: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Schema columns available in an account — in real life fetched from the API,
 * here we simulate different schemas per account to test complex mapping.
 */
export interface AccountSchema {
  accountId: string;
  contactColumns: string[];
  /** Example values for contact columns (keyed by column name) */
  contactExamples?: Record<string, string>;
  /** Columns that are required in the target database (must be mapped when syncing TO this account) */
  requiredColumns?: string[];
  /** Columns that have a default value and don't need to be mapped (keyed by column name to default value) */
  defaultColumnValues?: Record<string, string>;
  transactionalLists: TransactionalList[];
}

export interface TransactionalList {
  id: string;
  name: string;
  columns: string[];
  /** Example values for list columns (keyed by column name) */
  examples?: Record<string, string>;
}
