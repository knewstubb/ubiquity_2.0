import type { AssetScope } from '../../models/asset';
import styles from './ScopeSelector.module.css';

interface ScopeSelectorProps {
  activeScope: AssetScope;
  onScopeChange: (scope: AssetScope) => void;
}

const SCOPES: { value: AssetScope; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'account', label: 'Account' },
];

export function ScopeSelector({ activeScope, onScopeChange }: ScopeSelectorProps) {
  return (
    <div className={styles.container} role="tablist" aria-label="Asset scope">
      {SCOPES.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          type="button"
          aria-selected={activeScope === value}
          className={`${styles.tab} ${activeScope === value ? styles.tabActive : ''}`}
          onClick={() => onScopeChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
