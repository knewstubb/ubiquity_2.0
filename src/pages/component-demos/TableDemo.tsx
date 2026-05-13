import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface TableDemoProps {
  rowCount?: number
  showHeader?: boolean
  striped?: boolean
}

const campaigns = [
  { name: 'Summer Sale 2024', status: 'Sent', opens: '42.3%', clicks: '8.7%', date: '2024-06-15' },
  { name: 'Welcome Series', status: 'Active', opens: '65.1%', clicks: '12.4%', date: '2024-05-01' },
  { name: 'Re-engagement', status: 'Draft', opens: '—', clicks: '—', date: '2024-07-01' },
  { name: 'Product Launch', status: 'Scheduled', opens: '—', clicks: '—', date: '2024-07-10' },
  { name: 'Newsletter #42', status: 'Sent', opens: '38.9%', clicks: '5.2%', date: '2024-06-01' },
  { name: 'Flash Promo', status: 'Sent', opens: '51.2%', clicks: '11.0%', date: '2024-06-20' },
  { name: 'Loyalty Rewards', status: 'Active', opens: '47.8%', clicks: '9.3%', date: '2024-05-15' },
  { name: 'Year in Review', status: 'Draft', opens: '—', clicks: '—', date: '2024-12-01' },
]

export default function TableDemo({ rowCount, showHeader, striped }: TableDemoProps) {
  const hasControls = rowCount !== undefined

  if (hasControls) {
    const rows = campaigns.slice(0, rowCount)

    return (
      <Table>
        <TableCaption>Recent campaign performance.</TableCaption>
        {showHeader && (
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead>Click Rate</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {rows.map((campaign, i) => (
            <TableRow key={campaign.name} className={cn(striped && i % 2 === 1 && 'bg-muted/50')}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.status}</TableCell>
              <TableCell>{campaign.opens}</TableCell>
              <TableCell>{campaign.clicks}</TableCell>
              <TableCell className="text-right">{campaign.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Table>
        <TableCaption>Recent campaign performance.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Open Rate</TableHead>
            <TableHead>Click Rate</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.slice(0, 5).map((campaign) => (
            <TableRow key={campaign.name}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.status}</TableCell>
              <TableCell>{campaign.opens}</TableCell>
              <TableCell>{campaign.clicks}</TableCell>
              <TableCell className="text-right">{campaign.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
