import { PageShell } from '../components/layout/PageShell';
import { DataTable, type Column } from '../components/shared/DataTable';

interface ReportItem {
  id: string;
  name: string;
  type: string;
  dateRange: string;
}

const reportItems: ReportItem[] = [
  { id: 'rpt-001', name: 'Monthly Campaign Performance', type: 'Campaign', dateRange: '2025-01-01 – 2025-01-31' },
  { id: 'rpt-002', name: 'Q4 2024 Revenue Attribution', type: 'Revenue', dateRange: '2024-10-01 – 2024-12-31' },
  { id: 'rpt-003', name: 'Email Engagement Summary', type: 'Email', dateRange: '2025-01-01 – 2025-01-31' },
  { id: 'rpt-004', name: 'Segment Growth Trends', type: 'Audience', dateRange: '2024-07-01 – 2024-12-31' },
  { id: 'rpt-005', name: 'Journey Completion Rates', type: 'Journey', dateRange: '2025-01-01 – 2025-01-31' },
  { id: 'rpt-006', name: 'Contact Acquisition by Region', type: 'Audience', dateRange: '2024-01-01 – 2024-12-31' },
];

const columns: Column<ReportItem>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name },
  { key: 'type', header: 'Type', width: '140px', render: (r) => r.type },
  { key: 'dateRange', header: 'Date Range', width: '240px', render: (r) => r.dateRange },
];

export default function ReportsPage() {
  return (
    <PageShell title="Reports" subtitle="Journey and campaign performance reports">
      <DataTable columns={columns} data={reportItems} emptyMessage="No reports found" />
    </PageShell>
  );
}
