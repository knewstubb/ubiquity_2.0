import { useState, useEffect } from 'react';
import type { PermissionUser, PermissionGroup } from '../../models/permissions';
import { Checkbox } from '../shared/Checkbox';
import { Dropdown } from '../shared/Dropdown';
import styles from './ManageUsersDialog.module.css';

interface ManageUsersDialogProps {
  open: boolean;
  accountName: string;
  allUsers: PermissionUser[];
  usersWithAccess: string[];          // user IDs
  permissionGroups: PermissionGroup[];
  onSave: (userAssignments: { userId: string; groupId: string }[]) => void;
  onClose: () => void;
}

interface LocalAssignment {
  checked: boolean;
  groupId: string;
}

export function ManageUsersDialog({
  open,
  accountName,
  allUsers,
  usersWithAccess,
  permissionGroups,
  onSave,
  onClose,
}: ManageUsersDialogProps) {
  const [localState, setLocalState] = useState<Map<string, LocalAssignment>>(new Map());

  const defaultGroupId = permissionGroups.length > 0 ? permissionGroups[0].id : '';

  useEffect(() => {
    if (open) {
      const initial = new Map<string, LocalAssignment>();
      for (const user of allUsers) {
        initial.set(user.id, {
          checked: usersWithAccess.includes(user.id),
          groupId: defaultGroupId,
        });
      }
      setLocalState(initial);
    }
  }, [open, allUsers, usersWithAccess, defaultGroupId]);

  if (!open) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleCheckChange(userId: string, checked: boolean) {
    setLocalState((prev) => {
      const next = new Map(prev);
      const current = next.get(userId);
      next.set(userId, {
        checked,
        groupId: current?.groupId ?? defaultGroupId,
      });
      return next;
    });
  }

  function handleGroupChange(userId: string, groupId: string) {
    setLocalState((prev) => {
      const next = new Map(prev);
      const current = next.get(userId);
      if (current) {
        next.set(userId, { ...current, groupId });
      }
      return next;
    });
  }

  function handleSave() {
    const assignments: { userId: string; groupId: string }[] = [];
    for (const [userId, assignment] of localState) {
      if (assignment.checked) {
        assignments.push({ userId, groupId: assignment.groupId });
      }
    }
    onSave(assignments);
  }

  const allChecked = allUsers.every((u) => localState.get(u.id)?.checked);

  const groupOptions = permissionGroups.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-users-title"
    >
      <div className={styles.dialog}>
        <h2 id="manage-users-title" className={styles.title}>
          Manage Users
        </h2>
        <p className={styles.subtitle}>
          Add or remove user access to {accountName}
        </p>

        {allChecked ? (
          <div className={styles.allAssigned}>
            All users already have access
          </div>
        ) : null}

        <ul className={styles.userList}>
          {allUsers.map((user) => {
            const assignment = localState.get(user.id);
            const isChecked = assignment?.checked ?? false;

            return (
              <li key={user.id} className={styles.userRow}>
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => handleCheckChange(user.id, e.target.checked)}
                  aria-label={`Grant access to ${user.name}`}
                />
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{user.initials}</div>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                </div>
                {isChecked && (
                  <div className={styles.groupDropdown}>
                    <Dropdown
                      options={groupOptions}
                      value={assignment?.groupId ?? defaultGroupId}
                      onChange={(e) => handleGroupChange(user.id, e.target.value)}
                      aria-label={`Permission group for ${user.name}`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
