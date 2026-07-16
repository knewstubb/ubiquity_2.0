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
  transactionalLists: TransactionalList[];
}

export interface TransactionalList {
  id: string;
  name: string;
  columns: string[];
}
