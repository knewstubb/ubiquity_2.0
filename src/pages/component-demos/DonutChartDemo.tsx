import { DonutChart } from '@/components/organisms/donut-chart'

interface DonutChartDemoProps {
  size?: 'sm' | 'md' | 'lg'
  showLegend?: boolean
  showCenterLabel?: boolean
}

const engagementSegments = [
  { value: 1936, color: '#0D9488', label: 'Read and clicked' },
  { value: 2906, color: '#14B88A', label: 'Read only' },
  { value: 7263, color: '#A1A1AA', label: 'Unread' },
  { value: 345, color: '#EF4444', label: 'Bounced' },
]

const deviceSegments = [
  { value: 65, color: '#14B88A', label: 'Mobile' },
  { value: 35, color: '#0D9488', label: 'Desktop' },
]

const statusSegments = [
  { value: 12105, color: '#14B88A', label: 'Delivered' },
  { value: 124, color: '#F59E0B', label: 'Hard Bounced' },
  { value: 221, color: '#EF4444', label: 'Soft Bounced' },
]

export default function DonutChartDemo({ size, showLegend, showCenterLabel }: DonutChartDemoProps) {
  const hasControls = size !== undefined || showLegend !== undefined || showCenterLabel !== undefined

  if (hasControls) {
    const total = engagementSegments.reduce((sum, s) => sum + s.value, 0)
    return (
      <DonutChart
        segments={engagementSegments}
        size={size ?? 'md'}
        showLegend={showLegend ?? true}
        centerLabel={showCenterLabel ? { value: total.toLocaleString('en-NZ'), label: 'Total' } : undefined}
      />
    )
  }

  // Default gallery view
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-muted-foreground mb-4">Email engagement breakdown</p>
        <DonutChart
          segments={engagementSegments}
          centerLabel={{ value: '12,450', label: 'Total' }}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-4">Device breakdown (small, no center label)</p>
        <DonutChart
          segments={deviceSegments}
          size="sm"
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-4">Delivery status (large)</p>
        <DonutChart
          segments={statusSegments}
          size="lg"
          centerLabel={{ value: '12,450', label: 'Sent' }}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-4">Without legend</p>
        <DonutChart
          segments={engagementSegments}
          showLegend={false}
          centerLabel={{ value: '12,450', label: 'Total' }}
        />
      </div>
    </div>
  )
}
