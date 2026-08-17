import { DownloadSimple, ChartLineUp, PaperPlaneTilt } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { StatCard } from '../components/dashboard/StatCard';
import { PillarCard, type PillarLink } from '../components/dashboard/PillarCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { useAccount } from '../contexts/AccountContext';
import { dashboardStats } from '../data/dashboardStats';
import { activityFeed } from '../data/activityFeed';

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
 * - Hero Stats Row (4 cards: Total Contacts, Contactable, Active Mailouts, Engagement Rate)
 * - AAA Pillar Cards (Acquire, Analyse, Act)
 * - Activity Feed (last 7 days, errors/warnings first)
 */
export default function HomePage() {
  const { selectedAccountId } = useAccount();

  // Filter activity feed by selected account
  const accountActivity = activityFeed.filter((item) => item.accountId === selectedAccountId);

  return (
    <PageShell title="Dashboard" subtitle="Overview of your workspace">
      {/* Hero Stats */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-4 gap-4">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* AAA Pillars + Activity Feed */}
      <section aria-label="Quick access" className="mt-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Acquire */}
          <PillarCard
            title="Acquire"
            description="Get data in"
            icon={DownloadSimple}
            accentColor="teal"
            links={acquireLinks}
          />

          {/* Analyse */}
          <PillarCard
            title="Analyse"
            description="Make sense of it"
            icon={ChartLineUp}
            accentColor="amber"
            links={analyseLinks}
          />

          {/* Act */}
          <PillarCard
            title="Act"
            description="Do something with it"
            icon={PaperPlaneTilt}
            accentColor="violet"
            links={actLinks}
          />

          {/* Activity Feed */}
          <ActivityFeed items={accountActivity} maxItems={5} />
        </div>
      </section>
    </PageShell>
  );
}
