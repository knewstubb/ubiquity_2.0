import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import { cn } from '../lib/utils';
import type { CampaignStatus } from '../models/campaign';

interface SmsItem {
  id: string;
  name: string;
  status: CampaignStatus;
  sendCount: number;
}

const smsItems: SmsItem[] = [
  { id: 'sms-001', name: 'Appointment Reminder', status: 'active', sendCount: 1_240 },
  { id: 'sms-002', name: 'Booking Confirmation', status: 'active', sendCount: 986 },
  { id: 'sms-003', name: 'Flash Sale — 20% Off Massages', status: 'completed', sendCount: 512 },
  { id: 'sms-004', name: 'Loyalty Points Update', status: 'draft', sendCount: 0 },
  { id: 'sms-005', name: 'Wellington Store Reopening', status: 'paused', sendCount: 148 },
  { id: 'sms-006', name: 'Birthday Treat Voucher', status: 'active', sendCount: 327 },
];

const statusStyles: Record<CampaignStatus, string> = {
  active: 'bg-accent text-primary',
  paused: 'bg-warning-subtle text-warning',
  draft: 'bg-secondary text-tertiary-foreground',
  completed: 'bg-success-subtle text-success',
};

const columns: Column<SmsItem>[] = [
  { key: 'name', header: 'Name', render: (s) => s.name },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: (s) => (
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium leading-tight whitespace-nowrap",
        statusStyles[s.status]
      )}>
        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
      </span>
    ),
  },
  { key: 'sendCount', header: 'Sends', width: '120px', render: (s) => s.sendCount.toLocaleString() },
];

export default function SmsPage() {
  return (
    <PageShell title="SMS" subtitle="SMS content management">
      <DataTable columns={columns} data={smsItems} emptyMessage="No SMS items found" />
    </PageShell>
  );
}
