import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import type { CampaignStatus } from '../models/campaign';
import styles from './EmailsPage.module.css';

interface EmailItem {
  id: string;
  name: string;
  status: CampaignStatus;
  lastModified: string;
}

const emailItems: EmailItem[] = [
  { id: 'em-001', name: 'Welcome to Serenity Spa', status: 'active', lastModified: '2025-01-10' },
  { id: 'em-002', name: 'Monthly Wellness Newsletter', status: 'active', lastModified: '2025-01-15' },
  { id: 'em-003', name: 'Gold Member Exclusive Offer', status: 'draft', lastModified: '2025-01-18' },
  { id: 'em-004', name: 'Booking Confirmation', status: 'active', lastModified: '2024-12-05' },
  { id: 'em-005', name: 'Re-engagement — We Miss You', status: 'paused', lastModified: '2024-11-20' },
  { id: 'em-006', name: 'Queenstown Winter Retreat Promo', status: 'completed', lastModified: '2024-09-01' },
];

const columns: Column<EmailItem>[] = [
  { key: 'name', header: 'Name', render: (e) => e.name },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: (e) => (
      <span className={`${styles.statusBadge} ${styles[e.status]}`}>
        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
      </span>
    ),
  },
  { key: 'lastModified', header: 'Last Modified', width: '160px', render: (e) => e.lastModified },
];

export default function EmailsPage() {
  return (
    <PageShell title="Emails" subtitle="Standalone email content management">
      <DataTable columns={columns} data={emailItems} emptyMessage="No emails found" />
    </PageShell>
  );
}
