import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBillingReport } from './useBillingReport';
import { getCurrentBillingCycle } from '../../models/billing';
import { accounts } from '../../data/accounts';

describe('useBillingReport', () => {
  it('returns default billing cycle dates', () => {
    const { result } = renderHook(() => useBillingReport());
    const cycle = getCurrentBillingCycle();
    expect(result.current.startDate).toBe(cycle.start);
    expect(result.current.endDate).toBe(cycle.end);
  });

  it('defaults to all accounts (null)', () => {
    const { result } = renderHook(() => useBillingReport());
    expect(result.current.selectedAccountId).toBeNull();
  });

  it('defaults sort to account ascending', () => {
    const { result } = renderHook(() => useBillingReport());
    expect(result.current.sortColumn).toBe('account');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('toggleSort switches direction on same column', () => {
    const { result } = renderHook(() => useBillingReport());
    act(() => result.current.toggleSort('account'));
    expect(result.current.sortDirection).toBe('desc');
    act(() => result.current.toggleSort('account'));
    expect(result.current.sortDirection).toBe('asc');
  });

  it('toggleSort resets to asc on new column', () => {
    const { result } = renderHook(() => useBillingReport());
    act(() => result.current.toggleSort('account')); // desc
    act(() => result.current.toggleSort('items'));    // new column → asc
    expect(result.current.sortColumn).toBe('items');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('returns a tree with root-level nodes', () => {
    const { result } = renderHook(() => useBillingReport());
    expect(result.current.tree.length).toBeGreaterThan(0);
    // Root nodes should be level 0
    for (const node of result.current.tree) {
      expect(node.level).toBe(0);
    }
  });

  it('rolled-up totals equal sum of own items + children totals', () => {
    const { result } = renderHook(() => useBillingReport());
    function checkNode(node: (typeof result.current.tree)[0]) {
      const ownTotal = node.items.reduce((s, i) => s + i.items, 0);
      const childTotal = node.children.reduce((s, c) => s + c.rolledUpTotal, 0);
      expect(node.rolledUpTotal).toBe(ownTotal + childTotal);
      node.children.forEach(checkNode);
    }
    result.current.tree.forEach(checkNode);
  });

  it('account filter restricts to selected account and descendants', () => {
    const { result } = renderHook(() => useBillingReport());
    const auckland = accounts.find((a) => a.id === 'acc-auckland')!;
    const descendantIds = new Set(['acc-auckland', 'acc-akl-cbd', 'acc-akl-newmarket']);

    act(() => result.current.setSelectedAccountId('acc-auckland'));

    // All leaf items should belong to Auckland or its children
    for (const item of result.current.leafItems) {
      expect(descendantIds.has(item.accountId)).toBe(true);
    }

    // Tree root should be Auckland
    expect(result.current.tree.length).toBe(1);
    expect(result.current.tree[0].account.id).toBe(auckland.id);
  });

  it('leafItems contains only BillingLineItem objects with valid ids', () => {
    const { result } = renderHook(() => useBillingReport());
    for (const item of result.current.leafItems) {
      expect(item.id).toBeTruthy();
      expect(item.accountId).toBeTruthy();
      expect(item.category).toBeTruthy();
    }
  });

  it('setStartDate and setEndDate update the date range', () => {
    const { result } = renderHook(() => useBillingReport());
    act(() => {
      result.current.setStartDate('2025-01-01');
      result.current.setEndDate('2025-01-31');
    });
    expect(result.current.startDate).toBe('2025-01-01');
    expect(result.current.endDate).toBe('2025-01-31');
  });
});
