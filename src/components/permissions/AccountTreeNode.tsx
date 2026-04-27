import type { ReactNode } from 'react';
import { Buildings, GlobeHemisphereWest, MapPin, PencilSimple } from '@phosphor-icons/react';
import type { Account } from '../../models/account';
import type { PermissionGroup } from '../../models/permissions';
import { getHierarchyIcon } from '../../data/permissions';
import { Checkbox } from '../shared/Checkbox';
import { Dropdown } from '../shared/Dropdown';
import styles from './AccountTreeNode.module.css';

interface AccountTreeNodeProps {
  account: Account;
  allAccounts: Account[];
  checked: boolean;
  indeterminate: boolean;
  assignment: string | null;          // permission group ID or 'custom'
  permissionGroups: PermissionGroup[];
  onCheckChange: (checked: boolean) => void;
  onGroupChange: (groupId: string) => void;
  onEditClick: () => void;
  children?: ReactNode;
  showCheckbox?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const ICON_MAP = {
  buildings: Buildings,
  globe: GlobeHemisphereWest,
  pin: MapPin,
} as const;

export function AccountTreeNode({
  account,
  allAccounts,
  checked,
  indeterminate,
  assignment,
  permissionGroups,
  onCheckChange,
  onGroupChange,
  onEditClick,
  children,
  showCheckbox = true,
  selected = false,
  onSelect,
}: AccountTreeNodeProps) {
  const iconType = getHierarchyIcon(account);
  const IconComponent = ICON_MAP[iconType];

  const dropdownOptions = [
    ...permissionGroups.map((g) => ({ value: g.id, label: g.name })),
    { value: 'custom', label: 'Custom' },
  ];

  const isClickableMode = !showCheckbox;

  const rowClassName = [
    styles.nodeRow,
    isClickableMode && styles.clickable,
    isClickableMode && selected && styles.selectedClickable,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.node}>
      <div
        className={rowClassName}
        onClick={isClickableMode ? onSelect : undefined}
        role={isClickableMode ? 'button' : undefined}
        tabIndex={isClickableMode ? 0 : undefined}
        onKeyDown={
          isClickableMode
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect?.();
                }
              }
            : undefined
        }
      >
        <span className={styles.hierarchyIcon}>
          <IconComponent size={18} weight="regular" />
        </span>

        {showCheckbox && (
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={(e) => onCheckChange(e.target.checked)}
            aria-label={`Select ${account.name}`}
          />
        )}

        <span className={styles.accountName}>{account.name}</span>

        {showCheckbox && checked && (
          <div className={styles.assignmentControls}>
            <Dropdown
              className={styles.groupDropdown}
              options={dropdownOptions}
              value={assignment ?? 'custom'}
              onChange={(e) => onGroupChange(e.target.value)}
              aria-label={`Permission group for ${account.name}`}
            />
            <button
              className={styles.editButton}
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              aria-label={`Edit permissions for ${account.name}`}
              type="button"
            >
              <PencilSimple size={16} weight="regular" />
            </button>
          </div>
        )}
      </div>

      {children && <div className={styles.children}>{children}</div>}
    </div>
  );
}
