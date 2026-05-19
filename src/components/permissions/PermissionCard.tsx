import { Toggle } from '../shared/Toggle';

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
    <div className="bg-background border border-border rounded shadow-sm p-4 flex flex-col gap-2">
      <h3 className="font-sans text-base font-semibold text-foreground m-0 mb-1">{functionalGroup}</h3>
      {CRUD_LABELS.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between py-1">
          <span className="font-sans text-sm text-muted-foreground">{label}</span>
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
