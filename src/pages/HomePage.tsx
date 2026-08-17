import { DownloadSimple, ChartLineUp, PaperPlaneTilt } from '@phosphor-icons/react';
import { StatCard } from '../components/dashboard/StatCard';
import { PillarCard, type PillarLink } from '../components/dashboard/PillarCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { DeliveryHealthCard } from '../components/dashboard/DeliveryHealthCard';
import { AudienceGrowthCard } from '../components/dashboard/AudienceGrowthCard';
import { CampaignStatusCard } from '../components/dashboard/CampaignStatusCard';
import { IntegrationHealthCard } from '../components/dashboard/IntegrationHealthCard';
import { RecentActivitySummary } from '../components/dashboard/RecentActivitySummary';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { useAccount } from '../contexts/AccountContext';
import { dashboardStats } from '../data/dashboardStats';
import { activityFeed } from '../data/activityFeed';
import { mailouts } from '../data/mailouts';
import { contacts } from '../data/contacts';
import { campaigns, journeys } from '../data/campaigns';
import { connections } from '../data/connections';
import { jobs } from '../data/jobs';

/** AAA Pillar definitions */
const acquireLinks: PillarLink[] = [
  { label: 'Connectors', path: '/audiences/connectors' },
  { label: 'Databases', path: '/audiences/databases' },
  { label: 'Forms & Surveys', path: '/content/forms' },
];

const analyseLinks: PillarLink[] = [
  { label: 'Segments', path: '/audiences/segments' },
  { label: 'Reports', path: '/analytics/reports' },
  { label: 'Dashboards', path: '/analytics/dashboards' },
];

const actLinks: PillarLink[] = [
  { label: 'Mailouts', path: '/channels/mailouts' },
  { label: 'Campaigns', path: '/automations/campaigns' },
  { label: 'Journeys', path: '/automations/journeys' },
];

/** Returns a time-aware greeting based on local hour */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Landing Dashboard — gives users an instant pulse on their data, campaigns, and system health.
 */
export default function HomePage() {
  const { selectedAccountId, accounts } = useAccount();
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountName = selectedAccount?.name || 'your workspace';

  // Filter data by selected account
  const accountActivity = activityFeed.filter((item) => item.accountId === selectedAccountId);
  const accountMailouts = mailouts.filter((m) => m.accountId === selectedAccountId);
  const accountContacts = contacts.filter((c) => c.accountId === selectedAccountId);
  const accountCampaigns = campaigns.filter((c) => c.accountId === selectedAccountId);
  const accountJourneys = journeys.filter((j) => j.accountId === selectedAccountId);
  const accountConnections = connections.filter((c) => c.accountId === selectedAccountId);
  const accountJobs = jobs.filter((j) => j.accountId === selectedAccountId);

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] py-7 px-6 bg-background">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground">
          Welcome to {accountName}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Health & Insights Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <DeliveryHealthCard mailouts={accountMailouts} />
        <AudienceGrowthCard contacts={accountContacts} mailouts={accountMailouts} />
        <CampaignStatusCard 
          campaigns={accountCampaigns} 
          journeys={accountJourneys} 
          mailouts={accountMailouts} 
        />
        <IntegrationHealthCard 
          connections={accountConnections} 
          jobs={accountJobs} 
        />
      </div>

      {/* Activity & Actions Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="col-span-2">
          <RecentActivitySummary mailouts={accountMailouts} />
        </div>
        <div className="col-span-2">
          <QuickActionsCard 
            contacts={accountContacts}
            campaigns={accountCampaigns}
            journeys={accountJourneys}
            connections={accountConnections}
            mailouts={accountMailouts}
          />
        </div>
      </div>

      {/* Pillars + Activity */}
      <div className="grid grid-cols-4 gap-4">
        <PillarCard
          title="Acquire"
          description="Get data in"
          icon={DownloadSimple}
          accentColor="teal"
          links={acquireLinks}
        />
        <PillarCard
          title="Analyse"
          description="Make sense of it"
          icon={ChartLineUp}
          accentColor="amber"
          links={analyseLinks}
        />
        <PillarCard
          title="Act"
          description="Do something with it"
          icon={PaperPlaneTilt}
          accentColor="violet"
          links={actLinks}
        />
        <ActivityFeed items={accountActivity} maxItems={6} />
      </div>
    </div>
  );
}
