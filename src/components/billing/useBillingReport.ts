import { useState, useMemo, useCallback } from 'react';
import type { BillingLineItem } from '../../models/billing';
import { getCurrentBillingCycle, UNIT_PRICES } from '../../models/billing';
import type { Account, } from '../../models/account';
import type { BillingCategory } from '../../models/billing';
import { billingLineItems } from '../../data/billingData';
import { accounts } from '../../data/accounts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccountTreeNode {
  account: Account;
  level: number;
  items: BillingLineItem[];
  rolledUpTotal: number;
  children: AccountTreeNode[];
}

export type CategoryFilter = 'all' | 'Integration';

export interface UseBillingReportReturn {
  tree: AccountTreeNode[];
  startDate: string;
  endDate: string;
  setStartDate: (d: string) => void;
  setEndDate: (d: string) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (f: CategoryFilter) => void;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  toggleSort: (column: string) => void;
  leafItems: BillingLineItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const accountMap = new Map<string, Account>(accounts.map((a) => [a.id, a]));

/** Collect all descendant account IDs (inclusive of the given ID). */
function getDescendantIds(accountId: string): Set<string> {
  const result = new Set<string>();
  const queue = [accountId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    result.add(id);
    const acc = accountMap.get(id);
    if (acc) {
      for (const childId of acc.childIds) {
        queue.push(childId);
      }
    }
  }
  return result;
}

/** Check whether two date ranges overlap. Both ranges are inclusive. */
function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}


/** Filter items by date range according to category-specific rules. */
function filterByDateRange(
  items: BillingLineItem[],
  startDate: string,
  endDate: string,
): BillingLineItem[] {
  return items.filter((item) => {
    switch (item.category) {
      case 'Mailouts':
      case 'Automated Mailouts':
      case 'Form Triggered Emails':
      case 'Event Triggered Emails':
      case 'TXT Message Parts': {
        // Filter by sendDate
        if (!item.sendDate) return false;
        return item.sendDate >= startDate && item.sendDate <= endDate;
      }
      case 'Database Records':
      case 'Integration': {
        // Include if billing cycle overlaps with selected date range
        if (!item.billingCycleStart || !item.billingCycleEnd) return false;
        return rangesOverlap(
          item.billingCycleStart,
          item.billingCycleEnd,
          startDate,
          endDate,
        );
      }
      case 'Transactional Records':
      case 'Survey Responses':
      default: {
        // Filter by createdDate
        return item.createdDate >= startDate && item.createdDate <= endDate;
      }
    }
  });
}

/** Filter items to only those belonging to the selected account or its descendants. */
function filterByAccount(
  items: BillingLineItem[],
  selectedAccountId: string | null,
): BillingLineItem[] {
  if (selectedAccountId === null) return items;
  const allowedIds = getDescendantIds(selectedAccountId);
  return items.filter((item) => allowedIds.has(item.accountId));
}

/** Sort items by a column. */
function sortItems(
  items: BillingLineItem[],
  column: string,
  direction: 'asc' | 'desc',
): BillingLineItem[] {
  const sorted = [...items];
  const dir = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let aVal: string | number | null;
    let bVal: string | number | null;

    switch (column) {
      case 'account': {
        const aName = accountMap.get(a.accountId)?.name ?? '';
        const bName = accountMap.get(b.accountId)?.name ?? '';
        aVal = aName;
        bVal = bName;
        break;
      }
      case 'type':
        aVal = a.category;
        bVal = b.category;
        break;
      case 'description':
        aVal = a.description;
        bVal = b.description;
        break;
      case 'sendDate':
        aVal = a.sendDate ?? '';
        bVal = b.sendDate ?? '';
        break;
      case 'items':
        aVal = a.items;
        bVal = b.items;
        break;
      case 'createdDate':
        aVal = a.createdDate;
        bVal = b.createdDate;
        break;
      case 'user':
        aVal = a.user;
        bVal = b.user;
        break;
      case 'unitPrice': {
        aVal = UNIT_PRICES[a.category as BillingCategory] ?? 0;
        bVal = UNIT_PRICES[b.category as BillingCategory] ?? 0;
        break;
      }
      case 'total': {
        aVal = a.items * (UNIT_PRICES[a.category as BillingCategory] ?? 0);
        bVal = b.items * (UNIT_PRICES[b.category as BillingCategory] ?? 0);
        break;
      }
      default:
        return 0;
    }

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === '') return dir;
    if (bVal === null || bVal === '') return -dir;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir;
    }
    return String(aVal).localeCompare(String(bVal)) * dir;
  });

  return sorted;
}


