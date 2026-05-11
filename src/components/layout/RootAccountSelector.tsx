import { GlobeSimple, Check } from '@phosphor-icons/react';
import { useAccount } from '../../contexts/AccountContext';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import { cn } from '../../lib/utils';

interface RootAccountSelectorProps {
  onSelect: () => void;
}

export function RootAccountSelector({ onSelect }: RootAccountSelectorProps) {
  const {
    accessibleRootAccounts,
    activeRootAccountId,
    setActiveRootAccountId,
    isAllAccountsMode,
  } = useAccount();
  const { isPlatformAdmin } = usePlatformAdmin();

  // Don't render if there's only one root account and user isn't a platform admin
  if (accessibleRootAccounts.length <= 1 && !isPlatformAdmin) return null;

  const handleSelect = (id: string | null) => {
    setActiveRootAccountId(id);
    onSelect();
  };

  return (
    <div>
      <div className="px-3 pt-2 pb-1 font-sans text-sm font-semibold text-tertiary-foreground uppercase tracking-[0.04em] leading-none">
        Switch Account
      </div>

      {/* All Accounts option — platform admins only */}
      {isPlatformAdmin && (
        <button
          type="button"
          role="menuitem"
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground",
            "bg-none border-none rounded-sm cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary",
            isAllAccountsMode && "text-primary"
          )}
          onClick={() => handleSelect(null)}
        >
          <span className="flex items-center shrink-0 text-inherit">
            <GlobeSimple size={16} weight="regular" />
          </span>
          All Accounts
          {isAllAccountsMode && (
            <Check size={14} weight="bold" style={{ marginLeft: 'auto' }} />
          )}
        </button>
      )}

      {/* Root account options */}
      {accessibleRootAccounts.map((root) => {
        const isActive = !isAllAccountsMode && root.id === activeRootAccountId;
        return (
          <button
            key={root.id}
            type="button"
            role="menuitem"
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground",
              "bg-none border-none rounded-sm cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary",
              isActive && "text-primary"
            )}
            onClick={() => handleSelect(root.id)}
          >
            {root.name}
            {isActive && (
              <Check size={14} weight="bold" style={{ marginLeft: 'auto' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
