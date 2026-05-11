import { useState, useRef, useEffect } from 'react';
import { Check } from '@phosphor-icons/react';
import { useAccount } from '../../contexts/AccountContext';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import { cn } from '../../lib/utils';

export function AccountSwitcher() {
  const {
    accounts,
    selectedAccountId,
    selectedAccount,
    setSelectedAccountId,
    accessPattern,
    accessibleRootAccounts,
    activeRootAccountId,
    activeRootAccount,
    setActiveRootAccountId,
    isAllAccountsMode,
    accountsInActiveTree,
  } = useAccount();
  const { isPlatformAdmin } = usePlatformAdmin();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Platform admin in All Accounts Mode: disabled trigger ---
  if (isPlatformAdmin && isAllAccountsMode) {
    return (
      <div className="relative shrink-0 w-[220px]" ref={wrapperRef}>
        <button
          type="button"
          className="flex items-center gap-1.5 w-full px-2.5 py-1 text-sm font-medium text-tertiary-foreground bg-secondary border border-border rounded-md cursor-default opacity-60 pointer-events-none leading-[1.4]"
          disabled
          aria-haspopup="listbox"
          aria-expanded={false}
        >
          <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left">All Accounts</span>
          <span className="flex items-center text-tertiary-foreground" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    );
  }

  // --- Trigger text ---
  const triggerText = (() => {
    if (accessPattern === 'platform-admin') {
      return activeRootAccount?.name ?? 'All Accounts';
    }
    if (selectedAccount.parentId === null) {
      return `${selectedAccount.name} (All Locations)`;
    }
    return selectedAccount.name;
  })();

  // --- Child/grandchild accounts for the dropdown ---
  const childAccounts = accountsInActiveTree.filter((a) => a.parentId !== null);
  const rootInTree = accountsInActiveTree.find((a) => a.parentId === null) ?? activeRootAccount;

  return (
    <div className="relative shrink-0 w-[220px]" ref={wrapperRef}>
      <button
        type="button"
        className="flex items-center gap-1.5 w-full px-2.5 py-1 text-sm font-medium text-muted-foreground bg-secondary border border-border rounded-md cursor-pointer transition-colors duration-150 leading-[1.4] hover:border-border-strong hover:text-foreground"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-left">{triggerText}</span>
        <span className={cn("flex items-center text-tertiary-foreground transition-transform duration-150", open && "rotate-180")} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 min-w-[220px] bg-background border border-border rounded-md shadow-[0px_3px_4px_-1px_rgba(0,0,0,0.08)] z-[100] py-1" role="listbox" aria-label="Select account">

          {/* Multi-account: Root Accounts section */}
          {accessPattern === 'multi-account' && (
            <>
              <div className="py-1">
                <div className="px-3 py-1 text-sm font-semibold text-tertiary-foreground uppercase tracking-[0.03em] leading-[15px]">Root Accounts</div>
                {accessibleRootAccounts.map((root) => {
                  const isActive = root.id === activeRootAccountId;
                  return (
                    <button
                      key={root.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-foreground bg-none border-none cursor-pointer text-left transition-colors duration-100 hover:bg-secondary",
                        isActive && "text-primary font-semibold"
                      )}
                      onClick={() => {
                        setActiveRootAccountId(root.id);
                        setOpen(false);
                      }}
                    >
                      {root.name}
                      {isActive && (
                        <Check size={14} weight="bold" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="h-px my-1 bg-border" />
            </>
          )}

          {/* Root account option (All Locations) */}
          {rootInTree && (
            <button
              key={rootInTree.id}
              type="button"
              role="option"
              aria-selected={selectedAccountId === rootInTree.id}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-foreground bg-none border-none cursor-pointer text-left transition-colors duration-100 hover:bg-secondary",
                selectedAccountId === rootInTree.id && "text-primary font-semibold"
              )}
              onClick={() => { setSelectedAccountId(rootInTree.id); setOpen(false); }}
            >
              {rootInTree.name} (All Locations)
            </button>
          )}

          {/* Child/grandchild accounts */}
          {childAccounts.map((account) => (
            <button
              key={account.id}
              type="button"
              role="option"
              aria-selected={selectedAccountId === account.id}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-foreground bg-none border-none cursor-pointer text-left transition-colors duration-100 hover:bg-secondary",
                selectedAccountId === account.id && "text-primary font-semibold"
              )}
              onClick={() => { setSelectedAccountId(account.id); setOpen(false); }}
            >
              {account.name}
              <span className="text-sm text-tertiary-foreground font-normal">{account.region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
