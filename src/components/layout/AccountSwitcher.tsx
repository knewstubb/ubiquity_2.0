import { useState, useRef, useEffect } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import styles from './AccountSwitcher.module.css';

export function AccountSwitcher() {
  const { accounts, selectedAccountId, selectedAccount, setSelectedAccountId } = useAccount();
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

  const masterAccount = accounts.find((a) => a.parentId === null);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerText}>
          {selectedAccount.name}
          {selectedAccount.parentId === null && ' (All Locations)'}
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox" aria-label="Select account">
          {masterAccount && (
            <button
              key={masterAccount.id}
              type="button"
              role="option"
              aria-selected={selectedAccountId === masterAccount.id}
              className={`${styles.option} ${selectedAccountId === masterAccount.id ? styles.optionActive : ''}`}
              onClick={() => { setSelectedAccountId(masterAccount.id); setOpen(false); }}
            >
              {masterAccount.name} (All Locations)
            </button>
          )}
          {accounts
            .filter((a) => a.parentId !== null)
            .map((account) => (
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
