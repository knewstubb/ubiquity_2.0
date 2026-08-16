import { StatBar } from '@/components/composed/stat-bar'

interface StatBarDemoProps {
  itemCount?: number
}

const allItems = [
  { label: 'Total Messages', value: '12,450' },
  { label: 'Delivered', value: '12,105' },
  { label: 'Opened', value: '4,842' },
  { label: 'Clicked', value: '1,936' },
  { label: 'Bounced', value: '345' },
  { label: 'Unsubscribed', value: '24' },
]

export default function StatBarDemo({ itemCount }: StatBarDemoProps) {
  const hasControls = itemCount !== undefined

  if (hasControls) {
    const items = allItems.slice(0, itemCount)
    return <StatBar items={items} />
  }

  // Default gallery view
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground mb-2">4 items (typical usage)</p>
        <StatBar items={allItems.slice(0, 4)} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">6 items (full row)</p>
        <StatBar items={allItems} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">2 items (minimal)</p>
        <StatBar items={allItems.slice(0, 2)} />
      </div>
    </div>
  )
}
