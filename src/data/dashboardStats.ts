/**
 * Dashboard hero statistics seed data.
 * 
 * Four key metrics for the landing dashboard:
 * - Total Contacts: All contacts across selected account
 * - Contactable: Contacts with valid email AND not unsubscribed
 * - Active Mailouts: Currently running mailout campaigns
 * - Engagement Rate: Average open rate across recent mailouts
 */

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  format: 'number' | 'percent';
  /** Optional trend indicator: positive = up, negative = down, 0 = flat */
  trend?: number;
  /** Description shown on hover */
  description?: string;
}

export const dashboardStats: DashboardStat[] = [
  {
    id: 'total-contacts',
    label: 'Total Contacts',
    value: 48752,
    format: 'number',
    trend: 3.2,
    description: 'All contacts in your database',
  },
  {
    id: 'contactable',
    label: 'Contactable',
    value: 41284,
    format: 'number',
    trend: 1.8,
    description: 'Contacts with valid email who have not unsubscribed',
  },
  {
    id: 'active-mailouts',
    label: 'Active Mailouts',
    value: 7,
    format: 'number',
    trend: 0,
    description: 'Currently running mailout campaigns',
  },
  {
    id: 'engagement-rate',
    label: 'Engagement Rate',
    value: 24.6,
    format: 'percent',
    trend: -0.4,
    description: 'Average open rate across recent mailouts',
  },
];
