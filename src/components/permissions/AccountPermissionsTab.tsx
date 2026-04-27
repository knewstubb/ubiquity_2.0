import { useState, useCallback, useMemo } from 'react';
import type { Account } from '../../models/account';
import type { FunctionalPermissions } from '../../models/permissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { accounts } from '../../data/accounts';
import { FUNCTIONAL_GROUPS } from '../../data/permissions';
import { AccountTreeNode } from './AccountTreeNode';
import { UserAccessCard } from './UserAccessCard';
import { ManageUsersDialog } from './ManageUsersDialog';
import { PermissionEditPanel } from './PermissionEditPanel';
import styles from './AccountPermissionsTab.module.css';

function buildAccountMap(accs: Account[]): Map<string, Account> {
  const map = new Map<string, Account>();
  for (const a of accs) map.set(a.id, a);
  return map;
}

/**
 * Recursively renders account tree nodes for the sidebar (no checkboxes).
 */
function renderSidebarNode(
  account: Account,
  accountMap: Map<string, Account>,
  selectedAccountId: string | null,
  onSelect: (id: string) => void,
): React.ReactNode {
  const childAccounts = account.childIds
    .map((id) => accountMap.get(id))
    .filter((a): a is Account => a !== undefined);

  return (
    <AccountTreeNode
      key={account.id}
      account={account}
      allAccounts={accounts}
      checked={false}
      indeterminate={false}
      assignment={null}
      permissionGroups={[]}
      onCheckChange={() => {}}
      onGroupChange={() => {}}
      onEditClick={() => {}}
      showCheckbox={false}
      selected={selectedAccountId === account.id}
      onSelect={() => onSelect(account.id)}
    >
      {childAccounts.length > 0
        ? childAccounts.map((child) =>
            renderSidebarNode(child, accountMap, selectedAccountId, onSelect),
          )
        : null}
    </AccountTreeNode>
  );
}

