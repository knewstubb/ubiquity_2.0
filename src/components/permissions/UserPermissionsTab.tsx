import { useState, useCallback, useEffect, useMemo } from 'react';
import { FloppyDisk } from '@phosphor-icons/react';
import type { FunctionalPermissions, UserAccountAssignment } from '../../models/permissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { accounts } from '../../data/accounts';
import { FUNCTIONAL_GROUPS } from '../../data/permissions';
import { UserSidebar } from './UserSidebar';
import { AccountTree } from './AccountTree';
import { PermissionEditPanel } from './PermissionEditPanel';
import styles from './UserPermissionsTab.module.css';

/**
 * Builds a lookup map from account ID to Account for O(1) access.
 */
function buildAccountMap(accs: typeof accounts) {
  const map = new Map<string, (typeof accounts)[number]>();
  for (const a of accs) {
    map.set(a.id, a);
  }
  return map;
}

/**
 * Collects all descendant IDs for a given account recursively.
 */
function getAllDescendantIds(accountId: string, accountMap: ReturnType<typeof buildAccountMap>): string[] {
  const account = accountMap.get(accountId);
  if (!account) return [];
  const descendants: string[] = [];
  for (const childId of account.childIds) {
    descendants.push(childId);
    descendants.push(...getAllDescendantIds(childId, accountMap));
  }
  return descendants;
}

