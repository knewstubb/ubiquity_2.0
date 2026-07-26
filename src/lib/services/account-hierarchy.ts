/**
 * Account Hierarchy Utilities — mirrors production account tree behaviour
 *
 * Production behaviour:
 * - Accounts form a tree with unlimited depth (2 levels typical: root → child → grandchild)
 * - Settings inherit downward: child checks own setting → parent → root → global default
 * - All accounts in a tree share the same SQL user (u3data_{root_account_guid})
 * - The root account ID is used for feature flag hash rollout
 * - AccountSync only works between accounts in the same tree
 * - Users can have permissions in multiple accounts but work with one at a time
 *
 * These utilities operate on the Account[] array from the data layer.
 */

import type { Account } from '../../models/account';
import { accounts as localAccounts } from '../../data/accounts';

/**
 * Get the root account for any account in the tree.
 * In production this is a denormalised field (rootAccountId).
 * We include the traversal logic here for completeness.
 */
export function getRootAccount(accountId: string, allAccounts: Account[] = localAccounts): Account | undefined {
  const account = allAccounts.find(a => a.id === accountId);
  if (!account) return undefined;
  if (!account.parentId) return account; // This IS the root

  // Use denormalised rootAccountId for O(1) lookup
  return allAccounts.find(a => a.id === account.rootAccountId);
}

/**
 * Get all accounts in the same tree as the given account.
 * Useful for: Account Sync rule validation (sync only within same tree).
 */
export function getAccountTree(accountId: string, allAccounts: Account[] = localAccounts): Account[] {
  const root = getRootAccount(accountId, allAccounts);
  if (!root) return [];

  return allAccounts.filter(a => a.rootAccountId === root.id);
}

/**
 * Get the ancestor chain from an account up to the root.
 * Returns [self, parent, grandparent, ..., root].
 * Used for settings inheritance resolution.
 */
export function getAncestorChain(accountId: string, allAccounts: Account[] = localAccounts): Account[] {
  const chain: Account[] = [];
  let current = allAccounts.find(a => a.id === accountId);

  while (current) {
    chain.push(current);
    if (!current.parentId) break;
    current = allAccounts.find(a => a.id === current!.parentId);
  }

  return chain;
}

/**
 * Resolve a setting value using the production inheritance model.
 *
 * Resolution order:
 * 1. Check the account itself
 * 2. Check parent account
 * 3. Check root account
 * 4. Fall back to the global default
 *
 * @param accountId - The account to resolve the setting for
 * @param settingKey - The setting key to look up
 * @param settingsMap - A map of accountId → settings object
 * @param globalDefault - The default value if no account in the chain has the setting
 */
export function resolveAccountSetting<T>(
  accountId: string,
  settingKey: string,
  settingsMap: Record<string, Record<string, T>>,
  globalDefault: T,
  allAccounts: Account[] = localAccounts,
): T {
  const chain = getAncestorChain(accountId, allAccounts);

  for (const account of chain) {
    const settings = settingsMap[account.id];
    if (settings && settingKey in settings) {
      return settings[settingKey];
    }
  }

  return globalDefault;
}

/**
 * Check if two accounts are in the same tree.
 * Required for: Account Sync rule validation.
 * In production: sync rules can ONLY be created between accounts in the same tree.
 */
export function areInSameTree(
  accountId1: string,
  accountId2: string,
  allAccounts: Account[] = localAccounts,
): boolean {
  const acc1 = allAccounts.find(a => a.id === accountId1);
  const acc2 = allAccounts.find(a => a.id === accountId2);
  if (!acc1 || !acc2) return false;

  return acc1.rootAccountId === acc2.rootAccountId;
}

/**
 * Get direct children of an account.
 */
export function getDirectChildren(accountId: string, allAccounts: Account[] = localAccounts): Account[] {
  return allAccounts.filter(a => a.parentId === accountId);
}

/**
 * Get all descendants (children, grandchildren, etc.) of an account.
 */
export function getAllDescendants(accountId: string, allAccounts: Account[] = localAccounts): Account[] {
  const descendants: Account[] = [];
  const queue = [accountId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = allAccounts.filter(a => a.parentId === currentId);
    descendants.push(...children);
    queue.push(...children.map(c => c.id));
  }

  return descendants;
}
