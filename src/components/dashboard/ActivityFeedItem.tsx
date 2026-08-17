import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Warning, 
  XCircle, 
  Info,
  ArrowRight,
  DownloadSimple,
  UploadSimple,
  EnvelopeSimple,
  Calendar,
  UsersThree,
  ArrowsClockwise,
  PlugsConnected,
  UserMinus,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { ActivityFeedItem as ActivityFeedItemType, ActivityType, ActivitySeverity } from '../../data/activityFeed';

interface ActivityFeedItemProps {
  item: ActivityFeedItemType;
}

const severityConfig: Record<ActivitySeverity, { icon: Icon; iconClass: string; bgClass: string }> = {
  error: { 
    icon: XCircle, 
    iconClass: 'text-destructive',
    bgClass: 'bg-destructive/5',
  },
  warning: { 
    icon: Warning, 
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-500/5',
  },
  success: { 
    icon: CheckCircle, 
    iconClass: 'text-primary',
    bgClass: 'bg-primary/5',
  },
  info: { 
    icon: Info, 
    iconClass: 'text-muted-foreground',
    bgClass: 'bg-muted/50',
  },
};

const typeIcons: Record<ActivityType, Icon> = {
  import_complete: DownloadSimple,
  export_complete: UploadSimple,
  mailout_sent: EnvelopeSimple,
  mailout_scheduled: Calendar,
  segment_updated: UsersThree,
  sync_complete: ArrowsClockwise,
  sync_failed: ArrowsClockwise,
  connection_error: PlugsConnected,
  contact_added: UsersThree,
  unsubscribe: UserMinus,
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' });
}

/**
 * Individual activity feed item.
 */
export function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  const navigate = useNavigate();
  const { type, severity, title, description, timestamp, link } = item;

  const config = severityConfig[severity];
  const TypeIcon = typeIcons[type];
  const SeverityIcon = config.icon;

  return (
    <div className={cn("flex items-start gap-3 px-4 py-3 rounded-lg", config.bgClass)}>
      {/* Icon */}
      <div className="relative shrink-0 mt-0.5">
        <TypeIcon size={18} weight="duotone" className="text-muted-foreground" />
        {(severity === 'error' || severity === 'warning') && (
          <SeverityIcon 
            size={12} 
            weight="fill" 
            className={cn("absolute -bottom-1 -right-1", config.iconClass)} 
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium m-0",
            severity === 'error' ? "text-destructive" : "text-foreground"
          )}>
            {title}
          </p>
          <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(timestamp)}</span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground m-0 mt-0.5">{description}</p>
        )}
        {link && (
          <button
            type="button"
            onClick={() => navigate(link.path)}
            className={cn(
              "flex items-center gap-1 mt-2 px-0 py-0",
              "text-xs font-medium text-primary",
              "bg-transparent border-none cursor-pointer",
              "hover:underline"
            )}
          >
            {link.label}
            <ArrowRight size={10} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}
