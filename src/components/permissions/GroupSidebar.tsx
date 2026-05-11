import { cn } from '../../lib/utils';
import type { PermissionGroup } from '../../models/permissions';

interface GroupSidebarProps {
  groups: PermissionGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onCreateClick: () => void;
}

export function GroupSidebar({ groups, selectedGroupId, onSelectGroup, onCreateClick }: GroupSidebarProps) {
  return (
    <div className="flex flex-col border-r border-border h-full overflow-hidden">
      <button
        className="flex items-center justify-center gap-1 m-4 px-4 py-2 font-sans text-sm font-semibold text-primary bg-transparent border border-primary rounded-sm cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        onClick={onCreateClick}
      >
        + Create
      </button>
      <ul className="flex-1 overflow-y-auto list-none m-0 p-0">
        {groups.map((group) => (
          <li
            key={group.id}
            className={cn(
              "flex flex-col gap-0.5 px-4 py-2 cursor-pointer border-l-[3px] border-transparent transition-colors duration-150",
              "hover:bg-secondary",
              group.id === selectedGroupId && "bg-accent border-l-primary hover:bg-accent"
            )}
            onClick={() => onSelectGroup(group.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectGroup(group.id);
              }
            }}
          >
            <span className="font-sans text-sm font-semibold text-foreground leading-tight">
              {group.name}
            </span>
            <span className="font-sans text-xs text-tertiary-foreground leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
              {group.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
