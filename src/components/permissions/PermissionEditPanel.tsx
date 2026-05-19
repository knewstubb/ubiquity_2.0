import { FUNCTIONAL_GROUPS } from '../../data/permissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { PermissionCard } from './PermissionCard';
import { CloseButton } from '../ui/close-button';

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
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-edit-title"
    >
      <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[720px] max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h2 id="permission-edit-title" className="m-0 text-lg font-semibold text-foreground">Edit Permissions</h2>
            <p className="m-0 text-sm text-muted-foreground leading-normal">
              {userName} — {accountName}
            </p>
            <span className="inline-block mt-1 px-2 py-1 rounded-sm text-xs font-medium bg-secondary text-muted-foreground">
              {resolvedLabel}
            </span>
          </div>
          <CloseButton
            size="lg"
            className="shrink-0"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 overflow-y-auto pr-1">
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