export function UserPermissionsTab() {
  const {
    users,
    permissionGroups,
    getAssignmentsForUser,
    setAssignmentsForUser,
  } = usePermissions();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Local draft state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [draftAssignments, setDraftAssignments] = useState<Map<string, string>>(new Map());
  // Custom permissions per account (for edit panel)
  const [customPerms, setCustomPerms] = useState<Map<string, Record<string, FunctionalPermissions>>>(new Map());

  // Edit panel state
  const [editAccountId, setEditAccountId] = useState<string | null>(null);

  const accountMap = useMemo(() => buildAccountMap(accounts), []);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  const defaultGroupId = permissionGroups.length > 0 ? permissionGroups[0].id : 'custom';

  // Load current assignments when a user is selected
  useEffect(() => {
    if (!selectedUserId) {
      setCheckedIds(new Set());
      setDraftAssignments(new Map());
      setCustomPerms(new Map());
      return;
    }

    const existing = getAssignmentsForUser(selectedUserId);
    const checked = new Set<string>();
    const assigns = new Map<string, string>();
    const customs = new Map<string, Record<string, FunctionalPermissions>>();

    for (const a of existing) {
      checked.add(a.accountId);
      if (a.permissionGroupId) {
        assigns.set(a.accountId, a.permissionGroupId);
      } else {
        assigns.set(a.accountId, 'custom');
        if (a.customPermissions) {
          customs.set(a.accountId, { ...a.customPermissions });
        }
      }
    }

    setCheckedIds(checked);
    setDraftAssignments(assigns);
    setCustomPerms(customs);
  }, [selectedUserId, getAssignmentsForUser]);

  // --- Cascading check/uncheck ---

  const handleCheckChange = useCallback(
    (accountId: string, checked: boolean) => {
      const descendants = getAllDescendantIds(accountId, accountMap);

      setCheckedIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          next.add(accountId);
          for (const id of descendants) next.add(id);
        } else {
          next.delete(accountId);
          for (const id of descendants) next.delete(id);
        }
        return next;
      });

      setDraftAssignments((prev) => {
        const next = new Map(prev);
        if (checked) {
          // Use the parent's current group, or default
          const parentGroup = prev.get(accountId) ?? defaultGroupId;
          next.set(accountId, parentGroup);
          for (const id of descendants) {
            next.set(id, parentGroup);
          }
        } else {
          next.delete(accountId);
          for (const id of descendants) next.delete(id);
        }
        return next;
      });

      // Clean up custom perms for unchecked accounts
      if (!checked) {
        setCustomPerms((prev) => {
          const next = new Map(prev);
          next.delete(accountId);
          for (const id of descendants) next.delete(id);
          return next;
        });
      }
    },
    [accountMap, defaultGroupId],
  );

  // --- Group change with cascade to checked descendants ---

  const handleGroupChange = useCallback(
    (accountId: string, groupId: string) => {
      const descendants = getAllDescendantIds(accountId, accountMap);

      setDraftAssignments((prev) => {
        const next = new Map(prev);
        next.set(accountId, groupId);
        // Cascade to all checked descendants
        for (const id of descendants) {
          if (checkedIds.has(id)) {
            next.set(id, groupId);
          }
        }
        return next;
      });

      // If switching away from custom, clear custom perms
      if (groupId !== 'custom') {
        setCustomPerms((prev) => {
          const next = new Map(prev);
          next.delete(accountId);
          for (const id of descendants) {
            if (checkedIds.has(id)) next.delete(id);
          }
          return next;
        });
      }
    },
    [accountMap, checkedIds],
  );

  // --- Edit panel ---

  const handleEditClick = useCallback((accountId: string) => {
    setEditAccountId(accountId);
  }, []);

  const editAccount = editAccountId ? accountMap.get(editAccountId) : null;

  // Resolve current permissions for the edit panel
  const editPermissions = useMemo((): Record<string, FunctionalPermissions> => {
    if (!editAccountId) return {};

    // Check custom perms first
    const custom = customPerms.get(editAccountId);
    if (custom) return custom;

    // Resolve from group
    const groupId = draftAssignments.get(editAccountId);
    if (groupId && groupId !== 'custom') {
      const group = permissionGroups.find((g) => g.id === groupId);
      if (group) return group.permissions;
    }

    // Fallback: all off
    const empty: Record<string, FunctionalPermissions> = {};
    for (const fg of FUNCTIONAL_GROUPS) {
      empty[fg] = { create: false, read: false, update: false, delete: false };
    }
    return empty;
  }, [editAccountId, customPerms, draftAssignments, permissionGroups]);

  const handleEditToggle = useCallback(
    (functionalGroup: string, permission: 'create' | 'read' | 'update' | 'delete', value: boolean) => {
      if (!editAccountId) return;

      setCustomPerms((prev) => {
        const next = new Map(prev);
        const current = next.get(editAccountId) ?? { ...editPermissions };
        const updated = {
          ...current,
          [functionalGroup]: {
            ...current[functionalGroup],
            [permission]: value,
          },
        };
        next.set(editAccountId, updated);
        return next;
      });

      // Mark as custom in assignments
      setDraftAssignments((prev) => {
        const next = new Map(prev);
        next.set(editAccountId, 'custom');
        return next;
      });
    },
    [editAccountId, editPermissions],
  );

  const handleEditClose = useCallback(() => {
    setEditAccountId(null);
  }, []);

  // --- Save ---

  const handleSave = useCallback(() => {
    if (!selectedUserId) return;

    const newAssignments: UserAccountAssignment[] = [];

    for (const accountId of checkedIds) {
      const groupId = draftAssignments.get(accountId) ?? defaultGroupId;
      const custom = customPerms.get(accountId) ?? null;

      newAssignments.push({
        userId: selectedUserId,
        accountId,
        permissionGroupId: groupId === 'custom' ? null : groupId,
        customPermissions: groupId === 'custom' ? custom : null,
      });
    }

    setAssignmentsForUser(selectedUserId, newAssignments);
  }, [selectedUserId, checkedIds, draftAssignments, customPerms, defaultGroupId, setAssignmentsForUser]);

  // --- Render ---

  return (
    <div className={styles.container}>
      <UserSidebar
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
      />

      {selectedUser ? (
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <h2 className={styles.heading}>Permissions for {selectedUser.name}</h2>
              <p className={styles.subtitle}>Select accounts to grant access.</p>
            </div>
            <button className={styles.saveButton} onClick={handleSave}>
              <FloppyDisk size={16} weight="bold" />
              Save Changes
            </button>
          </div>

          <div className={styles.treeArea}>
            <AccountTree
              accounts={accounts}
              checkedAccountIds={checkedIds}
              assignments={draftAssignments}
              permissionGroups={permissionGroups}
              onCheckChange={handleCheckChange}
              onGroupChange={handleGroupChange}
              onEditClick={handleEditClick}
            />
          </div>

          {editAccount && selectedUser && (
            <PermissionEditPanel
              open={!!editAccountId}
              accountName={editAccount.name}
              userName={selectedUser.name}
              permissions={editPermissions}
              onToggle={handleEditToggle}
              onClose={handleEditClose}
            />
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          Select a user to manage their permissions
        </div>
      )}
    </div>
  );
}
