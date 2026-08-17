import { DownloadSimple, ChartLineUp, PaperPlaneTilt } from '@phosphor-icons/react';
import { WelcomeHeader } from '../components/dashboard/WelcomeHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { PillarCard, type PillarLink } from '../components/dashboard/PillarCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { useAccount } from '../contexts/AccountContext';
import { dashboardStats } from '../data/dashboardStats';
import { activityFeed } from '../data/activityFeed';
import { cn } from '../lib/utils';

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

/**
 * Landing Dashboard — gives users an instant pulse on their data, campaigns, and system health.
 * 
 * Structure:
 * - Welcome Header (time-aware greeting, account name)
 * - Hero Stats Row (4 cards with sparklines)
 * - AAA Pillar Cards (Acquire, Analyse, Act) + Activity Feed
 */
export default function HomePage() {
  const { selectedAccountId, accounts } = useAccount();
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountName = selectedAccount?.name || 'your workspace';

  // Filter activity feed by selected account
  const accountActivity = activityFeed.filter((item) => item.accountId === selectedAccountId);

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Header */}
      <div className="animate-fade-in">
        <WelcomeHeader accountName={accountName} />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8 space-y-6">
        {/* Hero Stats */}
        <section aria-label="Key metrics">
          <div className="grid grid-cols-4 gap-4">
            {dashboardStats.map((stat, index) => (
              <div 
                key={stat.id} 
                className={cn(
                  'animate-fade-in-up',
                  index === 0 && 'animation-delay-100',
                  index === 1 && 'animation-delay-200',
                  index === 2 && 'animation-delay-300',
                  index === 3 && 'animation-delay-400'
                )}
              >
                <StatCard stat={stat} />
              </div>
            ))}
          </div>
        </section>

        {/* AAA Pillars + Activity Feed */}
        <section aria-label="Quick access">
          <div className="grid grid-cols-12 gap-4">
            {/* Pillar Cards - 3 columns each */}
            <div className="col-span-3 animate-fade-in-up animation-delay-300">
              <PillarCard
                title="Acquire"
                description="Get data in"
                icon={DownloadSimple}
                accentColor="teal"
                links={acquireLinks}
              />
            </div>

            <div className="col-span-3 animate-fade-in-up animation-delay-400">
              <PillarCard
                title="Analyse"
                description="Make sense of it"
                icon={ChartLineUp}
                accentColor="amber"
                links={analyseLinks}
              />
            </div>

            <div className="col-span-3 animate-fade-in-up animation-delay-500">
              <PillarCard
                title="Act"
                description="Do something with it"
                icon={PaperPlaneTilt}
                accentColor="violet"
                links={actLinks}
              />
            </div>

            {/* Activity Feed - wider column */}
            <div className="col-span-3 animate-fade-in-up animation-delay-600">
              <ActivityFeed items={accountActivity} maxItems={6} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
