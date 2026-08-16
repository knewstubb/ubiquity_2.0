import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'

interface MetricCardProps {
  /** The label describing the metric */
  label: string
  /** The value to display */
  value: string | number
  /** Optional trend indicator (for horizontal layout) */
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  /** Optional icon (for centered layout) */
  icon?: React.ReactNode
  /** Layout style: horizontal (default) or centered */
  layout?: 'horizontal' | 'centered'
  /** Color variant for icon (centered layout only) */
  variant?: 'default' | 'success' | 'warning' | 'muted'
  className?: string
}

const iconVariantClasses = {
  default: 'text-primary',
  success: 'text-primary',
  warning: 'text-amber-500',
  muted: 'text-muted-foreground',
}

export function MetricCard({
  label,
  value,
  trend,
  icon,
  layout = 'horizontal',
  variant = 'default',
  className,
}: MetricCardProps) {
  // Centered layout: icon at top, value in middle, label at bottom
  if (layout === 'centered') {
    return (
      <Card className={cn('min-w-[120px]', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-2 p-4">
          {icon && (
            <div className={cn('flex items-center justify-center', iconVariantClasses[variant])}>
              {icon}
            </div>
          )}
          <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
          <span className="text-xs font-medium text-muted-foreground text-center">{label}</span>
        </CardContent>
      </Card>
    )
  }

  // Horizontal layout (default): label at top-left, value below, trend at top-right
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
