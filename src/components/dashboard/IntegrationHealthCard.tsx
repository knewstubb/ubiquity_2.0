import { useNavigate } from 'react-router-dom';
import { PlugsConnected, CheckCircle, XCircle, Warning, ArrowRight } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { Connection } from '../../models/connection';
import type { Job } from '../../models/job';

interface IntegrationHealthCardProps {
  connections: Connection[];
  jobs: Job[];
}

interface StatusMetric {
  label: string;
  count: number;
  icon: typeof CheckCircle;
  color: 'teal' | 'amber' | 'rose';
}

/**
 * Integration Health Card — shows connected/error connection counts and failed jobs
 */
export function IntegrationHealthCard({ connections, jobs }: IntegrationHealthCardProps) {
  const navigate = useNavigate();

  // Connection status counts
  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const errorCount = connections.filter(c => c.status === 'error').length;

  // Failed jobs (recent, within last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentFailedJobs = jobs.filter(j => {
    if (j.status !== 'failed') return false;
    const completedAt = j.completedAt ? new Date(j.completedAt) : null;
    return completedAt && completedAt >= sevenDaysAgo;
  });

  // Running/queued jobs for context
  const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'queued');

  const statusMetrics: StatusMetric[] = [
    {
      label: 'Connected',
      count: connectedCount,
      icon: CheckCircle,
      color: 'teal',
    },
    {
      label: 'Errors',
      count: errorCount,
      icon: XCircle,
      color: 'rose',
    },
    {
      label: 'Failed Jobs',
      count: recentFailedJobs.length,
      icon: Warning,
      color: 'amber',
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
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      icon: 'text-rose-500',
    },
  };

  // Get connections with errors for display
  const errorConnections = connections.filter(c => c.status === 'error').slice(0, 3);

  // Overall health status
  const overallHealth = errorCount === 0 && recentFailedJobs.length === 0 
    ? 'healthy' 
    : errorCount > 0 
      ? 'critical' 
      : 'warning';

  const healthStyles = {
    healthy: { label: 'All Systems Healthy', color: 'text-primary', bg: 'bg-primary/10' },
    warning: { label: 'Attention Needed', color: 'text-amber-600', bg: 'bg-amber-500/10' },
    critical: { label: 'Issues Detected', color: 'text-rose-600', bg: 'bg-rose-500/10' },
  };

  const health = healthStyles[overallHealth];

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10">
          <PlugsConnected size={16} weight="fill" className="text-violet-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">Integration Health</h3>
        </div>
        <div className={cn('px-2 py-1 rounded-full text-xs font-medium', health.bg, health.color)}>
          {health.label}
        </div>
      </div>

      {/* Status metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {statusMetrics.map((metric) => {
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
                {metric.count}
              </span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">
                {metric.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error connections list */}
      {errorConnections.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Needs Attention</p>
          <div className="flex flex-col gap-1">
            {errorConnections.map((connection) => (
              <button
                key={connection.id}
                type="button"
                onClick={() => navigate('/')}
                className={cn(
                  'group flex items-center justify-between w-full px-3 py-2 rounded-lg',
                  'text-left text-sm',
                  'hover:bg-muted/50 transition-colors'
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <XCircle size={14} weight="fill" className="text-rose-500 flex-shrink-0" />
                  <span className="truncate text-foreground">{connection.name}</span>
                </div>
                <ArrowRight 
                  size={12} 
                  className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" 
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active jobs indicator */}
      {activeJobs.length > 0 && errorConnections.length === 0 && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-muted-foreground">
              {activeJobs.length} job{activeJobs.length !== 1 ? 's' : ''} in progress
            </span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-primary hover:underline"
            >
              View Queue
            </button>
          </div>
        </div>
      )}

      {/* All healthy state */}
      {errorConnections.length === 0 && activeJobs.length === 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground text-center py-2">
            All {connectedCount} integrations running smoothly
          </p>
        </div>
      )}
    </div>
  );
}
