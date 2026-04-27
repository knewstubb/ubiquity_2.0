import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import type { CampaignStatus } from '../models/campaign';
import styles from './SmsPage.module.css';

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

const columns: Column<SmsItem>[] = [
  { key: 'name', header: 'Name', render: (s) => s.name },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: (s) => (
      <span className={`${styles.statusBadge} ${styles[s.status]}`}>
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
