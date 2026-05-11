import { MetricCard } from '@/components/composed/metric-card'

export default function MetricCardDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Total Contacts"
        value="12,345"
        trend={{ value: '+12%', direction: 'up' }}
      />
      <MetricCard
        label="Open Rate"
        value="42.3%"
        trend={{ value: '+3.2%', direction: 'up' }}
      />
      <MetricCard
        label="Bounce Rate"
        value="2.1%"
        trend={{ value: '+0.5%', direction: 'down' }}
      />
      <MetricCard
        label="Active Campaigns"
        value="8"
        trend={{ value: '0%', direction: 'neutral' }}
      />
    </div>
  )
}
