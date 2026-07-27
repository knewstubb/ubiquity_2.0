/**
 * Account Sync Service — mirrors AccountSync.Worker
 *
 * Real service: AccountSync.Worker (ECS Fargate, Linux ARM64)
 * Status: PROPOSED (solution designed and approved, depends on DataFlow Kinesis stream)
 * gRPC coverage: N/A (worker is event-driven, no direct API)
 *
 * Owns:
 * - Sync rules (contact and transaction)
 * - Column mappings (source → target field translations)
 * - Reference mappings (source contact ID → target contact ID cache)
 *
 * Dependencies:
 * - DataFlow Kinesis stream (CDC events from MSSQL) — NOT YET DEPLOYED
 * - u3_list via SQS queue (bulk TVP writes to target accounts)
 * - u3_system for account tree validation (rules must be within same tree)
 *
 * Event flow:
 * 1. CDC change from source account → Kinesis stream (shared with DataFlow)
 * 2. AccountSync.Worker consumes event, evaluates matching rules
 * 3. Worker resolves target contact via gRPC FindByUniqueColumn
 * 4. Worker enqueues write intent to SQS (list-service-bulk-writes queue)
 * 5. u3_list dequeues and performs batched TVP write to target account
 *
 * Loop prevention:
 * - Every write is tagged with CallerType = 'AccountSync'
 * - Worker skips any CDC event with this tag
 * - Bidirectional rules (A→B and B→A) are safe — no infinite loops
 *
 * Key constraints:
 * - Rules can only exist between accounts in the same tree (enforced by UI + backend)
 * - Transaction sync rules require a parent contact sync rule for the same account pair
 * - Pausing a contact rule cascades pause to all child transaction rules
 * - Resuming a contact rule does NOT auto-resume children (explicit activation required)
 * - New rules start in 'paused' status by default (safe activation pattern)
 *
 * Production database: PostgreSQL (account_sync schema)
 * Tables: sync_rules, column_mappings, reference_mappings
 *
 * Prototype equivalent: local state seeded from src/data/account-sync.ts
 */

// Re-export data types and seed data
export type {
  SyncRule,
  SyncTableType,
  SyncStatus,
  OnMissingBehaviour,
  ColumnMapping,
  AccountSchema,
  TransactionalList,
} from '../../models/account-sync';

export {
  syncRules,
  accountSchemas,
} from '../../data/account-sync';

// --- Service operations (would be API calls in production) ---

import type { SyncRule, AccountSchema } from '../../models/account-sync';
import { syncRules, accountSchemas } from '../../data/account-sync';

/**
 * Get all sync rules.
 * In production: GET /api/account-sync/rules
 */
export function getAllRules(): SyncRule[] {
  return syncRules;
}

/**
 * Get sync rules filtered to a specific account tree.
 * In production: GET /api/account-sync/rules?treeAccountIds=...
 */
export function getRulesForTree(treeAccountIds: Set<string>): SyncRule[] {
  return syncRules.filter(
    (r) => treeAccountIds.has(r.sourceAccountId) || treeAccountIds.has(r.targetAccountId)
  );
}

/**
 * Get contact rules only (top-level rules, no parentRuleId).
 */
export function getContactRules(rules: SyncRule[]): SyncRule[] {
  return rules.filter((r) => r.tableType === 'contact');
}

/**
 * Get transaction rules only (rules with parentRuleId).
 */
export function getTransactionRules(rules: SyncRule[]): SyncRule[] {
  return rules.filter((r) => r.tableType === 'transaction');
}

/**
 * Get child transaction rules for a specific contact rule.
 */
export function getChildRules(rules: SyncRule[], parentRuleId: string): SyncRule[] {
  return rules.filter((r) => r.parentRuleId === parentRuleId);
}

/**
 * Get account schema for a specific account.
 * In production: GET /api/account-sync/schemas/{accountId}
 */
export function getAccountSchema(accountId: string): AccountSchema | undefined {
  return accountSchemas.find((s) => s.accountId === accountId);
}

/**
 * Get all account schemas.
 * In production: GET /api/account-sync/schemas
 */
export function getAllSchemas(): AccountSchema[] {
  return accountSchemas;
}
