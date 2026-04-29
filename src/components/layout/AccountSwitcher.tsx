import { useState, useRef, useEffect } from 'react';
import { Check } from '@phosphor-icons/react';
import { useAccount } from '../../contexts/AccountContext';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import styles from './AccountSwitcher.module.css';

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
      <div className={styles.wrapper} ref={wrapperRef}>
        <button
          type="button"
          className={`${styles.trigger} ${styles.disabledTrigger}`}
          disabled
          aria-haspopup="listbox"
          aria-expanded={false}
        >
          <span className={styles.triggerText}>All Accounts</span>
          <span className={styles.chevron} aria-hidden="true">
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
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerText}>{triggerText}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox" aria-label="Select account">

          {/* Multi-account: Root Accounts section */}
          {accessPattern === 'multi-account' && (
            <>
              <div className={styles.rootSection}>
                <div className={styles.sectionLabel}>Root Accounts</div>
                {accessibleRootAccounts.map((root) => {
                  const isActive = root.id === activeRootAccountId;
                  return (
                    <button
                      key={root.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={`${styles.rootOption} ${isActive ? styles.optionActive : ''}`}
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
              <div className={styles.sectionDivider} />
            </>
          )}

          {/* Root account option (All Locations) */}
          {rootInTree && (
            <button
              key={rootInTree.id}
              type="button"
              role="option"
              aria-selected={selectedAccountId === rootInTree.id}
              className={`${styles.option} ${selectedAccountId === rootInTree.id ? styles.optionActive : ''}`}
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
              className={`${styles.option} ${selectedAccountId === account.id ? styles.optionActive : ''}`}
              onClick={() => { setSelectedAccountId(account.id); setOpen(false); }}
            >
              {account.name}
              <span className={styles.regionLabel}>{account.region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
