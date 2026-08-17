import { Clock } from '@phosphor-icons/react';
import { ActivityFeedItem } from './ActivityFeedItem';
import { sortActivityFeed, type ActivityFeedItem as ActivityFeedItemType } from '../../data/activityFeed';

interface ActivityFeedProps {
  items: ActivityFeedItemType[];
  /** Maximum number of items to display */
  maxItems?: number;
}

/**
 * Activity feed for the landing dashboard.
 * Shows recent system activity with errors/warnings bubbled to the top.
 */
export function ActivityFeed({ items, maxItems = 8 }: ActivityFeedProps) {
  const sortedItems = sortActivityFeed(items).slice(0, maxItems);

  if (sortedItems.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} weight="duotone" className="text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground m-0">Recent Activity</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock size={32} weight="duotone" className="text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground m-0">No recent activity</p>
          <p className="text-xs text-muted-foreground/70 m-0 mt-1">
            Activity from imports, exports, and campaigns will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} weight="duotone" className="text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground m-0">Recent Activity</h3>
        <span className="text-xs text-muted-foreground ml-auto">Last 7 days</span>
      </div>
      <div className="flex flex-col gap-2">
        {sortedItems.map((item) => (
          <ActivityFeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
