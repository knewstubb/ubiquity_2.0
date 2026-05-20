import { useState, useCallback } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { usePricing } from '../contexts/PricingContext';
import type { BillingCategory } from '../models/billing';

const CATEGORY_DESCRIPTIONS: Record<BillingCategory, string> = {
  'Database Records': 'Per contact record stored in your databases each billing cycle',
  'Transactional Records': 'Per transactional data record synced via connectors',
  'Mailouts': 'Per recipient for promotional email sends',
  'Automated Mailouts': 'Per recipient for automated/recurring email sends',
  'Form Triggered Emails': 'Per email triggered by form submissions',
  'TXT Message Parts': 'Per SMS message part sent',
  'Survey Responses': 'Per survey response collected',
  'Event Triggered Emails': 'Per email triggered by behavioural events',
  'Connector': 'Per active connector per billing cycle',
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
  'Connector',
];

export default function PricingPage() {
  const { prices, setPrice, resetPrices } = usePricing();

  return (
    <PageShell
      title="Pricing"
      subtitle="Unit prices for all billable items in your account"
      action={
        <button
          type="button"
          className="px-4 py-2 text-sm font-semibold font-sans text-muted-foreground bg-background border border-border rounded-[4px] cursor-pointer transition-colors duration-150 hover:bg-background hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          onClick={resetPrices}
        >
          Reset to Defaults
        </button>
      }
    >
      <table className="w-full border-collapse font-sans max-w-[800px]">
        <thead>
          <tr>
            <th className="bg-background font-semibold text-sm text-left px-4 py-3 border-b-2 border-border text-foreground whitespace-nowrap">Billing Category</th>
            <th className="bg-background font-semibold text-sm text-left px-4 py-3 border-b-2 border-border text-foreground whitespace-nowrap">Description</th>
            <th className="bg-background font-semibold text-sm text-right px-4 py-3 border-b-2 border-border text-foreground whitespace-nowrap">Unit Price (NZD)</th>
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
    <tr className="border-b border-secondary hover:bg-background">
      <td className="px-4 py-3 text-sm text-foreground align-middle">
        <span className="font-medium">{category}</span>
      </td>
      <td className="px-4 py-3 text-sm text-foreground align-middle">{description}</td>
      <td className="px-4 py-3 text-sm text-foreground align-middle text-right tabular-nums whitespace-nowrap">
        {editing ? (
          <div className="inline-flex items-center gap-0.5">
            <span className="text-sm font-semibold text-muted-foreground">$</span>
            <input
              type="number"
              className="w-20 px-2 py-1 text-sm font-sans font-semibold border border-primary rounded-[4px] text-right outline-none shadow-ring tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
            className="bg-none border border-transparent rounded-[4px] px-2 py-1 text-sm font-sans font-semibold text-foreground cursor-pointer text-right tabular-nums transition-colors duration-150 hover:border-border-strong hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
