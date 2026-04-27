import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import type { CampaignStatus } from '../models/campaign';
import styles from './FormsPage.module.css';

interface FormItem {
  id: string;
  name: string;
  status: CampaignStatus;
  responseCount: number;
}

const formItems: FormItem[] = [
  { id: 'frm-001', name: 'New Member Registration', status: 'active', responseCount: 342 },
  { id: 'frm-002', name: 'Post-Treatment Feedback', status: 'active', responseCount: 187 },
  { id: 'frm-003', name: 'Wellness Preferences Survey', status: 'draft', responseCount: 0 },
  { id: 'frm-004', name: 'Auckland Open Day RSVP', status: 'completed', responseCount: 89 },
  { id: 'frm-005', name: 'Loyalty Programme Sign-Up', status: 'active', responseCount: 214 },
  { id: 'frm-006', name: 'Christchurch Grand Opening Interest', status: 'paused', responseCount: 56 },
];

const columns: Column<FormItem>[] = [
  { key: 'name', header: 'Name', render: (f) => f.name },
  {
    key: 'status',
    header: 'Status',
    width: '120px',
    render: (f) => (
      <span className={`${styles.statusBadge} ${styles[f.status]}`}>
        {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
      </span>
    ),
  },
  { key: 'responseCount', header: 'Responses', width: '120px', render: (f) => f.responseCount.toLocaleString() },
];

export default function FormsPage() {
  return (
    <PageShell title="Forms" subtitle="Form builder and response tracking">
      <DataTable columns={columns} data={formItems} emptyMessage="No forms found" />
    </PageShell>
  );
}
