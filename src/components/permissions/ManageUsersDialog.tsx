import { useState, useEffect } from 'react';
import type { PermissionUser, PermissionGroup } from '../../models/permissions';
import { Checkbox } from '../shared/Checkbox';
import { Dropdown } from '../shared/Dropdown';

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
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-users-title"
    >
      <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[520px] flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-2 duration-200">
        <h2 id="manage-users-title" className="m-0 mb-1 text-lg font-semibold text-foreground">
          Manage Users
        </h2>
        <p className="m-0 mb-4 text-sm text-muted-foreground">
          Add or remove user access to {accountName}
        </p>

        {allChecked ? (
          <div className="py-6 px-3 text-center text-sm text-muted-foreground">
            All users already have access
          </div>
        ) : null}

        <ul className="list-none m-0 p-0 overflow-y-auto flex-1 min-h-0 flex flex-col gap-2">
          {allUsers.map((user) => {
            const assignment = localState.get(user.id);
            const isChecked = assignment?.checked ?? false;

            return (
              <li key={user.id} className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 hover:bg-background">
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => handleCheckChange(user.id, e.target.checked)}
                  aria-label={`Grant access to ${user.name}`}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                    {user.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {user.email}
                    </span>
                  </div>
                </div>
                {isChecked && (
                  <div className="shrink-0 w-[140px]">
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

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
          <button
            className="px-4 py-2 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 border-none rounded-md bg-primary text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
