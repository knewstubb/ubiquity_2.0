import { useState, useCallback } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { AccountTreeNode } from './useBillingReport';
import type { BillingLineItem } from '../../models/billing';
import type { BillingCategory } from '../../models/billing';
import { usePricing } from '../../contexts/PricingContext';

export interface BillingTreeTableProps {
  tree: AccountTreeNode[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  onToggleSort: (column: string) => void;
}

const COLUMNS: { key: string; label: string; align?: 'right' }[] = [
  { key: 'account', label: 'Account' },
  { key: 'type', label: 'Type' },
  { key: 'description', label: 'Description' },
  { key: 'sendDate', label: 'Send Date' },
  { key: 'createdDate', label: 'Created/Activated' },
  { key: 'user', label: 'User' },
  { key: 'items', label: 'Items', align: 'right' },
  { key: 'unitPrice', label: 'Unit Price', align: 'right' },
  { key: 'total', label: 'Total', align: 'right' },
];

/** Format an ISO date string as DD MMM YYYY, e.g. "15 Jan 2025". */
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/** Format a number as NZD currency, e.g. "$1,234.56". */
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format unit price — show more decimals for small values. */
function formatUnitPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  // Show 3 decimal places for sub-dollar prices
  return `$${price.toFixed(3)}`;
}

/** Calculate the rolled-up total cost for a tree node. */
function calcNodeTotal(node: AccountTreeNode, prices: Record<BillingCategory, number>): number {
  const ownTotal = node.items.reduce(
    (sum, item) => sum + item.items * (prices[item.category as BillingCategory] ?? 0),
    0,
  );
  const childTotal = node.children.reduce((sum, c) => sum + calcNodeTotal(c, prices), 0);
  return ownTotal + childTotal;
}

export function BillingTreeTable({
  tree,
  sortColumn,
  sortDirection,
  onToggleSort,
}: BillingTreeTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { prices } = usePricing();

  const toggle = useCallback((accountId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  }, []);

  if (tree.length === 0) {
    return (
      <div className="text-center py-12 px-6 text-muted-foreground text-base">
        No billing data found for the selected criteria.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse font-sans">
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th
              key={col.key}
              className={cn(
                "bg-background font-semibold text-base text-left px-3 py-2.5 border-b-2 border-border cursor-pointer select-none text-foreground whitespace-nowrap hover:text-primary",
                col.align === 'right' && "text-right"
              )}
              onClick={() => onToggleSort(col.key)}
            >
              {col.label}
              {sortColumn === col.key && (
                <span className="ml-1 text-sm text-tertiary-foreground">
                  {sortDirection === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tree.map((node) => renderNode(node, expanded, toggle, prices))}
      </tbody>
    </table>
  );
}


// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderNode(
  node: AccountTreeNode,
  expanded: Set<string>,
  toggle: (id: string) => void,
  prices: Record<BillingCategory, number>,
): React.ReactNode[] {
  const rows: React.ReactNode[] = [];
  const isExpanded = expanded.has(node.account.id);
  const hasExpandableContent = node.children.length > 0 || node.items.length > 0;

  const indent = node.level * 24;

  const nodeTotal = calcNodeTotal(node, prices);

  // Account summary row
  rows.push(
    <tr
      key={`account-${node.account.id}`}
      className={cn(
        "border-b border-border cursor-pointer hover:bg-background",
        node.level === 0 && "bg-background font-semibold",
        node.level === 1 && "bg-zinc-100/50",
      )}
      onClick={() => hasExpandableContent && toggle(node.account.id)}
    >
      <td className="px-3 py-2 text-base text-foreground align-middle">
        <div className="flex items-center gap-1.5" style={{ paddingLeft: indent }}>
          {hasExpandableContent && (
            <span className={cn(
              "inline-flex items-center justify-center w-4 h-4 text-tertiary-foreground shrink-0 transition-transform duration-150",
              isExpanded && "rotate-90"
            )}>
              <CaretRight size={16} weight="bold" />
            </span>
          )}
          {node.account.name}
        </div>
      </td>
      <td className="px-3 py-2 text-base text-foreground align-middle" />
      <td className="px-3 py-2 text-base text-foreground align-middle" />
      <td className="px-3 py-2 text-base text-foreground align-middle" />
      <td className="px-3 py-2 text-base text-foreground align-middle" />
      <td className="px-3 py-2 text-base text-foreground align-middle" />
      <td className="px-3 py-2 text-base text-foreground align-middle text-right">
        {node.rolledUpTotal.toLocaleString()}
      </td>
      <td className="px-3 py-2 text-base text-foreground align-middle" />
      <td className="px-3 py-2 text-base text-foreground align-middle text-right">
        {nodeTotal > 0 ? formatCurrency(nodeTotal) : ''}
      </td>
    </tr>,
  );

  // Expanded content
  if (isExpanded) {
    // Line items for this account FIRST (parent's own items above children)
    for (const item of node.items) {
      rows.push(renderLineItem(item, node.level, prices));
    }

    // Then child account nodes
    for (const child of node.children) {
      rows.push(...renderNode(child, expanded, toggle, prices));
    }
  }

  return rows;
}

function renderLineItem(item: BillingLineItem, parentLevel: number, prices: Record<BillingCategory, number>): React.ReactNode {
  const indent = parentLevel * 24 + 24;
  const unitPrice = prices[item.category as BillingCategory] ?? 0;
  const total = item.items * unitPrice;

  return (
    <tr key={`item-${item.id}`} className="border-b border-border hover:bg-background">
      <td className="px-3 py-2 text-base text-foreground align-middle">
        <div style={{ paddingLeft: indent }} />
      </td>
      <td className="px-3 py-2 text-base text-foreground align-middle">{item.category}</td>
      <td className="px-3 py-2 text-base text-foreground align-middle">{item.description}</td>
      <td className="px-3 py-2 text-base text-foreground align-middle">{formatDate(item.sendDate)}</td>
      <td className="px-3 py-2 text-base text-foreground align-middle">{formatDate(item.createdDate)}</td>
      <td className="px-3 py-2 text-base text-foreground align-middle">{item.user}</td>
      <td className="px-3 py-2 text-base text-foreground align-middle text-right">{item.items.toLocaleString()}</td>
      <td className="px-3 py-2 text-base text-foreground align-middle text-right">{unitPrice > 0 ? formatUnitPrice(unitPrice) : ''}</td>
      <td className="px-3 py-2 text-base text-foreground align-middle text-right">{total > 0 ? formatCurrency(total) : ''}</td>
    </tr>
  );
}
