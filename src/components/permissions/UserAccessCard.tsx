import { PencilSimple } from '@phosphor-icons/react';
import type { PermissionGroup, PermissionUser } from '../../models/permissions';
import { Dropdown } from '../shared/Dropdown';

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
    <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-[4px] bg-background shadow-sm">
      <span className="flex items-center justify-center w-[34px] h-[34px] min-w-[34px] rounded-full bg-primary text-primary-foreground font-sans text-xs font-semibold leading-none">
        {user.initials}
      </span>

      <div className="flex flex-col gap-px min-w-0 flex-1">
        <span className="font-sans text-sm font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
          {user.name}
        </span>
        <span className="font-sans text-xs text-muted-foreground leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
          {user.email}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Dropdown
          className="w-40"
          options={dropdownOptions}
          value={assignedGroupId}
          onChange={(e) => onGroupChange(e.target.value)}
          aria-label={`Permission group for ${user.name}`}
        />
        <button
          className="flex items-center justify-center bg-transparent border-none cursor-pointer text-muted-foreground p-1 rounded-[4px] transition-colors duration-150 hover:text-primary hover:bg-secondary"
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
