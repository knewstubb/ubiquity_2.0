import { Toggle } from '../shared/Toggle';
import styles from './PermissionCard.module.css';

type CrudKey = 'create' | 'read' | 'update' | 'delete';

interface PermissionCardProps {
  functionalGroup: string;
  permissions: { create: boolean; read: boolean; update: boolean; delete: boolean };
  editable: boolean;
  onToggle?: (permission: CrudKey, value: boolean) => void;
}

const CRUD_LABELS: { key: CrudKey; label: string }[] = [
  { key: 'create', label: 'Create' },
  { key: 'read', label: 'Read' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' },
];

export function PermissionCard({ functionalGroup, permissions, editable, onToggle }: PermissionCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.heading}>{functionalGroup}</h3>
      {CRUD_LABELS.map(({ key, label }) => (
        <div key={key} className={styles.toggleRow}>
          <span className={styles.toggleLabel}>{label}</span>
          <Toggle
            checked={permissions[key]}
            onChange={(value) => onToggle?.(key, value)}
            disabled={!editable}
            id={`${functionalGroup}-${key}`}
          />
        </div>
      ))}
    </div>
  );
}