export function AccountPermissionsTab() {
  const {
    users,
    permissionGroups,
    getAssignmentsForAccount,
    setAssignmentForUserAccount,
    removeAssignment,
  } = usePermissions();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const accountMap = useMemo(() => buildAccountMap(accounts), []);
  const rootAccounts = useMemo(() => accounts.filter((a) => a.parentId === null), []);
  const selectedAccount = selectedAccountId ? accountMap.get(selectedAccountId) ?? null : null;

  // Get assignments for the selected account
  const accountAssignments = useMemo(() => {
    if (!selectedAccountId) return [];
    return getAssignmentsForAccount(selectedAccountId);
  }, [selectedAccountId, getAssignmentsForAccount]);

  // Users with access to the selected account
  const usersWithAccess = useMemo(() => {
    const userIds = new Set(accountAssignments.map((a) => a.userId));
    return users.filter((u) => userIds.has(u.id));
  }, [accountAssignments, users]);

  // Resolve the displayed group ID for each user's assignment
  const getAssignedGroupId = useCallback(
    (userId: string): string => {
      const assignment = accountAssignments.find((a) => a.userId === userId);
      if (!assignment) return 'custom';
      if (assignment.permissionGroupId) return assignment.permissionGroupId;
      return 'custom';
    },
    [accountAssignments],
  );

  // Handle group change on a user card
  const handleGroupChange = useCallback(
    (userId: string, groupId: string) => {
      if (!selectedAccountId) return;
      if (groupId === 'custom') {
        // Resolve current permissions and store as custom
        const assignment = accountAssignments.find((a) => a.userId === userId);
        const currentPerms: Record<string, FunctionalPermissions> = {};
        if (assignment?.customPermissions) {
          Object.assign(currentPerms, assignment.customPermissions);
        } else if (assignment?.permissionGroupId) {
          const group = permissionGroups.find((g) => g.id === assignment.permissionGroupId);
          if (group) Object.assign(currentPerms, group.permissions);
        }
        // Ensure all functional groups have entries
        for (const fg of FUNCTIONAL_GROUPS) {
          if (!currentPerms[fg]) {
            currentPerms[fg] = { create: false, read: false, update: false, delete: false };
          }
        }
        setAssignmentForUserAccount(userId, selectedAccountId, null, currentPerms);
      } else {
        setAssignmentForUserAccount(userId, selectedAccountId, groupId, null);
      }
    },
    [selectedAccountId, accountAssignments, permissionGroups, setAssignmentForUserAccount],
  );

  // --- Edit panel ---
  const editUser = editUserId ? users.find((u) => u.id === editUserId) ?? null : null;

  const editPermissions = useMemo((): Record<string, FunctionalPermissions> => {
    if (!editUserId || !selectedAccountId) return {};
    const assignment = accountAssignments.find((a) => a.userId === editUserId);
    if (!assignment) return {};

    if (assignment.customPermissions) return { ...assignment.customPermissions };
    if (assignment.permissionGroupId) {
      const group = permissionGroups.find((g) => g.id === assignment.permissionGroupId);
      if (group) return { ...group.permissions };
    }

    const empty: Record<string, FunctionalPermissions> = {};
    for (const fg of FUNCTIONAL_GROUPS) {
      empty[fg] = { create: false, read: false, update: false, delete: false };
    }
    return empty;
  }, [editUserId, selectedAccountId, accountAssignments, permissionGroups]);

  const handleEditToggle = useCallback(
    (functionalGroup: string, permission: 'create' | 'read' | 'update' | 'delete', value: boolean) => {
      if (!editUserId || !selectedAccountId) return;

      const assignment = accountAssignments.find((a) => a.userId === editUserId);
      if (!assignment) return;

      // Resolve current permissions
      let currentPerms: Record<string, FunctionalPermissions>;
      if (assignment.customPermissions) {
        currentPerms = { ...assignment.customPermissions };
      } else if (assignment.permissionGroupId) {
        const group = permissionGroups.find((g) => g.id === assignment.permissionGroupId);
        currentPerms = group ? { ...group.permissions } : {};
      } else {
        currentPerms = {};
      }

      // Ensure all functional groups exist
      for (const fg of FUNCTIONAL_GROUPS) {
        if (!currentPerms[fg]) {
          currentPerms[fg] = { create: false, read: false, update: false, delete: false };
        }
      }

      // Apply the toggle
      currentPerms[functionalGroup] = {
        ...currentPerms[functionalGroup],
        [permission]: value,
      };

      // Save as custom (auto-detection happens in context)
      setAssignmentForUserAccount(editUserId, selectedAccountId, null, currentPerms);
    },
    [editUserId, selectedAccountId, accountAssignments, permissionGroups, setAssignmentForUserAccount],
  );

  // --- Manage Users dialog ---
  const handleManageSave = useCallback(
    (userAssignments: { userId: string; groupId: string }[]) => {
      if (!selectedAccountId) return;

      // Get current user IDs with access
      const currentUserIds = new Set(accountAssignments.map((a) => a.userId));
      const newUserIds = new Set(userAssignments.map((a) => a.userId));

      // Remove access for users no longer checked
      for (const userId of currentUserIds) {
        if (!newUserIds.has(userId)) {
          removeAssignment(userId, selectedAccountId);
        }
      }

      // Add/update access for checked users
      for (const { userId, groupId } of userAssignments) {
        if (!currentUserIds.has(userId)) {
          // New assignment
          setAssignmentForUserAccount(userId, selectedAccountId, groupId, null);
        }
      }

      setManageDialogOpen(false);
    },
    [selectedAccountId, accountAssignments, removeAssignment, setAssignmentForUserAccount],
  );

  return (
    <div className={styles.container}>
      {/* Left sidebar — account tree without checkboxes */}
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarHeading}>Accounts</h3>
        <div role="tree" aria-label="Account hierarchy">
          {rootAccounts.map((root) =>
            renderSidebarNode(root, accountMap, selectedAccountId, setSelectedAccountId),
          )}
        </div>
      </div>

      {/* Right main area */}
      {selectedAccount ? (
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <h2 className={styles.heading}>Users with Access to {selectedAccount.name}</h2>
              <p className={styles.subtitle}>
                {usersWithAccess.length} user(s) have access.
              </p>
            </div>
            <button
              className={styles.manageButton}
              onClick={() => setManageDialogOpen(true)}
            >
              + Manage Users
            </button>
          </div>

          <div className={styles.cardList}>
            {usersWithAccess.map((user) => (
              <UserAccessCard
                key={user.id}
                user={user}
                assignedGroupId={getAssignedGroupId(user.id)}
                permissionGroups={permissionGroups}
                onGroupChange={(groupId) => handleGroupChange(user.id, groupId)}
                onEditClick={() => setEditUserId(user.id)}
              />
            ))}
          </div>

          {/* Permission Edit Panel */}
          {editUser && selectedAccount && (
            <PermissionEditPanel
              open={!!editUserId}
              accountName={selectedAccount.name}
              userName={editUser.name}
              permissions={editPermissions}
              onToggle={handleEditToggle}
              onClose={() => setEditUserId(null)}
            />
          )}

          {/* Manage Users Dialog */}
          <ManageUsersDialog
            open={manageDialogOpen}
            accountName={selectedAccount.name}
            allUsers={users}
            usersWithAccess={usersWithAccess.map((u) => u.id)}
            permissionGroups={permissionGroups}
            onSave={handleManageSave}
            onClose={() => setManageDialogOpen(false)}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          Select an account to manage user access
        </div>
      )}
    </div>
  );
}