/** Build the account tree from filtered items. */
function buildTree(
  items: BillingLineItem[],
  selectedAccountId: string | null,
): AccountTreeNode[] {
  // Group items by accountId
  const itemsByAccount = new Map<string, BillingLineItem[]>();
  for (const item of items) {
    const list = itemsByAccount.get(item.accountId) ?? [];
    list.push(item);
    itemsByAccount.set(item.accountId, list);
  }

  // Determine which accounts to show as roots
  let rootAccounts: Account[];
  if (selectedAccountId !== null) {
    const selected = accountMap.get(selectedAccountId);
    rootAccounts = selected ? [selected] : [];
  } else {
    // Root accounts are those with no parent
    rootAccounts = accounts.filter((a) => a.parentId === null);
  }

  function buildNode(account: Account, level: number): AccountTreeNode | null {
    const directItems = itemsByAccount.get(account.id) ?? [];

    // Build children recursively
    const children: AccountTreeNode[] = [];
    for (const childId of account.childIds) {
      const childAccount = accountMap.get(childId);
      if (childAccount) {
        const childNode = buildNode(childAccount, level + 1);
        if (childNode) {
          children.push(childNode);
        }
      }
    }

    // Skip this node if it has no items and no children with items
    const childTotal = children.reduce((sum, c) => sum + c.rolledUpTotal, 0);
    const ownTotal = directItems.reduce((sum, item) => sum + item.items, 0);

    if (directItems.length === 0 && children.length === 0) {
      return null;
    }

    return {
      account,
      level,
      items: directItems,
      rolledUpTotal: ownTotal + childTotal,
      children,
    };
  }

  const tree: AccountTreeNode[] = [];

  // When a specific account is selected, determine its level in the hierarchy
  if (selectedAccountId !== null) {
    for (const root of rootAccounts) {
      // Determine the actual level of this account
      let level = 0;
      let current: Account | undefined = root;
      while (current?.parentId) {
        level++;
        current = accountMap.get(current.parentId);
      }
      const node = buildNode(root, level);
      if (node) tree.push(node);
    }
  } else {
    for (const root of rootAccounts) {
      const node = buildNode(root, 0);
      if (node) tree.push(node);
    }
  }

  return tree;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useBillingReport(): UseBillingReportReturn {
  const cycle = getCurrentBillingCycle();

  const [startDate, setStartDate] = useState(cycle.start);
  const [endDate, setEndDate] = useState(cycle.end);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortColumn, setSortColumn] = useState<string>('account');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleSort = useCallback(
    (column: string) => {
      if (column === sortColumn) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    },
    [sortColumn],
  );

  // Filtered, sorted leaf items
  const leafItems = useMemo(() => {
    let result = filterByDateRange(billingLineItems, startDate, endDate);
    result = filterByAccount(result, selectedAccountId);
    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.category === categoryFilter);
    }
    result = sortItems(result, sortColumn, sortDirection);
    return result;
  }, [startDate, endDate, selectedAccountId, categoryFilter, sortColumn, sortDirection]);

  // Tree structure
  const tree = useMemo(
    () => buildTree(leafItems, selectedAccountId),
    [leafItems, selectedAccountId],
  );

  return {
    tree,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedAccountId,
    setSelectedAccountId,
    categoryFilter,
    setCategoryFilter,
    sortColumn,
    sortDirection,
    toggleSort,
    leafItems,
  };
}
