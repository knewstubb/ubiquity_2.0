import { useCallback } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { PageShell } from '../components/layout/PageShell';
import { BillingFilters } from '../components/billing/BillingFilters';
import { BillingTreeTable } from '../components/billing/BillingTreeTable';
import { useBillingReport } from '../components/billing/useBillingReport';
import { usePricing } from '../contexts/PricingContext';
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
    categoryFilter,
    setCategoryFilter,
    sortColumn,
    sortDirection,
    toggleSort,
    leafItems,
  } = useBillingReport();
  const { prices } = usePricing();

  const handleDownloadCsv = useCallback(() => {
    downloadBillingCsv(leafItems, prices);
  }, [leafItems, prices]);

  const handleReset = useCallback(() => {
    const cycle = getCurrentBillingCycle();
    setStartDate(cycle.start);
    setEndDate(cycle.end);
    setSelectedAccountId(null);
    setCategoryFilter('all');
  }, [setStartDate, setEndDate, setSelectedAccountId, setCategoryFilter]);

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
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
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
