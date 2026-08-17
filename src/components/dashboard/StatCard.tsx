import { TrendUp, TrendDown } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { DashboardStat } from '../../data/dashboardStats';

interface StatCardProps {
  stat: DashboardStat;
}

/** Mini sparkline component — pure SVG, no dependencies */
function Sparkline({ 
  data, 
  color = 'currentColor',
  className 
}: { 
  data: number[]; 
  color?: string;
  className?: string;
}) {
  if (data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Normalize to 0-100 range, then flip Y (SVG Y is inverted)
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10; // 10-90 range
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      viewBox="0 0 100 40" 
      className={cn('h-8 w-20', className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
      {/* Highlight dot at the end */}
      <circle
        cx={100}
        cy={100 - ((data[data.length - 1] - min) / range) * 80 - 10}
        r="3"
        fill={color}
        className="opacity-80"
      />
    </svg>
  );
}

const accentConfig = {
  teal: {
    gradient: 'from-primary/5 to-transparent',
    border: 'border-primary/20 hover:border-primary/40',
    sparkline: 'var(--primary)',
    trendUp: 'bg-primary/10 text-primary',
    trendDown: 'bg-destructive/10 text-destructive',
  },
  amber: {
    gradient: 'from-amber-500/5 to-transparent',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    sparkline: '#F59E0B',
    trendUp: 'bg-primary/10 text-primary',
    trendDown: 'bg-destructive/10 text-destructive',
  },
  violet: {
    gradient: 'from-violet-500/5 to-transparent',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    sparkline: '#8B5CF6',
    trendUp: 'bg-primary/10 text-primary',
    trendDown: 'bg-destructive/10 text-destructive',
  },
  rose: {
    gradient: 'from-rose-500/5 to-transparent',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    sparkline: '#F43F5E',
    trendUp: 'bg-primary/10 text-primary',
    trendDown: 'bg-destructive/10 text-destructive',
  },
};

/**
 * Hero stat card for the landing dashboard.
 * 
 * Features:
 * - Subtle gradient background with accent color
 * - Mini sparkline showing 7-day trend
 * - Bold trend pill with icon
 * - Hover state with border highlight
 */
export function StatCard({ stat }: StatCardProps) {
  const { label, value, format, trend, description, sparkline, accent = 'teal' } = stat;
  const config = accentConfig[accent];

  const formattedValue = format === 'percent' 
    ? `${value.toLocaleString()}%`
    : value.toLocaleString();

  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = trend !== undefined && trend > 0;

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br transition-all duration-200',
        'px-5 py-4',
        config.gradient,
        config.border,
        'hover:shadow-sm'
      )}
      title={description}
    >
      {/* Sparkline positioned in background, right-aligned */}
      {sparkline && sparkline.length > 1 && (
        <div className="absolute bottom-2 right-3 opacity-40">
          <Sparkline 
            data={sparkline} 
            color={config.sparkline}
            className="h-10 w-24"
          />
        </div>
      )}

      <div className="relative flex flex-col gap-1.5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        
        <div className="flex items-center gap-3">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {formattedValue}
          </p>
          
          {hasTrend && (
            <span 
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                'text-xs font-semibold',
                isPositive ? config.trendUp : config.trendDown
              )}
            >
              {isPositive ? (
                <TrendUp size={12} weight="bold" />
              ) : (
                <TrendDown size={12} weight="bold" />
              )}
              {Math.abs(trend!).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
