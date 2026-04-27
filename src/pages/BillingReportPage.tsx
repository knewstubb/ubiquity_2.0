import { useCallback } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { BillingFilters } from '../components/billing/BillingFilters';
import { BillingTreeTable } from '../components/billing/BillingTreeTable';
import { useBillingReport } from '../components/billing/useBillingReport';
import { downloadBillingCsv } from '../utils/billingCsv';
import { getCurrentBillingCycle } from '../models/billing';
import styles from './BillingReportPage.module.css';

export default function BillingReportPage() {
  const {
    tree,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedAccountId,
    setSelectedAccountId,
    sortColumn,
    sortDirection,
    toggleSort,
    leafItems,
  } = useBillingReport();

  const handleDownloadCsv = useCallback(() => {
    downloadBillingCsv(leafItems);
  }, [leafItems]);

  const handleReset = useCallback(() => {
    const cycle = getCurrentBillingCycle();
    setStartDate(cycle.start);
    setEndDate(cycle.end);
    setSelectedAccountId(null);
  }, [setStartDate, setEndDate, setSelectedAccountId]);

  return (
    <PageShell
      title="Billing Report"
      subtitle="Cross-account billing data for the current period"
      action={
        <button type="button" className={styles.downloadButton} onClick={handleDownloadCsv}>
          <DownloadSimple size={16} weight="bold" />
          Download CSV
        </button>
      }
    >
      <BillingFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
        onReset={handleReset}
      />
      <BillingTreeTable
        tree={tree}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onToggleSort={toggleSort}
      />
    </PageShell>
  );
}
