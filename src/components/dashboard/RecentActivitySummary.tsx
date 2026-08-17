import { useNavigate } from 'react-router-dom';
import { Lightning, PaperPlaneTilt, EnvelopeOpen, CursorClick, Trophy, ArrowRight } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { Mailout } from '../../models/mailout';

interface RecentActivitySummaryProps {
  mailouts: Mailout[];
}

interface ActivityMetric {
  label: string;
  value: number;
  icon: typeof PaperPlaneTilt;
  color: 'teal' | 'amber' | 'violet';
  suffix?: string;
}

/**
 * Recent Activity Summary — shows last 24h sends/opens/clicks and top performer
 */
export function RecentActivitySummary({ mailouts }: RecentActivitySummaryProps) {
  const navigate = useNavigate();

  // Filter to mailouts sent in the last 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentMailouts = mailouts.filter(m => {
    if (m.status !== 'sent') return false;
    const sentDate = m.sentAt ? new Date(m.sentAt) : null;
    return sentDate && sentDate >= twentyFourHoursAgo;
  });

  // Aggregate metrics for last 24h
  const last24hMetrics = recentMailouts.reduce(
    (acc, m) => ({
      sent: acc.sent + m.metrics.sent,
      opened: acc.opened + m.metrics.opened,
      clicked: acc.clicked + m.metrics.clicked,
    }),
    { sent: 0, opened: 0, clicked: 0 }
  );

  // Calculate rates
  const openRate = last24hMetrics.sent > 0 
    ? (last24hMetrics.opened / last24hMetrics.sent) * 100 
    : 0;
  const clickRate = last24hMetrics.opened > 0 
    ? (last24hMetrics.clicked / last24hMetrics.opened) * 100 
    : 0;

  // Find top performer (highest open rate among sent mailouts with significant volume)
  const sentMailouts = mailouts.filter(m => 
    m.status === 'sent' && m.metrics.sent >= 50
  );

  const topPerformer = sentMailouts.length > 0
    ? sentMailouts.reduce((best, current) => {
        const bestOpenRate = best.metrics.sent > 0 
          ? (best.metrics.opened / best.metrics.sent) * 100 
          : 0;
        const currentOpenRate = current.metrics.sent > 0 
          ? (current.metrics.opened / current.metrics.sent) * 100 
          : 0;
        return currentOpenRate > bestOpenRate ? current : best;
      })
    : null;

  const topPerformerOpenRate = topPerformer && topPerformer.metrics.sent > 0
    ? (topPerformer.metrics.opened / topPerformer.metrics.sent) * 100
    : 0;

  const activityMetrics: ActivityMetric[] = [
    {
      label: 'Sent',
      value: last24hMetrics.sent,
      icon: PaperPlaneTilt,
      color: 'teal',
    },
    {
      label: 'Open Rate',
      value: openRate,
      icon: EnvelopeOpen,
      color: 'amber',
      suffix: '%',
    },
    {
      label: 'Click Rate',
      value: clickRate,
      icon: CursorClick,
      color: 'violet',
      suffix: '%',
    },
  ];

  const colorStyles = {
    teal: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      icon: 'text-primary',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      icon: 'text-amber-500',
    },
    violet: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-600',
      icon: 'text-violet-500',
    },
  };

  const formatNumber = (num: number, suffix?: string) => {
    if (suffix === '%') {
      return `${num.toFixed(1)}%`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Lightning size={16} weight="fill" className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">Last 24 Hours</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {recentMailouts.length} mailout{recentMailouts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Activity metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {activityMetrics.map((metric) => {
          const colors = colorStyles[metric.color];
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg"
            >
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg', colors.bg)}>
                <Icon size={16} weight="fill" className={colors.icon} />
              </div>
              <span className={cn('text-xl font-bold', colors.text)}>
                {formatNumber(metric.value, metric.suffix)}
              </span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">
                {metric.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Top performer */}
      {topPerformer && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={14} weight="fill" className="text-amber-500" />
            <p className="text-xs font-medium text-muted-foreground">Top Performer</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/channels/mailouts')}
            className={cn(
              'group flex items-center justify-between w-full px-3 py-2 rounded-lg',
              'text-left',
              'hover:bg-muted/50 transition-colors'
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {topPerformer.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {topPerformerOpenRate.toFixed(1)}% open rate • {topPerformer.metrics.sent.toLocaleString()} sent
              </p>
            </div>
            <ArrowRight 
              size={12} 
              className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" 
            />
          </button>
        </div>
      )}

      {/* No recent activity state */}
      {recentMailouts.length === 0 && !topPerformer && (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground text-center py-2">
            No sends in the last 24 hours
          </p>
        </div>
      )}
    </div>
  );
}
