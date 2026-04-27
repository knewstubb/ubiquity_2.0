import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBillingReport, type AccountTreeNode } from '../../components/billing/useBillingReport';

/**
 * Property 7: Rolled-Up Totals Equal Sum of Descendants
 * **Validates: Requirements 2.2**
 *
 * FOR ALL parent/child accounts, rolled-up total equals sum of descendant leaf items.
 */

/** Recursively collect all leaf-level items from a tree node and its descendants */
function collectAllLeafItems(node: AccountTreeNode): number {
  const ownTotal = node.items.reduce((sum, item) => sum + item.items, 0);
  const childTotal = node.children.reduce((sum, child) => sum + collectAllLeafItems(child), 0);
  return ownTotal + childTotal;
}

/** Recursively verify rolled-up totals for every node in the tree */
function verifyRolledUpTotals(node: AccountTreeNode): void {
  const expectedTotal = collectAllLeafItems(node);
  expect(node.rolledUpTotal).toBe(expectedTotal);

  // Verify children recursively
  for (const child of node.children) {
    verifyRolledUpTotals(child);
  }
}

describe('Property 7: Rolled-Up Totals Equal Sum of Descendants', () => {
  it('FOR ALL nodes in the tree, rolledUpTotal equals sum of own items + all descendant items', () => {
    const { result } = renderHook(() => useBillingReport());

    expect(result.current.tree.length).toBeGreaterThan(0);

    for (const rootNode of result.current.tree) {
      verifyRolledUpTotals(rootNode);
    }
  });

  it('parent nodes with children have rolledUpTotal >= sum of direct children rolledUpTotals', () => {
    const { result } = renderHook(() => useBillingReport());

    function checkNode(node: AccountTreeNode) {
      if (node.children.length > 0) {
        const childSum = node.children.reduce((sum, c) => sum + c.rolledUpTotal, 0);
        // Parent total should be >= child sum (parent may have own items too)
        expect(node.rolledUpTotal).toBeGreaterThanOrEqual(childSum);
      }
      node.children.forEach(checkNode);
    }

    result.current.tree.forEach(checkNode);
  });

  it('leaf nodes (no children, no items) do not appear in the tree', () => {
    const { result } = renderHook(() => useBillingReport());

    function checkNode(node: AccountTreeNode) {
      // A node in the tree must have items or children
      const hasContent = node.items.length > 0 || node.children.length > 0;
      expect(hasContent).toBe(true);
      node.children.forEach(checkNode);
    }

    result.current.tree.forEach(checkNode);
  });
});
