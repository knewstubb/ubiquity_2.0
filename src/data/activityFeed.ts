/**
 * Activity feed seed data for landing dashboard.
 * 
 * Shows recent system activity from the last 7 days.
 * Errors and warnings bubble to the top regardless of timestamp.
 */

export type ActivityType = 
  | 'import_complete'
  | 'export_complete'
  | 'mailout_sent'
  | 'mailout_scheduled'
  | 'segment_updated'
  | 'sync_complete'
  | 'sync_failed'
  | 'connection_error'
  | 'contact_added'
  | 'unsubscribe';

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'error';

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  severity: ActivitySeverity;
  title: string;
  description?: string;
  timestamp: string; // ISO 8601
  /** Link to related entity (optional) */
  link?: {
    label: string;
    path: string;
  };
  /** Account ID for filtering */
  accountId: string;
  /** Actor who triggered this activity (optional) */
  actor?: {
    name: string;
    initials: string;
    color?: 'teal' | 'amber' | 'violet' | 'rose' | 'sky';
  };
}

/**
 * Get current date for realistic timestamps.
 * Returns dates relative to "now" for demo purposes.
 */
function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const activityFeed: ActivityFeedItem[] = [
  // Errors and warnings (will bubble to top)
  {
    id: 'act-001',
    type: 'connection_error',
    severity: 'error',
    title: 'Salesforce connection failed',
    description: 'Authentication token expired. Re-authorize to resume syncing.',
    timestamp: hoursAgo(2),
    link: { label: 'Fix connection', path: '/audiences/connectors' },
    accountId: 'acc-spark-energy',
  },
  {
    id: 'act-002',
    type: 'sync_failed',
    severity: 'warning',
    title: 'Partial sync from HubSpot',
    description: '12 contacts skipped due to missing email addresses.',
    timestamp: hoursAgo(6),
    link: { label: 'View details', path: '/audiences/connectors' },
    accountId: 'acc-spark-energy',
  },

  // Recent success/info items
  {
    id: 'act-003',
    type: 'mailout_sent',
    severity: 'success',
    title: 'Weekly Newsletter sent',
    description: 'Delivered to 8,452 contacts. Open rate: 28.4%',
    timestamp: hoursAgo(4),
    link: { label: 'View report', path: '/channels/mailouts' },
    accountId: 'acc-spark-energy',
    actor: { name: 'Sarah Chen', initials: 'SC', color: 'teal' },
  },
  {
    id: 'act-004',
    type: 'import_complete',
    severity: 'success',
    title: 'CSV import completed',
    description: '1,234 new contacts added from "Q4_leads.csv"',
    timestamp: hoursAgo(8),
    accountId: 'acc-spark-energy',
    actor: { name: 'Mike Torres', initials: 'MT', color: 'violet' },
  },
  {
    id: 'act-005',
    type: 'segment_updated',
    severity: 'info',
    title: 'Segment "Gold Members" updated',
    description: 'Now contains 3,421 contacts (+127 from yesterday)',
    timestamp: hoursAgo(12),
    link: { label: 'View segment', path: '/audiences/segments' },
    accountId: 'acc-spark-energy',
  },
  {
    id: 'act-006',
    type: 'sync_complete',
    severity: 'success',
    title: 'Shopify sync completed',
    description: '89 orders synced, 12 new customers added.',
    timestamp: daysAgo(1),
    accountId: 'acc-spark-energy',
  },
  {
    id: 'act-007',
    type: 'mailout_scheduled',
    severity: 'info',
    title: 'Flash Sale mailout scheduled',
    description: 'Will send to 5,200 contacts tomorrow at 9:00 AM',
    timestamp: daysAgo(1),
    link: { label: 'View mailout', path: '/channels/mailouts' },
    accountId: 'acc-spark-energy',
    actor: { name: 'Emma Wilson', initials: 'EW', color: 'amber' },
  },
  {
    id: 'act-008',
    type: 'export_complete',
    severity: 'success',
    title: 'Export to Google Ads completed',
    description: '15,890 contacts synced to audience "Retargeting Q4"',
    timestamp: daysAgo(2),
    accountId: 'acc-spark-energy',
    actor: { name: 'Sarah Chen', initials: 'SC', color: 'teal' },
  },
  {
    id: 'act-009',
    type: 'unsubscribe',
    severity: 'info',
    title: '23 contacts unsubscribed',
    description: 'From "Summer Sale" campaign',
    timestamp: daysAgo(3),
    accountId: 'acc-spark-energy',
  },
  {
    id: 'act-010',
    type: 'contact_added',
    severity: 'info',
    title: '456 contacts added via form',
    description: 'Newsletter signup form on homepage',
    timestamp: daysAgo(4),
    accountId: 'acc-spark-energy',
  },

  // Different account items for filtering demo
  {
    id: 'act-011',
    type: 'mailout_sent',
    severity: 'success',
    title: 'Product Launch email sent',
    description: 'Delivered to 2,100 contacts',
    timestamp: hoursAgo(3),
    accountId: 'acc-simply-energy',
    actor: { name: 'James Park', initials: 'JP', color: 'sky' },
  },
  {
    id: 'act-012',
    type: 'connection_error',
    severity: 'error',
    title: 'Mailchimp sync failed',
    description: 'API rate limit exceeded. Will retry in 1 hour.',
    timestamp: hoursAgo(1),
    accountId: 'acc-simply-energy',
  },
];

/**
 * Sort activity feed with errors/warnings first, then by timestamp.
 */
export function sortActivityFeed(items: ActivityFeedItem[]): ActivityFeedItem[] {
  const severityOrder: Record<ActivitySeverity, number> = {
    error: 0,
    warning: 1,
    success: 2,
    info: 3,
  };

  return [...items].sort((a, b) => {
    // First sort by severity (errors/warnings first)
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    // Then by timestamp (most recent first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
