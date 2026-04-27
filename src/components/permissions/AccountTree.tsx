import type { Account } from '../../models/account';
import type { PermissionGroup } from '../../models/permissions';
import { AccountTreeNode } from './AccountTreeNode';
import styles from './AccountTree.module.css';

interface AccountTreeProps {
  accounts: Account[];
  checkedAccountIds: Set<string>;
  assignments: Map<string, string>;   // accountId → permissionGroupId
  permissionGroups: PermissionGroup[];
  onCheckChange: (accountId: string, checked: boolean) => void;
  onGroupChange: (accountId: string, groupId: string) => void;
  onEditClick: (accountId: string) => void;
}

/**
 * Builds a lookup map from account ID to Account for O(1) access.
 */
function buildAccountMap(accounts: Account[]): Map<string, Account> {
  const map = new Map<string, Account>();
  for (const account of accounts) {
    map.set(account.id, account);
  }
  return map;
}

/**
 * Collects all descendant IDs for a given account recursively.
 */
function getAllDescendantIds(accountId: string, accountMap: Map<string, Account>): string[] {
  const account = accountMap.get(accountId);
  if (!account) return [];

  const descendants: string[] = [];
  for (const childId of account.childIds) {
    descendants.push(childId);
    descendants.push(...getAllDescendantIds(childId, accountMap));
  }
  return descendants;
}

/**
 * Determines if a node should show the indeterminate checkbox state.
 * A node is indeterminate when some but not all of its descendants are checked.
 */
function isIndeterminate(
  accountId: string,
  checkedAccountIds: Set<string>,
  accountMap: Map<string, Account>,
): boolean {
  const descendantIds = getAllDescendantIds(accountId, accountMap);
  if (descendantIds.length === 0) return false;

  const checkedCount = descendantIds.filter((id) => checkedAccountIds.has(id)).length;
  return checkedCount > 0 && checkedCount < descendantIds.length;
}

/**
 * Recursively renders an account and its children as tree nodes.
 */
function renderNode(
  account: Account,
  accounts: Account[],
  accountMap: Map<string, Account>,
  checkedAccountIds: Set<string>,
  assignments: Map<string, string>,
  permissionGroups: PermissionGroup[],
  onCheckChange: (accountId: string, checked: boolean) => void,
  onGroupChange: (accountId: string, groupId: string) => void,
  onEditClick: (accountId: string) => void,
): React.ReactNode {
  const childAccounts = account.childIds
    .map((id) => accountMap.get(id))
    .filter((a): a is Account => a !== undefined);

  const nodeIndeterminate = isIndeterminate(account.id, checkedAccountIds, accountMap);

  return (
    <AccountTreeNode
      key={account.id}
      account={account}
      allAccounts={accounts}
      checked={checkedAccountIds.has(account.id)}
      indeterminate={nodeIndeterminate}
      assignment={assignments.get(account.id) ?? null}
      permissionGroups={permissionGroups}
      onCheckChange={(checked) => onCheckChange(account.id, checked)}
      onGroupChange={(groupId) => onGroupChange(account.id, groupId)}
      onEditClick={() => onEditClick(account.id)}
    >
      {childAccounts.length > 0
        ? childAccounts.map((child) => (
            <div key={child.id} className={styles.childItem}>
              {renderNode(
                child,
                accounts,
                accountMap,
                checkedAccountIds,
                assignments,
                permissionGroups,
                onCheckChange,
                onGroupChange,
                onEditClick,
              )}
            </div>
          ))
        : null}
    </AccountTreeNode>
  );
}

export function AccountTree({
  accounts,
  checkedAccountIds,
  assignments,
  permissionGroups,
  onCheckChange,
  onGroupChange,
  onEditClick,
}: AccountTreeProps) {
  const accountMap = buildAccountMap(accounts);
  const rootAccounts = accounts.filter((a) => a.parentId === null);

  return (
    <div className={styles.tree} role="tree" aria-label="Account hierarchy">
      {rootAccounts.map((root) =>
        renderNode(
          root,
          accounts,
          accountMap,
          checkedAccountIds,
          assignments,
          permissionGroups,
          onCheckChange,
          onGroupChange,
          onEditClick,
        ),
      )}
    </div>
  );
}
