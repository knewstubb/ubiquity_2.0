import { Fragment } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface StatBarItem {
  /** The label describing the stat */
  label: string
  /** The value to display */
  value: string | number
}

interface StatBarProps {
  /** Array of stat items to display */
  items: StatBarItem[]
  /** Optional className for the container */
  className?: string
}

/**
 * A horizontal bar of stats with separators between each item.
 * Used for secondary metrics displays, e.g., below primary metric cards.
 */
export function StatBar({ items, className }: StatBarProps) {
  if (items.length === 0) return null

  return (
    <Card className={cn('overflow-x-auto', className)}>
      <CardContent className="flex items-center justify-between p-2">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <Separator orientation="vertical" className="h-8" />}
            <div className="flex flex-col items-center px-4 py-2">
              <span className="text-lg font-semibold text-foreground tabular-nums">
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}
