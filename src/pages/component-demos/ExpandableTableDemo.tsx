import { ExpandableTable, ExpandableRow, DISCLOSURE_INDENT } from '@/components/composed/expandable-table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { key: 'time', label: 'Time', width: '100px' },
  { key: 'status', label: 'Status', width: '90px' },
  { key: 'name', label: 'Name', width: '180px' },
  { key: 'duration', label: 'Duration', width: '70px' },
  { key: 'summary', label: 'Summary', width: 'flex-1', align: 'right' as const },
]

interface ChildRow {
  name: string
  ok: boolean
  message: string
}

interface SampleRow {
  id: string
  time: string
  status: 'error' | 'default' | 'neutral-subtle'
  statusLabel: string
  name: string
  duration: string
  summary: string
  expandable: boolean
  children: ChildRow[]
}

const ALL_ROWS: SampleRow[] = [
  {
    id: 'row-1',
    time: '2 days ago',
    status: 'error',
    statusLabel: 'Failed',
    name: 'Batch import #142',
    duration: '4m 24s',
    summary: '1 ok, 2 failed',
    expandable: true,
    children: [
      { name: 'contacts_batch_a.csv', ok: true, message: 'File imported successfully.' },
      { name: 'contacts_batch_b.csv', ok: false, message: 'File exceeds maximum size limit.' },
      { name: 'contacts_batch_c.csv', ok: false, message: 'Connection timeout after 30s. · Stuck' },
    ],
  },
  {
    id: 'row-2',
    time: '3 days ago',
    status: 'default',
    statusLabel: 'Completed',
    name: 'Batch import #141',
    duration: '3m 58s',
    summary: '4/4 succeeded',
    expandable: true,
    children: [
      { name: 'members_a.csv', ok: true, message: 'File imported successfully.' },
      { name: 'members_b.csv', ok: true, message: 'File imported successfully.' },
      { name: 'members_c.csv', ok: true, message: 'File imported successfully.' },
      { name: 'members_d.csv', ok: true, message: 'File imported successfully.' },
    ],
  },
  {
    id: 'row-3',
    time: '4 days ago',
    status: 'neutral-subtle',
    statusLabel: 'Skipped',
    name: 'Batch import #140',
    duration: '< 1s',
    summary: '—',
    expandable: false,
    children: [],
  },
  {
    id: 'row-4',
    time: '5 days ago',
    status: 'default',
    statusLabel: 'Completed',
    name: 'Batch import #139',
    duration: '2m 11s',
    summary: '1/1 succeeded',
    expandable: true,
    children: [
      { name: 'loyalty_export_20260524.csv', ok: true, message: 'File imported successfully.' },
    ],
  },
  {
    id: 'row-5',
    time: '6 days ago',
    status: 'error',
    statusLabel: 'Failed',
    name: 'Batch import #138',
    duration: '5m 02s',
    summary: '2 ok, 1 failed',
    expandable: true,
    children: [
      { name: 'contacts_part1.csv', ok: true, message: 'File imported successfully.' },
      { name: 'contacts_part2.csv', ok: true, message: 'File imported successfully.' },
      { name: 'contacts_part3.csv', ok: false, message: 'Malformed CSV — header row missing.' },
    ],
  },
]

export default function ExpandableTableDemo(props: Record<string, unknown>) {
  const rowCount = (props['row-count'] as number) ?? 3
  const showNonExpandable = (props['show-non-expandable'] as boolean) ?? true
  const defaultExpanded = (props['default-expanded'] as boolean) ?? false

  const rows = ALL_ROWS
    .filter((row) => showNonExpandable || row.expandable)
    .slice(0, rowCount)

  return (
    <div className="border border-border rounded overflow-hidden">
      <ExpandableTable columns={COLUMNS}>
        {rows.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground" role="row">
            No runs recorded yet.
          </div>
        ) : (
          rows.map((row, idx) => (
            <ExpandableRow
              key={row.id}
              id={row.id}
              expandable={row.expandable}
              defaultExpanded={defaultExpanded && idx === 0}
              ariaLabel={`${row.name} — ${row.statusLabel}`}
              cells={[
                <span key="time" className="w-[100px] shrink-0 text-sm text-muted-foreground">{row.time}</span>,
                <span key="status" className="w-[90px] shrink-0"><Badge variant={row.status}>{row.statusLabel}</Badge></span>,
                <span key="name" className="w-[180px] shrink-0 text-sm text-foreground">{row.name}</span>,
                <span key="duration" className="w-[70px] shrink-0 text-sm text-muted-foreground">{row.duration}</span>,
                <span key="summary" className="flex-1 text-sm text-muted-foreground text-right">{row.summary}</span>,
              ]}
            >
              <div className="flex flex-col">
                {row.children.map((child, childIdx) => (
                  <div key={childIdx} className="flex items-center gap-6 py-2 px-4 text-sm" style={{ marginLeft: DISCLOSURE_INDENT }}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        child.ok ? 'bg-primary' : 'bg-destructive'
                      )} />
                      <span className="text-foreground truncate">{child.name}</span>
                    </div>
                    <span className="flex-1 text-muted-foreground truncate">{child.message}</span>
                  </div>
                ))}
              </div>
            </ExpandableRow>
          ))
        )}
      </ExpandableTable>
    </div>
  )
}
