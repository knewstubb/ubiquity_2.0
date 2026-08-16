import { cn } from '@/lib/utils'

export interface DonutSegment {
  /** The numeric value for this segment */
  value: number
  /** The color for this segment (hex or CSS color) */
  color: string
  /** The label to display in the legend */
  label: string
}

interface DonutChartProps {
  /** Array of segments to display in the donut */
  segments: DonutSegment[]
  /** Optional center label (e.g., total value) */
  centerLabel?: {
    value: string | number
    label: string
  }
  /** Whether to show the legend */
  showLegend?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Format function for legend values */
  formatValue?: (value: number) => string
  /** Optional className */
  className?: string
}

const sizeConfig = {
  sm: { container: 'w-24 h-24', strokeWidth: 8, radius: 40, valueText: 'text-lg', labelText: 'text-[10px]' },
  md: { container: 'w-44 h-44', strokeWidth: 12, radius: 40, valueText: 'text-3xl', labelText: 'text-xs' },
  lg: { container: 'w-56 h-56', strokeWidth: 14, radius: 40, valueText: 'text-4xl', labelText: 'text-sm' },
}

/**
 * A donut chart for visualizing proportional data with optional center label and legend.
 */
export function DonutChart({
  segments,
  centerLabel,
  showLegend = true,
  size = 'md',
  formatValue = (v) => v.toLocaleString('en-NZ'),
  className,
}: DonutChartProps) {
  const config = sizeConfig[size]
  const total = segments.reduce((sum, seg) => sum + seg.value, 0)
  const circumference = 2 * Math.PI * config.radius

  // Calculate cumulative offset for each segment
  let cumulativeOffset = 0

  return (
    <div className={cn('flex items-center gap-8', className)}>
      <div className={cn('relative', config.container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {segments.map((segment, index) => {
            const percent = total > 0 ? (segment.value / total) * 100 : 0
            const strokeLength = (percent / 100) * circumference
            const offset = cumulativeOffset
            cumulativeOffset += strokeLength

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={config.radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={config.strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                strokeDashoffset={-offset}
                className="transition-all duration-500"
              />
            )
          })}
        </svg>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-bold text-foreground', config.valueText)}>
              {centerLabel.value}
            </span>
            <span className={cn('text-muted-foreground', config.labelText)}>
              {centerLabel.label}
            </span>
          </div>
        )}
      </div>
      {showLegend && (
        <div className="flex flex-col gap-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm shrink-0" 
                style={{ backgroundColor: segment.color }} 
              />
              <span className="text-sm text-foreground">{segment.label}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums ml-auto">
                {formatValue(segment.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
