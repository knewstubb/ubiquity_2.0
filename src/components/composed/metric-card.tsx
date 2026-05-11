import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  className?: string
}

export function MetricCard({ label, value, trend, className }: MetricCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' && 'text-success-foreground',
              trend.direction === 'down' && 'text-destructive',
              trend.direction === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend.direction === 'up' && <TrendUp className="h-3 w-3" />}
            {trend.direction === 'down' && <TrendDown className="h-3 w-3" />}
            {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
            {trend.value}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
