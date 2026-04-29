import { GlobeSimple, Check } from '@phosphor-icons/react';
import { useAccount } from '../../contexts/AccountContext';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import styles from './RootAccountSelector.module.css';

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
      <div className={styles.sectionHeader}>Switch Account</div>

      {/* All Accounts option — platform admins only */}
      {isPlatformAdmin && (
        <button
          type="button"
          role="menuitem"
          className={`${styles.option} ${isAllAccountsMode ? styles.optionActive : ''}`}
          onClick={() => handleSelect(null)}
        >
          <span className={styles.icon}>
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
            className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
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
