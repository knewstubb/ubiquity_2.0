import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';
import { useAccount } from '../contexts/AccountContext';
import { segments } from '../data/segments';
import { cn } from '../lib/utils';
import type { Segment } from '../models/segment';

const columns: Column<Segment>[] = [
  { key: 'name', header: 'Name', render: (s) => s.name },
  {
    key: 'type',
    header: 'Type',
    width: '120px',
    render: (s) => (
      <span className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium leading-tight whitespace-nowrap",
        s.type === 'smart' && "bg-accent text-accent-foreground",
        s.type === 'manual' && "bg-secondary text-muted-foreground"
      )}>
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
