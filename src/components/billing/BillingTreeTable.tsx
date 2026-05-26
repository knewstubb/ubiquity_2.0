import { useState, useCallback } from 'react';
import { CaretRight, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          {COLUMNS.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                "whitespace-nowrap cursor-pointer select-none hover:text-primary",
                col.align === 'right' && "text-right"
              )}
              onClick={() => onToggleSort(col.key)}
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                {sortColumn === col.key && (
                  sortDirection === 'asc'
                    ? <ArrowUp className="h-3 w-3" />
                    : <ArrowDown className="h-3 w-3" />
                )}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tree.map((node) => renderNode(node, expanded, toggle, prices))}
      </TableBody>
    </Table>
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
    <TableRow
      key={`account-${node.account.id}`}
      className={cn(
        "cursor-pointer hover:bg-secondary",
        node.level === 0 && "font-semibold",
        node.level === 1 && "bg-muted/30",
      )}
      onClick={() => hasExpandableContent && toggle(node.account.id)}
    >
      <TableCell>
        <div className="flex items-center gap-1.5" style={{ paddingLeft: indent }}>
          {hasExpandableContent && (
            <span className={cn(
              "inline-flex items-center justify-center w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-150",
              isExpanded && "rotate-90"
            )}>
              <CaretRight size={14} weight="bold" />
            </span>
          )}
          {node.account.name}
        </div>
      </TableCell>
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell className="text-right tabular-nums">
        {node.rolledUpTotal.toLocaleString()}
      </TableCell>
      <TableCell />
      <TableCell className="text-right tabular-nums">
        {nodeTotal > 0 ? formatCurrency(nodeTotal) : ''}
      </TableCell>
    </TableRow>,
  );

  // Expanded content
  if (isExpanded) {
    for (const item of node.items) {
      rows.push(renderLineItem(item, node.level, prices));
    }
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
    <TableRow key={`item-${item.id}`} className="hover:bg-secondary">
      <TableCell>
        <div style={{ paddingLeft: indent }} />
      </TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>{item.description}</TableCell>
      <TableCell>{formatDate(item.sendDate)}</TableCell>
      <TableCell>{formatDate(item.createdDate)}</TableCell>
      <TableCell>{item.user}</TableCell>
      <TableCell className="text-right tabular-nums">{item.items.toLocaleString()}</TableCell>
      <TableCell className="text-right tabular-nums">{unitPrice > 0 ? formatUnitPrice(unitPrice) : ''}</TableCell>
      <TableCell className="text-right tabular-nums">{total > 0 ? formatCurrency(total) : ''}</TableCell>
    </TableRow>
  );
}
