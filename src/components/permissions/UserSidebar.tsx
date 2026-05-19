import { cn } from '../../lib/utils';
import type { PermissionUser } from '../../models/permissions';

interface UserSidebarProps {
  users: PermissionUser[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
}

export function UserSidebar({ users, selectedUserId, onSelectUser }: UserSidebarProps) {
  return (
    <div className="flex flex-col border-r border-border h-full overflow-hidden">
      <h2 className="font-sans text-base font-semibold text-foreground m-0 p-4">Users</h2>
      <ul className="flex-1 overflow-y-auto list-none m-0 p-0" role="listbox" aria-label="Users">
        {users.map((user) => (
          <li
            key={user.id}
            className={cn(
              "flex items-center gap-2 px-4 py-2 cursor-pointer border-l-[3px] border-transparent transition-colors duration-150",
              "hover:bg-secondary",
              user.id === selectedUserId && "bg-accent border-l-primary hover:bg-accent"
            )}
            onClick={() => onSelectUser(user.id)}
            role="option"
            aria-selected={user.id === selectedUserId}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectUser(user.id);
              }
            }}
          >
            <span className="flex items-center justify-center w-[34px] h-[34px] min-w-[34px] rounded-full bg-primary text-primary-foreground font-sans text-xs font-semibold leading-none">
              {user.initials}
            </span>
            <span className="flex flex-col gap-px min-w-0">
              <span className="font-sans text-sm font-semibold text-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {user.name}
              </span>
              <span className="font-sans text-xs text-muted-foreground leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                {user.email}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
