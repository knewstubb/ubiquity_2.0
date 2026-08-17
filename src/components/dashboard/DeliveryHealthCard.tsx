import { ShieldCheck, Warning, TrendUp, TrendDown } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { Mailout } from '../../models/mailout';

interface DeliveryHealthCardProps {
  mailouts: Mailout[];
}

interface HealthMetric {
  label: string;
  value: number;
  format: 'percent' | 'number';
  status: 'good' | 'warning' | 'critical';
  trend?: number;
}

/**
 * Calculates delivery health metrics from mailout data
 */
function calculateHealthMetrics(mailouts: Mailout[]): {
  deliverabilityScore: number;
  bounceRate: number;
  hardBounceRate: number;
  spamRate: number;
  totalSent: number;
  totalDelivered: number;
  trend: number;
} {
  const sentMailouts = mailouts.filter(m => m.status === 'sent' || m.status === 'sending');
  
  if (sentMailouts.length === 0) {
    return {
      deliverabilityScore: 100,
      bounceRate: 0,
      hardBounceRate: 0,
      spamRate: 0,
      totalSent: 0,
      totalDelivered: 0,
      trend: 0,
    };
  }

  const totals = sentMailouts.reduce(
    (acc, m) => ({
      sent: acc.sent + m.metrics.sent,
      delivered: acc.delivered + m.metrics.delivered,
      bounced: acc.bounced + m.metrics.bounced,
      hardBounced: acc.hardBounced + m.metrics.hardBounced,
      spamComplaints: acc.spamComplaints + m.metrics.spamComplaints,
    }),
    { sent: 0, delivered: 0, bounced: 0, hardBounced: 0, spamComplaints: 0 }
  );

  const deliverabilityScore = totals.sent > 0 ? (totals.delivered / totals.sent) * 100 : 100;
  const bounceRate = totals.sent > 0 ? (totals.bounced / totals.sent) * 100 : 0;
  const hardBounceRate = totals.sent > 0 ? (totals.hardBounced / totals.sent) * 100 : 0;
  const spamRate = totals.delivered > 0 ? (totals.spamComplaints / totals.delivered) * 100 : 0;

  // Calculate trend by comparing recent vs older mailouts
  const sortedByDate = [...sentMailouts].sort(
    (a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime()
  );
  const midpoint = Math.ceil(sortedByDate.length / 2);
  const recent = sortedByDate.slice(0, midpoint);
  const older = sortedByDate.slice(midpoint);

  const recentDeliveryRate = recent.reduce((sum, m) => sum + m.metrics.delivered, 0) /
    Math.max(recent.reduce((sum, m) => sum + m.metrics.sent, 0), 1) * 100;
  const olderDeliveryRate = older.reduce((sum, m) => sum + m.metrics.delivered, 0) /
    Math.max(older.reduce((sum, m) => sum + m.metrics.sent, 0), 1) * 100;
  
  const trend = older.length > 0 ? recentDeliveryRate - olderDeliveryRate : 0;

  return {
    deliverabilityScore,
    bounceRate,
    hardBounceRate,
    spamRate,
    totalSent: totals.sent,
    totalDelivered: totals.delivered,
    trend,
  };
}

/**
 * Gets status based on metric type and value
 */
function getMetricStatus(type: 'deliverability' | 'bounce' | 'spam', value: number): 'good' | 'warning' | 'critical' {
  switch (type) {
    case 'deliverability':
      if (value >= 97) return 'good';
      if (value >= 95) return 'warning';
      return 'critical';
    case 'bounce':
      if (value <= 2) return 'good';
      if (value <= 5) return 'warning';
      return 'critical';
    case 'spam':
      if (value <= 0.1) return 'good';
      if (value <= 0.3) return 'warning';
      return 'critical';
    default:
      return 'good';
  }
}

const statusColors = {
  good: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'text-primary',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    icon: 'text-amber-500',
  },
  critical: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    icon: 'text-destructive',
  },
};

/**
 * Delivery Health Card — shows bounce rate, spam complaints, and deliverability score
 */
export function DeliveryHealthCard({ mailouts }: DeliveryHealthCardProps) {
  const metrics = calculateHealthMetrics(mailouts);
  const overallStatus = getMetricStatus('deliverability', metrics.deliverabilityScore);
  const colors = statusColors[overallStatus];

  const healthMetrics: HealthMetric[] = [
    {
      label: 'Deliverability',
      value: metrics.deliverabilityScore,
      format: 'percent',
      status: getMetricStatus('deliverability', metrics.deliverabilityScore),
      trend: metrics.trend,
    },
    {
      label: 'Bounce Rate',
      value: metrics.bounceRate,
      format: 'percent',
      status: getMetricStatus('bounce', metrics.bounceRate),
    },
    {
      label: 'Spam Rate',
      value: metrics.spamRate,
      format: 'percent',
      status: getMetricStatus('spam', metrics.spamRate),
    },
  ];

  if (metrics.totalSent === 0) {
    return (
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <ShieldCheck size={16} weight="fill" className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Delivery Health</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-muted-foreground">No mailouts sent yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg', colors.bg)}>
          {overallStatus === 'good' ? (
            <ShieldCheck size={16} weight="fill" className={colors.icon} />
          ) : (
            <Warning size={16} weight="fill" className={colors.icon} />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">Delivery Health</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {metrics.totalSent.toLocaleString()} sent
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {healthMetrics.map((metric) => {
          const metricColors = statusColors[metric.status];
          return (
            <div key={metric.label} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <div className="flex items-baseline gap-1.5">
                <span className={cn('text-xl font-bold', metricColors.text)}>
                  {metric.value.toFixed(1)}%
                </span>
                {metric.trend !== undefined && metric.trend !== 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-[10px] font-semibold',
                      metric.trend > 0 ? 'text-primary' : 'text-destructive'
                    )}
                  >
                    {metric.trend > 0 ? (
                      <TrendUp size={10} weight="bold" />
                    ) : (
                      <TrendDown size={10} weight="bold" />
                    )}
                    {Math.abs(metric.trend).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status indicator */}
      {overallStatus !== 'good' && (
        <div className={cn('mt-4 px-3 py-2 rounded-lg text-xs', colors.bg, colors.text)}>
          {overallStatus === 'warning' 
            ? 'Deliverability could be improved. Review bounce reasons.'
            : 'Deliverability issues detected. Check sender reputation.'}
        </div>
      )}
    </div>
  );
}
