import type { ReactNode } from 'react';
import { Buildings, GlobeHemisphereWest, MapPin, PencilSimple } from '@phosphor-icons/react';
import type { Account } from '../../models/account';
import type { PermissionGroup } from '../../models/permissions';
import { getHierarchyIcon } from '../../data/permissions';
import { cn } from '../../lib/utils';
import { Checkbox } from '../shared/Checkbox';
import { Dropdown } from '../shared/Dropdown';

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

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center gap-2 px-1 py-2 rounded-md min-h-9",
          "hover:bg-background",
          isClickableMode && "cursor-pointer hover:bg-accent",
          isClickableMode && selected && "bg-accent"
        )}
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
        <span className="flex items-center justify-center shrink-0 text-muted-foreground w-5 h-5">
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

        <span className="font-sans text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
          {account.name}
        </span>

        {showCheckbox && checked && (
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Dropdown
              className="min-w-[140px]"
              options={dropdownOptions}
              value={assignment ?? 'custom'}
              onChange={(e) => onGroupChange(e.target.value)}
              aria-label={`Permission group for ${account.name}`}
            />
            <button
              className="flex items-center justify-center bg-transparent border-none cursor-pointer text-muted-foreground p-1 rounded-sm transition-colors duration-150 hover:text-primary hover:bg-accent"
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

      {children && (
        <div className="relative pl-6 before:content-[''] before:absolute before:left-3.5 before:top-0 before:bottom-3 before:w-px before:bg-border">
          {children}
        </div>
      )}
    </div>
  );
}
