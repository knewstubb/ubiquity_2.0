import { accounts } from '../../data/accounts';
import type { Account } from '../../models/account';
import type { CategoryFilter } from './useBillingReport';
import styles from './BillingFilters.module.css';

export interface BillingFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  selectedAccountId: string | null;
  onAccountChange: (accountId: string | null) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (filter: CategoryFilter) => void;
  onReset: () => void;
}

/** Build a flat list of accounts with indentation prefix based on depth. */
function buildAccountOptions(): { id: string; label: string }[] {
  const accountMap = new Map<string, Account>(accounts.map((a) => [a.id, a]));
  const result: { id: string; label: string }[] = [];

  function walk(accountId: string, depth: number) {
    const account = accountMap.get(accountId);
    if (!account) return;

    const prefix = depth === 0 ? '' : depth === 1 ? '\u2014 ' : '\u2014\u2014 ';
    result.push({ id: account.id, label: `${prefix}${account.name}` });

    for (const childId of account.childIds) {
      walk(childId, depth + 1);
    }
  }

  // Start from root accounts (no parent)
  for (const account of accounts) {
    if (account.parentId === null) {
      walk(account.id, 0);
    }
  }

  return result;
}

const accountOptions = buildAccountOptions();

export function BillingFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedAccountId,
  onAccountChange,
  categoryFilter,
  onCategoryFilterChange,
  onReset,
}: BillingFiltersProps) {
  return (
    <div className={styles.filters} role="group" aria-label="Billing report filters">
      <div className={styles.group}>
        <label className={styles.label} htmlFor="billing-start-date">From</label>
        <div className={styles.dateRange}>
          <input
            id="billing-start-date"
            type="date"
            className={styles.input}
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <label className={styles.label} htmlFor="billing-end-date">To</label>
          <input
            id="billing-end-date"
            type="date"
            className={styles.input}
            value={endDate}
            min={startDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="billing-account-filter">Account</label>
        <select
          id="billing-account-filter"
          className={styles.select}
          value={selectedAccountId ?? ''}
          onChange={(e) => onAccountChange(e.target.value || null)}
        >
          <option value="">All Accounts</option>
          {accountOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>Category</span>
        <div className={styles.segmentedControl} role="radiogroup" aria-label="Category filter">
          <button
            type="button"
            role="radio"
            aria-checked={categoryFilter === 'all'}
            className={`${styles.segment} ${categoryFilter === 'all' ? styles.segmentActive : ''}`}
            onClick={() => onCategoryFilterChange('all')}
          >
            All
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={categoryFilter === 'Integration'}
            className={`${styles.segment} ${categoryFilter === 'Integration' ? styles.segmentActive : ''}`}
            onClick={() => onCategoryFilterChange('Integration')}
          >
            Integration
          </button>
        </div>
      </div>

      <button type="button" className={styles.resetBtn} onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
