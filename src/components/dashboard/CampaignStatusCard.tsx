import { useNavigate } from 'react-router-dom';
import { Rocket, Play, Clock, WarningCircle, ArrowRight } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import type { Campaign, Journey } from '../../models/campaign';
import type { Mailout } from '../../models/mailout';

interface CampaignStatusCardProps {
  campaigns: Campaign[];
  journeys: Journey[];
  mailouts: Mailout[];
}

interface StatusItem {
  label: string;
  count: number;
  icon: typeof Play;
  color: 'teal' | 'amber' | 'rose';
  path?: string;
}

/**
 * Campaign Status Card — shows active journeys, upcoming sends, and items needing attention
 */
export function CampaignStatusCard({ campaigns, journeys, mailouts }: CampaignStatusCardProps) {
  const navigate = useNavigate();

  // Active journeys
  const activeJourneys = journeys.filter(j => j.status === 'active');
  const activeJourneysInProgress = activeJourneys.filter(j => j.entryCount > 0);

  // Upcoming scheduled sends (mailouts with status 'scheduled' or 'sending')
  const upcomingSends = mailouts.filter(m => 
    m.status === 'scheduled' || m.status === 'sending'
  );

  // Items needing attention:
  // - Draft campaigns older than 7 days
  // - Paused journeys
  // - Failed/bounced mailouts with high bounce rate
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const staleDrafts = campaigns.filter(c => {
    if (c.status !== 'draft') return false;
    const startDate = new Date(c.dateRange.start);
    return startDate < now; // Draft campaigns past their start date
  });

  const pausedJourneys = journeys.filter(j => j.status === 'paused');

  // Mailouts with issues (high bounce rate > 5%)
  const problematicMailouts = mailouts.filter(m => {
    if (m.status !== 'sent') return false;
    const bounceRate = m.metrics.sent > 0 
      ? (m.metrics.bounced / m.metrics.sent) * 100 
      : 0;
    return bounceRate > 5;
  });

  const needsAttentionCount = staleDrafts.length + pausedJourneys.length + problematicMailouts.length;

  const statusItems: StatusItem[] = [
    {
      label: 'Active Journeys',
      count: activeJourneysInProgress.length,
      icon: Play,
      color: 'teal',
      path: '/automations/journeys',
    },
    {
      label: 'Scheduled',
      count: upcomingSends.length,
      icon: Clock,
      color: 'amber',
      path: '/channels/mailouts',
    },
    {
      label: 'Needs Attention',
      count: needsAttentionCount,
      icon: WarningCircle,
      color: 'rose',
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

  // Get top 3 active campaigns for quick access
  const activeCampaigns = campaigns
    .filter(c => c.status === 'active')
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
          <Rocket size={16} weight="fill" className="text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">Campaign Status</h3>
        </div>
      </div>

      {/* Status metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {statusItems.map((item) => {
          const colors = colorStyles[item.color];
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.path && navigate(item.path)}
              disabled={!item.path}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors',
                'border border-transparent',
                item.path && 'hover:border-border hover:bg-muted/50 cursor-pointer',
                !item.path && 'cursor-default'
              )}
            >
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg', colors.bg)}>
                <Icon size={16} weight="fill" className={colors.icon} />
              </div>
              <span className={cn('text-xl font-bold', colors.text)}>
                {item.count}
              </span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active campaigns list */}
      {activeCampaigns.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Active Campaigns</p>
          <div className="flex flex-col gap-1">
            {activeCampaigns.map((campaign) => {
              const campaignJourneys = journeys.filter(j => j.campaignId === campaign.id);
              const activeCount = campaignJourneys.filter(j => j.status === 'active').length;
              return (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => navigate(`/automations/campaigns`)}
                  className={cn(
                    'group flex items-center justify-between w-full px-3 py-2 rounded-lg',
                    'text-left text-sm text-foreground',
                    'hover:bg-muted/50 transition-colors'
                  )}
                >
                  <span className="truncate flex-1">{campaign.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {activeCount} journey{activeCount !== 1 ? 's' : ''}
                    </span>
                    <ArrowRight 
                      size={12} 
                      className="text-muted-foreground group-hover:text-foreground transition-colors" 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeCampaigns.length === 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground text-center py-3">
            No active campaigns
          </p>
        </div>
      )}
    </div>
  );
}
