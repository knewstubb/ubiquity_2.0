import { DataTable, type DataTableColumn } from '@/components/composed/data-table'
import { StatusBadge, type StatusBadgeVariant } from '@/components/composed/status-badge'

interface Contact {
  name: string
  email: string
  status: string
  lastActive: string
  score: string
}

const columns: DataTableColumn<Contact>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const variant = (value === 'Active' ? 'active' : value === 'Invited' ? 'invited' : 'inactive') as StatusBadgeVariant
      return <StatusBadge variant={variant}>{value as string}</StatusBadge>
    },
  },
  { key: 'lastActive', label: 'Last Active', sortable: true, align: 'right' },
  { key: 'score', label: 'Score', sortable: true, align: 'right' },
]

const data: Contact[] = [
  { name: 'Sarah Chen', email: 'sarah@acme.com', status: 'Active', lastActive: '2 hours ago', score: '92' },
  { name: 'James Wilson', email: 'james@corp.io', status: 'Active', lastActive: '1 day ago', score: '78' },
  { name: 'Maria Lopez', email: 'maria@startup.co', status: 'Invited', lastActive: '—', score: '—' },
  { name: 'David Kim', email: 'david@tech.dev', status: 'Inactive', lastActive: '30 days ago', score: '45' },
  { name: 'Emma Thompson', email: 'emma@design.io', status: 'Active', lastActive: '5 min ago', score: '88' },
]

export default function DataTableDemo() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Click column headers to sort.</p>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
