import { useNavigate } from 'react-router-dom';
import { 
  Lightbulb, 
  PaperPlaneTilt, 
  Users, 
  PlugsConnected, 
  Warning,
  Rocket,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { Contact } from '../../models/contact';
import type { Campaign, Journey } from '../../models/campaign';
import type { Connection } from '../../models/connection';
import type { Mailout } from '../../models/mailout';

interface QuickActionsCardProps {
  contacts: Contact[];
  campaigns: Campaign[];
  journeys: Journey[];
  connections: Connection[];
  mailouts: Mailout[];
}

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  icon: typeof PaperPlaneTilt;
  color: 'teal' | 'amber' | 'violet' | 'rose';
  path: string;
  priority: number;
}

/**
 * Quick Actions Card — suggests next steps based on data signals
 */
export function QuickActionsCard({ 
  contacts, 
  campaigns, 
  journeys, 
  connections, 
  mailouts 
}: QuickActionsCardProps) {
  const navigate = useNavigate();

  // Analyze data to determine suggested actions
  const suggestedActions: SuggestedAction[] = [];

  // Check for connection errors
  const errorConnections = connections.filter(c => c.status === 'error');
  if (errorConnections.length > 0) {
    suggestedActions.push({
      id: 'fix-connections',
      title: 'Fix Integration Issues',
      description: `${errorConnections.length} connection${errorConnections.length > 1 ? 's' : ''} need${errorConnections.length === 1 ? 's' : ''} attention`,
      icon: PlugsConnected,
      color: 'rose',
      path: '/',
      priority: 1,
    });
  }

  // Check for draft campaigns past start date
  const now = new Date();
  const staleDrafts = campaigns.filter(c => {
    if (c.status !== 'draft') return false;
    const startDate = new Date(c.dateRange.start);
    return startDate < now;
  });
  if (staleDrafts.length > 0) {
    suggestedActions.push({
      id: 'activate-campaigns',
      title: 'Activate Draft Campaigns',
      description: `${staleDrafts.length} campaign${staleDrafts.length > 1 ? 's are' : ' is'} ready to launch`,
      icon: Rocket,
      color: 'amber',
      path: '/automations/campaigns',
      priority: 2,
    });
  }

  // Check for high bounce rate mailouts
  const highBounceMailouts = mailouts.filter(m => {
    if (m.status !== 'sent') return false;
    const bounceRate = m.metrics.sent > 0 
      ? (m.metrics.bounced / m.metrics.sent) * 100 
      : 0;
    return bounceRate > 5;
  });
  if (highBounceMailouts.length > 0) {
    suggestedActions.push({
      id: 'review-bounces',
      title: 'Review High Bounces',
      description: `${highBounceMailouts.length} mailout${highBounceMailouts.length > 1 ? 's' : ''} with bounce rate > 5%`,
      icon: Warning,
      color: 'amber',
      path: '/channels/mailouts',
      priority: 3,
    });
  }

  // Check for inactive segments (contacts not in any active journey)
  const contactsInJourneys = new Set(
    journeys
      .filter(j => j.status === 'active')
      .flatMap(() => []) // In real app, would track which contacts are in journeys
  );
  const inactiveContactCount = contacts.filter(c => !contactsInJourneys.has(c.id)).length;
  if (inactiveContactCount > contacts.length * 0.5) {
    suggestedActions.push({
      id: 'engage-contacts',
      title: 'Engage Inactive Contacts',
      description: `${Math.round((inactiveContactCount / contacts.length) * 100)}% of contacts not in active journeys`,
      icon: Users,
      color: 'violet',
      path: '/audiences/segments',
      priority: 4,
    });
  }

  // Always suggest creating a new campaign if no active ones
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  if (activeCampaigns.length === 0) {
    suggestedActions.push({
      id: 'create-campaign',
      title: 'Create Your First Campaign',
      description: 'Start engaging your audience with a new campaign',
      icon: Sparkle,
      color: 'teal',
      path: '/automations/campaigns',
      priority: 5,
    });
  }

  // Suggest scheduling a mailout if none scheduled
  const scheduledMailouts = mailouts.filter(m => m.status === 'scheduled');
  if (scheduledMailouts.length === 0 && activeCampaigns.length > 0) {
    suggestedActions.push({
      id: 'schedule-mailout',
      title: 'Schedule a Mailout',
      description: 'No upcoming sends scheduled',
      icon: PaperPlaneTilt,
      color: 'teal',
      path: '/channels/mailouts',
      priority: 6,
    });
  }

  // Sort by priority and take top 3
  const topActions = suggestedActions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  const colorStyles = {
    teal: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      hover: 'hover:bg-primary/5',
    },
    amber: {
      bg: 'bg-amber-500/10',
      icon: 'text-amber-500',
      hover: 'hover:bg-amber-500/5',
    },
    violet: {
      bg: 'bg-violet-500/10',
      icon: 'text-violet-500',
      hover: 'hover:bg-violet-500/5',
    },
    rose: {
      bg: 'bg-rose-500/10',
      icon: 'text-rose-500',
      hover: 'hover:bg-rose-500/5',
    },
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
          <Lightbulb size={16} weight="fill" className="text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">Suggested Actions</h3>
        </div>
      </div>

      {/* Actions list */}
      {topActions.length > 0 ? (
        <div className="flex flex-col gap-2">
          {topActions.map((action) => {
            const colors = colorStyles[action.color];
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => navigate(action.path)}
                className={cn(
                  'group flex items-center gap-3 w-full p-3 rounded-lg',
                  'text-left transition-colors',
                  'border border-transparent hover:border-border',
                  colors.hover
                )}
              >
                <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0', colors.bg)}>
                  <Icon size={18} weight="fill" className={colors.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {action.description}
                  </p>
                </div>
                <ArrowRight 
                  size={14} 
                  className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" 
                />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
            <Sparkle size={24} weight="fill" className="text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">You're all caught up!</p>
          <p className="text-xs text-muted-foreground">
            No urgent actions needed right now
          </p>
        </div>
      )}
    </div>
  );
}
