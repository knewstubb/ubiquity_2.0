import { useState, useCallback } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { usePricing } from '../contexts/PricingContext';
import type { BillingCategory } from '../models/billing';
import styles from './PricingPage.module.css';

const CATEGORY_DESCRIPTIONS: Record<BillingCategory, string> = {
  'Database Records': 'Per contact record stored in your databases each billing cycle',
  'Transactional Records': 'Per transactional data record synced via connectors',
  'Mailouts': 'Per recipient for promotional email sends',
  'Automated Mailouts': 'Per recipient for automated/recurring email sends',
  'Form Triggered Emails': 'Per email triggered by form submissions',
  'TXT Message Parts': 'Per SMS message part sent',
  'Survey Responses': 'Per survey response collected',
  'Event Triggered Emails': 'Per email triggered by behavioural events',
  'Integration': 'Per active automation (connection + import) per billing cycle',
};

const CATEGORY_ORDER: BillingCategory[] = [
  'Database Records',
  'Transactional Records',
  'Mailouts',
  'Automated Mailouts',
  'Form Triggered Emails',
  'Event Triggered Emails',
  'TXT Message Parts',
  'Survey Responses',
  'Integration',
];

export default function PricingPage() {
  const { prices, setPrice, resetPrices } = usePricing();

  return (
    <PageShell
      title="Pricing"
      subtitle="Unit prices for all billable items in your account"
      action={
        <button type="button" className={styles.resetBtn} onClick={resetPrices}>
          Reset to Defaults
        </button>
      }
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.headerCell}>Billing Category</th>
            <th className={styles.headerCell}>Description</th>
            <th className={styles.headerCellPrice}>Unit Price (NZD)</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORY_ORDER.map((category) => (
            <PriceRow
              key={category}
              category={category}
              description={CATEGORY_DESCRIPTIONS[category]}
              price={prices[category]}
              onPriceChange={(val) => setPrice(category, val)}
            />
          ))}
        </tbody>
      </table>
    </PageShell>
  );
}

interface PriceRowProps {
  category: BillingCategory;
  description: string;
  price: number;
  onPriceChange: (val: number) => void;
}

function PriceRow({ category, description, price, onPriceChange }: PriceRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = useCallback(() => {
    setDraft(price >= 1 ? price.toFixed(2) : price.toFixed(3));
    setEditing(true);
  }, [price]);

  const commitEdit = useCallback(() => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0) {
      onPriceChange(parsed);
    }
    setEditing(false);
  }, [draft, onPriceChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') setEditing(false);
    },
    [commitEdit],
  );

  const displayPrice = price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(3)}`;

  return (
    <tr className={styles.row}>
      <td className={styles.bodyCell}>
        <span className={styles.categoryName}>{category}</span>
      </td>
      <td className={styles.bodyCell}>{description}</td>
      <td className={styles.bodyCellPrice}>
        {editing ? (
          <div className={styles.editWrapper}>
            <span className={styles.dollarSign}>$</span>
            <input
              type="number"
              className={styles.priceInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              min="0"
              step="0.001"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            className={styles.priceButton}
            onClick={startEdit}
            title="Click to edit"
          >
            {displayPrice}
          </button>
        )}
      </td>
    </tr>
  );
}
