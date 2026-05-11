import { PageShell } from '../components/layout/PageShell';
import { MetricCard } from '../components/shared/MetricCard';

export default function AnalyticsDashboardsPage() {
  return (
    <PageShell title="Analytics Dashboards" subtitle="Key performance indicators across your workspace">
      <div className="grid grid-cols-4 gap-5">
        <MetricCard label="Email Open Rate" value="34.2%" subtitle="Last 30 days" />
        <MetricCard label="Click Rate" value="12.8%" subtitle="Last 30 days" />
        <MetricCard label="Conversion Rate" value="4.6%" subtitle="Last 30 days" />
        <MetricCard label="Revenue Attributed" value="$18,420" subtitle="Last 30 days" />
      </div>
    </PageShell>
  );
}
