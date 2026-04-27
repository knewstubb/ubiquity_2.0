import type { BillingLineItem } from '../models/billing';
import { accounts } from '../data/accounts';

const accountNameMap = new Map(accounts.map((a) => [a.id, a.name]));

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadBillingCsv(items: BillingLineItem[]): void {
  const headers = ['Account', 'Type', 'Description', 'Send Date', 'Items', 'Created/Activated Date', 'User'];

  const rows = items.map((item) => [
    escapeCsvValue(accountNameMap.get(item.accountId) ?? item.accountId),
    escapeCsvValue(item.category),
    escapeCsvValue(item.description),
    escapeCsvValue(formatDate(item.sendDate)),
    String(item.items),
    escapeCsvValue(formatDate(item.createdDate)),
    escapeCsvValue(item.user),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const filename = `billing-report-${yyyy}-${mm}-${dd}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
