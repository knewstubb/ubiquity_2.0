import type { Account } from '../models/account';
import type { FunctionalPermissions, PermissionGroup, UserAccountAssignment } from '../models/permissions';

/**
 * Traces each of a user's assigned accounts up to its root ancestor,
 * returning the unique set of root accounts the user can access.
 */
export function resolveAccessibleRoots(
  assignments: UserAccountAssignment[],
  allAccounts: Account[],
  userId: string,
): Account[] {
  const userAssignments = assignments.filter(a => a.userId === userId);
  const rootIds = new Set<string>();

  for (const assignment of userAssignments) {
    let account = allAccounts.find(a => a.id === assignment.accountId);
    while (account && account.parentId !== null) {
      account = allAccounts.find(a => a.id === account!.parentId);
    }
    if (account) {
      rootIds.add(account.id);
    }
  }

  return allAccounts.filter(a => rootIds.has(a.id));
}

/**
 * Returns the root account and all its descendants (children, grandchildren, etc.).
 */
export function getAccountTree(rootId: string, allAccounts: Account[]): Account[] {
  const result: Account[] = [];
  const queue: string[] = [rootId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    const account = allAccounts.find(a => a.id === id);
    if (account) {
      result.push(account);
      queue.push(...account.childIds);
    }
  }

  return result;
}

/**
 * Resolves the effective permissions for a user within a given account tree.
 * For each functional group, ORs all CRUD booleans across assignments
 * within the tree (highest privilege wins).
 */
export function resolveEffectivePermissions(
  assignments: UserAccountAssignment[],
  permissionGroups: PermissionGroup[],
  accountTreeIds: string[],
  userId: string,
): Record<string, FunctionalPermissions> {
  const relevantAssignments = assignments.filter(
    a => a.userId === userId && accountTreeIds.includes(a.accountId),
  );

  const result: Record<string, FunctionalPermissions> = {};

  for (const assignment of relevantAssignments) {
    const perms =
      assignment.customPermissions
      ?? permissionGroups.find(g => g.id === assignment.permissionGroupId)?.permissions
      ?? {};

    for (const [group, fp] of Object.entries(perms)) {
      if (!result[group]) {
        result[group] = { create: false, read: false, update: false, delete: false };
      }
      result[group] = {
        create: result[group].create || fp.create,
        read: result[group].read || fp.read,
        update: result[group].update || fp.update,
        delete: result[group].delete || fp.delete,
      };
    }
  }

  return result;
}
