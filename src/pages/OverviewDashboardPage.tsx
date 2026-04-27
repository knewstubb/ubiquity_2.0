import { PageShell } from '../components/layout/PageShell';
import { MetricCard } from '../components/shared/MetricCard';
import { useAccount } from '../contexts/AccountContext';
import { spaContacts } from '../data/spaContacts';
import { campaigns, journeys } from '../data/campaigns';
import { segments } from '../data/segments';
import styles from './OverviewDashboardPage.module.css';

export default function OverviewDashboardPage() {
  const { filterByAccount } = useAccount();

  const filteredContacts = filterByAccount(spaContacts);
  const filteredCampaigns = filterByAccount(campaigns);
  const filteredJourneys = filterByAccount(journeys);
  const filteredSegments = filterByAccount(segments);

  const activeCampaigns = filteredCampaigns.filter((c) => c.status === 'active').length;
  const activeJourneys = filteredJourneys.filter((j) => j.status === 'active').length;

  return (
    <PageShell title="Dashboard" subtitle="Overview of your workspace">
      <div className={styles.metricsGrid}>
        <MetricCard label="Total Contacts" value={filteredContacts.length} />
        <MetricCard label="Active Campaigns" value={activeCampaigns} />
        <MetricCard label="Active Journeys" value={activeJourneys} />
        <MetricCard label="Total Segments" value={filteredSegments.length} />
      </div>
    </PageShell>
  );
}
