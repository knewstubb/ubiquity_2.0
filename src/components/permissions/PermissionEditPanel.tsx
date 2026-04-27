import { X } from '@phosphor-icons/react';
import { FUNCTIONAL_GROUPS } from '../../data/permissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { PermissionCard } from './PermissionCard';
import styles from './PermissionEditPanel.module.css';

interface PermissionEditPanelProps {
  open: boolean;
  accountName: string;
  userName: string;
  permissions: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>;
  onToggle: (functionalGroup: string, permission: 'create' | 'read' | 'update' | 'delete', value: boolean) => void;
  onClose: () => void;
}

export function PermissionEditPanel({
  open,
  accountName,
  userName,
  permissions,
  onToggle,
  onClose,
}: PermissionEditPanelProps) {
  const { matchPermissionsToGroup, permissionGroups } = usePermissions();

  if (!open) return null;

  const matchedGroupId = matchPermissionsToGroup(permissions);
  const resolvedLabel = matchedGroupId
    ? permissionGroups.find((g) => g.id === matchedGroupId)?.name ?? 'Custom'
    : 'Custom';

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-edit-title"
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 id="permission-edit-title" className={styles.title}>Edit Permissions</h2>
            <p className={styles.subtitle}>
              {userName} — {accountName}
            </p>
            <span className={styles.groupBadge}>{resolvedLabel}</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.cardGrid}>
          {FUNCTIONAL_GROUPS.map((fg) => (
            <PermissionCard
              key={fg}
              functionalGroup={fg}
              permissions={
                permissions[fg] ?? { create: false, read: false, update: false, delete: false }
              }
              editable
              onToggle={(perm, value) => onToggle(fg, perm, value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
