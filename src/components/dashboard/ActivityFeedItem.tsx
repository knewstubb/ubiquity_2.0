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
  Robot,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { ActivityFeedItem as ActivityFeedItemType, ActivityType, ActivitySeverity } from '../../data/activityFeed';

interface ActivityFeedItemProps {
  item: ActivityFeedItemType;
}

const severityConfig: Record<ActivitySeverity, { 
  icon: Icon; 
  iconClass: string; 
  bgClass: string;
  badgeClass: string;
  label: string;
}> = {
  error: { 
    icon: XCircle, 
    iconClass: 'text-destructive',
    bgClass: 'bg-destructive/5 border-l-2 border-l-destructive',
    badgeClass: 'bg-destructive/10 text-destructive',
    label: 'Error',
  },
  warning: { 
    icon: Warning, 
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-500/5 border-l-2 border-l-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-600',
    label: 'Warning',
  },
  success: { 
    icon: CheckCircle, 
    iconClass: 'text-primary',
    bgClass: 'bg-transparent',
    badgeClass: 'bg-primary/10 text-primary',
    label: 'Success',
  },
  info: { 
    icon: Info, 
    iconClass: 'text-muted-foreground',
    bgClass: 'bg-transparent',
    badgeClass: 'bg-muted text-muted-foreground',
    label: 'Info',
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

const actorColors = {
  teal: 'bg-primary/15 text-primary',
  amber: 'bg-amber-500/15 text-amber-700',
  violet: 'bg-violet-500/15 text-violet-700',
  rose: 'bg-rose-500/15 text-rose-700',
  sky: 'bg-sky-500/15 text-sky-700',
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
 * 
 * Features:
 * - Actor avatar (colored initials) or system icon
 * - Severity badge for errors/warnings
 * - Richer visual hierarchy
 * - Hover state with action link
 */
export function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  const navigate = useNavigate();
  const { type, severity, title, description, timestamp, link, actor } = item;

  const config = severityConfig[severity];
  const TypeIcon = typeIcons[type];
  const showBadge = severity === 'error' || severity === 'warning';

  return (
    <div 
      className={cn(
        'group flex items-start gap-3 px-4 py-3 rounded-lg transition-colors',
        config.bgClass,
        link && 'hover:bg-secondary/50 cursor-pointer'
      )}
      onClick={link ? () => navigate(link.path) : undefined}
      role={link ? 'button' : undefined}
      tabIndex={link ? 0 : undefined}
      onKeyDown={link ? (e) => e.key === 'Enter' && navigate(link.path) : undefined}
    >
      {/* Avatar or System Icon */}
      <div className="shrink-0 mt-0.5">
        {actor ? (
          <div 
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold',
              actorColors[actor.color || 'teal']
            )}
            title={actor.name}
          >
            {actor.initials}
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <Robot size={16} weight="duotone" className="text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <TypeIcon size={14} weight="duotone" className="text-muted-foreground shrink-0" />
            <p className={cn(
              'text-sm font-medium',
              severity === 'error' ? 'text-destructive' : 'text-foreground'
            )}>
              {title}
            </p>
          </div>
          
          {showBadge && (
            <span className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
              config.badgeClass
            )}>
              <config.icon size={10} weight="fill" />
              {config.label}
            </span>
          )}
          
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            {formatRelativeTime(timestamp)}
          </span>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {actor && <span className="font-medium text-foreground/80">{actor.name}</span>}
            {actor && ' · '}
            {description}
          </p>
        )}
        
        {link && (
          <span className={cn(
            'inline-flex items-center gap-1 mt-2',
            'text-xs font-medium text-primary',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}>
            {link.label}
            <ArrowRight size={10} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  );
}
