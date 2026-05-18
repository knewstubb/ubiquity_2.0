import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { FloppyDisk } from '@phosphor-icons/react';
import type { FunctionalPermissions, UserAccountAssignment } from '../../models/permissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useToast } from '../shared/Toast';
import { accounts } from '../../data/accounts';
import { FUNCTIONAL_GROUPS } from '../../data/permissions';
import { UserSidebar } from './UserSidebar';
import { AccountTree } from './AccountTree';
import { PermissionEditPanel } from './PermissionEditPanel';

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
    isCurrentUserSystemAdmin,
    setSystemAdmin,
  } = usePermissions();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Local draft state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [draftAssignments, setDraftAssignments] = useState<Map<string, string>>(new Map());
  // Custom permissions per account (for edit panel)
  const [customPerms, setCustomPerms] = useState<Map<string, Record<string, FunctionalPermissions>>>(new Map());

  // Dirty tracking — snapshot of initial state for comparison
  const initialSnapshotRef = useRef<string>('');
  const { showToast } = useToast();

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

    // Capture snapshot for dirty tracking
    initialSnapshotRef.current = JSON.stringify({
      checked: Array.from(checked).sort(),
      assigns: Array.from(assigns.entries()).sort(),
      customs: Array.from(customs.entries()).sort(),
    });
  }, [selectedUserId, getAssignmentsForUser]);

  // --- Cascading check/uncheck ---

  const isDirty = useMemo(() => {
    const current = JSON.stringify({
      checked: Array.from(checkedIds).sort(),
      assigns: Array.from(draftAssignments.entries()).sort(),
      customs: Array.from(customPerms.entries()).sort(),
    });
    return current !== initialSnapshotRef.current;
  }, [checkedIds, draftAssignments, customPerms]);

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

    // Update snapshot so isDirty resets
    initialSnapshotRef.current = JSON.stringify({
      checked: Array.from(checkedIds).sort(),
      assigns: Array.from(draftAssignments.entries()).sort(),
      customs: Array.from(customPerms.entries()).sort(),
    });

    showToast('Permissions saved successfully', 'success');
  }, [selectedUserId, checkedIds, draftAssignments, customPerms, defaultGroupId, setAssignmentsForUser, showToast]);

  // --- Render ---

  return (
    <div className="grid grid-cols-[280px_1fr] h-full overflow-hidden">
      <UserSidebar
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
      />

      {selectedUser ? (
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-sans text-xl font-semibold text-foreground m-0">Permissions for {selectedUser.name}</h2>
              <p className="font-sans text-sm text-muted-foreground m-0 leading-normal">Select accounts to grant access.</p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 border-none rounded-md bg-primary font-sans text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 whitespace-nowrap shrink-0 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
              onClick={handleSave}
              disabled={!isDirty}
            >
              <FloppyDisk size={16} weight="bold" />
              Save Changes
            </button>
          </div>

          <div className="mt-2">
            {/* System Administrator toggle — only visible to system admins */}
            {isCurrentUserSystemAdmin && selectedUser && (
              <div className="flex items-center justify-between py-3 px-4 mb-4 border border-border rounded-lg bg-surface">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">System Administrator</span>
                  <span className="text-xs text-muted-foreground">Full unrestricted access to all accounts and settings</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedUser.isSystemAdmin ?? false}
                    onChange={(e) => setSystemAdmin(selectedUser.id, e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            )}

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
        <div className="flex items-center justify-center h-full font-sans text-base text-tertiary-foreground">
          Select a user to manage their permissions
        </div>
      )}
    </div>
  );
}
