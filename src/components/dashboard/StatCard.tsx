import { ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { DashboardStat } from '../../data/dashboardStats';

interface StatCardProps {
  stat: DashboardStat;
}

/**
 * Hero stat card for the landing dashboard.
 * Displays a key metric with optional trend indicator.
 */
export function StatCard({ stat }: StatCardProps) {
  const { label, value, format, trend, description } = stat;

  const formattedValue = format === 'percent' 
    ? `${value.toLocaleString()}%`
    : value.toLocaleString();

  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = trend !== undefined && trend > 0;

  return (
    <div 
      className="bg-background border border-border rounded-lg px-5 py-4 flex flex-col gap-1"
      title={description}
    >
      <p className="text-sm font-medium text-muted-foreground m-0">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-foreground m-0">{formattedValue}</p>
        {hasTrend && (
          <span 
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive ? "text-primary" : "text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUp size={12} weight="bold" />
            ) : (
              <ArrowDown size={12} weight="bold" />
            )}
            {Math.abs(trend!).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
