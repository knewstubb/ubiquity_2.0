import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import { useAccount } from '../contexts/AccountContext';
import { segments } from '../data/segments';
import type { Segment } from '../models/segment';
import styles from './SegmentsPage.module.css';

const columns: Column<Segment>[] = [
  { key: 'name', header: 'Name', render: (s) => s.name },
  {
    key: 'type',
    header: 'Type',
    width: '120px',
    render: (s) => (
      <span className={`${styles.typeBadge} ${styles[s.type]}`}>
        {s.type === 'smart' ? 'Smart' : 'Manual'}
      </span>
    ),
  },
  {
    key: 'memberCount',
    header: 'Members',
    width: '120px',
    render: (s) => s.memberCount.toLocaleString(),
  },
];

export default function SegmentsPage() {
  const { filterByAccount } = useAccount();
  const navigate = useNavigate();
  const data = filterByAccount(segments);

  return (
    <PageShell title="Segments" subtitle="Smart and manual audience segments">
      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No segments found"
        onRowClick={(segment) => navigate(`/audiences/segments/${segment.id}`)}
      />
    </PageShell>
  );
}
