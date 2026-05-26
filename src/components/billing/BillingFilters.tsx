import { accounts } from '../../data/accounts';
import type { Account } from '../../models/account';
import type { CategoryFilter } from './useBillingReport';
import { DateRangePicker, type DateRangePreset } from '@/components/composed/date-range-picker';
import { getCurrentBillingCycle } from '../../models/billing';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildBillingPresets(): DateRangePreset[] {
  const presets: DateRangePreset[] = [];
  const today = new Date();

  presets.push({ label: 'Today', start: toIso(today), end: toIso(today) });

  const current = getCurrentBillingCycle();
  presets.push({ label: 'Current Billing Cycle', start: current.start, end: current.end });

  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  let cycleMonth = currentDay < 26 ? currentMonth - 1 : currentMonth;
  let cycleYear = today.getFullYear();

  for (let i = 1; i <= 11; i++) {
    let prevMonth = cycleMonth - i;
    let prevYear = cycleYear;
    while (prevMonth < 0) { prevMonth += 12; prevYear -= 1; }
    const startDate = new Date(prevYear, prevMonth, 26);
    const endDate = new Date(prevYear, prevMonth + 1, 25);
    presets.push({
      label: `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear()}`,
      start: toIso(startDate),
      end: toIso(endDate),
    });
  }

  return presets;
}

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
  const billingPresets = buildBillingPresets();

  return (
    <div className="flex items-end gap-6 flex-wrap" role="group" aria-label="Billing report filters">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-normal text-muted-foreground">Date Range</span>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          presets={billingPresets}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-base font-normal text-muted-foreground leading-[17px]" htmlFor="billing-account-filter">Account</label>
        <select
          id="billing-account-filter"
          className="px-3 py-2 text-base font-sans border border-border rounded-sm bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 min-w-[220px] focus:border-primary focus:shadow-ring"
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

      {/* Category filter hidden — hardcoded to Integration for now.
          Uncomment when additional billing categories are migrated in. */}
    </div>
  );
}
