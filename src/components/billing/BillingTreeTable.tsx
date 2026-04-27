import { useState, useCallback } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import type { AccountTreeNode } from './useBillingReport';
import type { BillingLineItem } from '../../models/billing';
import styles from './BillingTreeTable.module.css';

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
  { key: 'items', label: 'Items', align: 'right' },
  { key: 'createdDate', label: 'Created/Activated Date' },
  { key: 'user', label: 'User' },
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

export function BillingTreeTable({
  tree,
  sortColumn,
  sortDirection,
  onToggleSort,
}: BillingTreeTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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
      <div className={styles.emptyState}>
        No billing data found for the selected criteria.
      </div>
    );
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th
              key={col.key}
              className={col.align === 'right' ? styles.headerCellItems : styles.headerCell}
              onClick={() => onToggleSort(col.key)}
            >
              {col.label}
              {sortColumn === col.key && (
                <span className={styles.sortArrow}>
                  {sortDirection === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tree.map((node) => renderNode(node, expanded, toggle))}
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
): React.ReactNode[] {
  const rows: React.ReactNode[] = [];
  const isExpanded = expanded.has(node.account.id);
  const hasExpandableContent = node.children.length > 0 || node.items.length > 0;

  // Determine row class based on level
  const rowClass =
    node.level === 0
      ? styles.accountRowLevel0
      : node.level === 1
        ? styles.accountRowLevel1
        : styles.accountRowLevel2;

  const indent = node.level * 24;

  // Account summary row
  rows.push(
    <tr
      key={`account-${node.account.id}`}
      className={rowClass}
      onClick={() => hasExpandableContent && toggle(node.account.id)}
    >
      <td className={styles.bodyCell}>
        <div className={styles.accountCell} style={{ paddingLeft: indent }}>
          {hasExpandableContent && (
            <span className={isExpanded ? styles.chevronExpanded : styles.chevron}>
              <CaretRight size={16} weight="bold" />
            </span>
          )}
          {node.account.name}
        </div>
      </td>
      <td className={styles.bodyCell} />
      <td className={styles.bodyCell} />
      <td className={styles.bodyCell} />
      <td className={styles.bodyCellItems}>
        {node.rolledUpTotal.toLocaleString()}
      </td>
      <td className={styles.bodyCell} />
      <td className={styles.bodyCell} />
    </tr>,
  );

  // Expanded content
  if (isExpanded) {
    // Child account nodes
    for (const child of node.children) {
      rows.push(...renderNode(child, expanded, toggle));
    }

    // Line items for this account
    for (const item of node.items) {
      rows.push(renderLineItem(item, node.level));
    }
  }

  return rows;
}

function renderLineItem(item: BillingLineItem, parentLevel: number): React.ReactNode {
  const indent = parentLevel * 24 + 24;

  return (
    <tr key={`item-${item.id}`} className={styles.lineItemRow}>
      <td className={styles.bodyCell}>
        <div style={{ paddingLeft: indent }} />
      </td>
      <td className={styles.bodyCell}>{item.category}</td>
      <td className={styles.bodyCell}>{item.description}</td>
      <td className={styles.bodyCell}>{formatDate(item.sendDate)}</td>
      <td className={styles.bodyCellItems}>{item.items.toLocaleString()}</td>
      <td className={styles.bodyCell}>{formatDate(item.createdDate)}</td>
      <td className={styles.bodyCell}>{item.user}</td>
    </tr>
  );
}
