export type BillingCategory =
  | 'Database Records'
  | 'Transactional Records'
  | 'Mailouts'
  | 'Automated Mailouts'
  | 'Form Triggered Emails'
  | 'Integrations';

export interface BillingLineItem {
  id: string;
  accountId: string;
  category: BillingCategory;
  description: string;
  sendDate: string | null;
  items: number;
  createdDate: string;
  user: string;
  billingCycleStart?: string;
  billingCycleEnd?: string;
}

/**
 * Returns the current billing cycle date range (26th–25th).
 * If today is before the 26th: start = 26th of previous month, end = 25th of current month.
 * If today is on/after the 26th: start = 26th of current month, end = 25th of next month.
 */
export function getCurrentBillingCycle(): { start: string; end: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const day = today.getDate();

  let startDate: Date;
  let endDate: Date;

  if (day < 26) {
    // start = 26th of previous month
    startDate = new Date(year, month - 1, 26);
    // end = 25th of current month
    endDate = new Date(year, month, 25);
  } else {
    // start = 26th of current month
    startDate = new Date(year, month, 26);
    // end = 25th of next month
    endDate = new Date(year, month + 1, 25);
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
}
