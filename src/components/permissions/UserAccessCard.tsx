import { PencilSimple } from '@phosphor-icons/react';
import type { PermissionGroup, PermissionUser } from '../../models/permissions';
import { Dropdown } from '../shared/Dropdown';
import styles from './UserAccessCard.module.css';

interface UserAccessCardProps {
  user: PermissionUser;
  assignedGroupId: string;
  permissionGroups: PermissionGroup[];
  onGroupChange: (groupId: string) => void;
  onEditClick: () => void;
}

export function UserAccessCard({
  user,
  assignedGroupId,
  permissionGroups,
  onGroupChange,
  onEditClick,
}: UserAccessCardProps) {
  const dropdownOptions = [
    ...permissionGroups.map((g) => ({ value: g.id, label: g.name })),
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className={styles.card}>
      <span className={styles.avatar}>{user.initials}</span>

      <div className={styles.userInfo}>
        <span className={styles.userName}>{user.name}</span>
        <span className={styles.userEmail}>{user.email}</span>
      </div>

      <div className={styles.controls}>
        <Dropdown
          className={styles.groupDropdown}
          options={dropdownOptions}
          value={assignedGroupId}
          onChange={(e) => onGroupChange(e.target.value)}
          aria-label={`Permission group for ${user.name}`}
        />
        <button
          className={styles.editButton}
          onClick={onEditClick}
          aria-label={`Edit permissions for ${user.name}`}
          type="button"
        >
          <PencilSimple size={16} weight="regular" />
        </button>
      </div>
    </div>
  );
}
