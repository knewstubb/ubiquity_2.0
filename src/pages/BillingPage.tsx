import { PageShell } from '../components/layout/PageShell';
import { MetricCard } from '../components/shared/MetricCard';
import { DataTable, type Column } from '../components/shared/DataTable';
import styles from './pages.module.css';

interface UsageItem {
  id: string;
  metric: string;
  used: string;
  limit: string;
  percentage: number;
}

const usageItems: UsageItem[] = [
  { id: 'usg-001', metric: 'Contacts', used: '48', limit: '5,000', percentage: 1 },
  { id: 'usg-002', metric: 'Emails Sent', used: '2,340', limit: '50,000', percentage: 5 },
  { id: 'usg-003', metric: 'SMS Sent', used: '512', limit: '10,000', percentage: 5 },
  { id: 'usg-004', metric: 'Active Journeys', used: '6', limit: '25', percentage: 24 },
  { id: 'usg-005', metric: 'File Storage', used: '128 MB', limit: '5 GB', percentage: 3 },
];

const columns: Column<UsageItem>[] = [
  { key: 'metric', header: 'Metric', render: (u) => u.metric },
  { key: 'used', header: 'Used', width: '120px', render: (u) => u.used },
  { key: 'limit', header: 'Limit', width: '120px', render: (u) => u.limit },
  { key: 'percentage', header: 'Usage', width: '100px', render: (u) => `${u.percentage}%` },
];

export default function BillingPage() {
  return (
    <PageShell title="Billing" subtitle="Usage metrics and plan information">
      <div className={styles.section}>
        <div className={styles.metricsGrid}>
          <MetricCard label="Current Plan" value="Growth" subtitle="Billed monthly" />
          <MetricCard label="Monthly Cost" value="$149" subtitle="Next billing: 1 Feb 2025" />
          <MetricCard label="Billing Cycle" value="Monthly" subtitle="Since Oct 2024" />
          <MetricCard label="Payment Method" value="Visa •••• 4242" subtitle="Expires 08/26" />
        </div>
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Usage Summary</h2>
        <DataTable columns={columns} data={usageItems} emptyMessage="No usage data" />
      </div>
    </PageShell>
  );
}
