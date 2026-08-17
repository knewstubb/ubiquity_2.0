import { UsersThree, TrendUp, TrendDown, UserPlus, UserMinus } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { ContactRecord } from '../../models/data';
import type { Mailout } from '../../models/mailout';

interface AudienceGrowthCardProps {
  contacts: ContactRecord[];
  mailouts: Mailout[];
}

/** Mini sparkline component */
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
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      viewBox="0 0 100 40" 
      className={cn('h-8 w-full', className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
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

/**
 * Calculate audience growth metrics
 */
function calculateGrowthMetrics(contacts: ContactRecord[], mailouts: Mailout[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // New contacts in last 30 days
  const newContacts = contacts.filter(c => {
    const joinDate = new Date(c.joinDate);
    return joinDate >= thirtyDaysAgo;
  }).length;

  // New contacts in previous 30 days (for trend)
  const previousNewContacts = contacts.filter(c => {
    const joinDate = new Date(c.joinDate);
    return joinDate >= sixtyDaysAgo && joinDate < thirtyDaysAgo;
  }).length;

  // Unsubscribes from mailouts in last 30 days
  const recentMailouts = mailouts.filter(m => {
    if (!m.sentAt) return false;
    const sentDate = new Date(m.sentAt);
    return sentDate >= thirtyDaysAgo;
  });

  const unsubscribes = recentMailouts.reduce(
    (sum, m) => sum + m.metrics.unsubscribed + m.metrics.optedOut,
    0
  );

  // Previous period unsubscribes
  const previousMailouts = mailouts.filter(m => {
    if (!m.sentAt) return false;
    const sentDate = new Date(m.sentAt);
    return sentDate >= sixtyDaysAgo && sentDate < thirtyDaysAgo;
  });

  const previousUnsubscribes = previousMailouts.reduce(
    (sum, m) => sum + m.metrics.unsubscribed + m.metrics.optedOut,
    0
  );

  // Net growth
  const netGrowth = newContacts - unsubscribes;
  const previousNetGrowth = previousNewContacts - previousUnsubscribes;
  const trend = previousNetGrowth !== 0 
    ? ((netGrowth - previousNetGrowth) / Math.abs(previousNetGrowth)) * 100
    : netGrowth > 0 ? 100 : 0;

  // Generate sparkline data (mock weekly growth for last 8 weeks)
  const sparklineData: number[] = [];
  let runningTotal = contacts.length - netGrowth;
  for (let i = 7; i >= 0; i--) {
    const weekAgo = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekBefore = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weeklyNew = contacts.filter(c => {
      const joinDate = new Date(c.joinDate);
      return joinDate >= weekBefore && joinDate < weekAgo;
    }).length;
    runningTotal += weeklyNew;
    sparklineData.push(runningTotal);
  }

  return {
    totalContacts: contacts.length,
    newContacts,
    unsubscribes,
    netGrowth,
    trend,
    sparklineData,
  };
}

/**
 * Audience Growth Card — shows new contacts, unsubscribes, and net growth with sparkline
 */
export function AudienceGrowthCard({ contacts, mailouts }: AudienceGrowthCardProps) {
  const metrics = calculateGrowthMetrics(contacts, mailouts);
  const isPositiveGrowth = metrics.netGrowth >= 0;

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10">
          <UsersThree size={16} weight="fill" className="text-violet-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">Audience Growth</h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>

      {/* Main metrics row */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {metrics.totalContacts.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">contacts</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {isPositiveGrowth ? (
              <TrendUp size={14} weight="bold" className="text-primary" />
            ) : (
              <TrendDown size={14} weight="bold" className="text-destructive" />
            )}
            <span
              className={cn(
                'text-sm font-semibold',
                isPositiveGrowth ? 'text-primary' : 'text-destructive'
              )}
            >
              {isPositiveGrowth ? '+' : ''}
              {metrics.netGrowth.toLocaleString()} net
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="w-24 h-10">
          <Sparkline
            data={metrics.sparklineData}
            color={isPositiveGrowth ? 'var(--primary)' : 'var(--destructive)'}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10">
            <UserPlus size={12} weight="bold" className="text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">
              +{metrics.newContacts.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1">new</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-destructive/10">
            <UserMinus size={12} weight="bold" className="text-destructive" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">
              -{metrics.unsubscribes.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1">unsubscribed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
