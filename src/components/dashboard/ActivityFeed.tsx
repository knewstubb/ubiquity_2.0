import { Clock, Lightning } from '@phosphor-icons/react';
import { ActivityFeedItem } from './ActivityFeedItem';
import { sortActivityFeed, type ActivityFeedItem as ActivityFeedItemType } from '../../data/activityFeed';
import { cn } from '../../lib/utils';

interface ActivityFeedProps {
  items: ActivityFeedItemType[];
  /** Maximum number of items to display */
  maxItems?: number;
}

/**
 * Activity feed for the landing dashboard.
 * 
 * Features:
 * - Errors/warnings bubbled to top
 * - Count badge showing urgent items
 * - Richer header with icon accent
 * - Empty state with helpful guidance
 */
export function ActivityFeed({ items, maxItems = 8 }: ActivityFeedProps) {
  const sortedItems = sortActivityFeed(items).slice(0, maxItems);
  const urgentCount = items.filter(i => i.severity === 'error' || i.severity === 'warning').length;

  if (sortedItems.length === 0) {
    return (
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <Clock size={16} weight="fill" className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
            <Lightning size={24} weight="duotone" className="text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
            Activity from imports, syncs, and campaigns will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Clock size={16} weight="fill" className="text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            {urgentCount > 0 && (
              <span className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
                'rounded-full text-[11px] font-bold',
                'bg-destructive text-destructive-foreground'
              )}>
                {urgentCount}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Last 7 days</span>
      </div>

      {/* Feed items */}
      <div className="flex flex-col gap-1">
        {sortedItems.map((item) => (
          <ActivityFeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
