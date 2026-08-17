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
  /** Last 7 data points for sparkline visualization */
  sparkline?: number[];
  /** Accent color for the card */
  accent?: 'teal' | 'amber' | 'violet' | 'rose';
}

export const dashboardStats: DashboardStat[] = [
  {
    id: 'total-contacts',
    label: 'Total Contacts',
    value: 48752,
    format: 'number',
    trend: 3.2,
    description: 'All contacts in your database',
    sparkline: [42100, 43500, 44200, 45800, 46500, 47900, 48752],
    accent: 'teal',
  },
  {
    id: 'contactable',
    label: 'Contactable',
    value: 41284,
    format: 'number',
    trend: 1.8,
    description: 'Contacts with valid email who have not unsubscribed',
    sparkline: [38200, 38900, 39400, 40100, 40500, 40900, 41284],
    accent: 'teal',
  },
  {
    id: 'active-mailouts',
    label: 'Active Mailouts',
    value: 7,
    format: 'number',
    trend: 0,
    description: 'Currently running mailout campaigns',
    sparkline: [5, 8, 6, 9, 7, 6, 7],
    accent: 'amber',
  },
  {
    id: 'engagement-rate',
    label: 'Engagement Rate',
    value: 24.6,
    format: 'percent',
    trend: -0.4,
    description: 'Average open rate across recent mailouts',
    sparkline: [26.2, 25.8, 25.1, 24.9, 25.0, 24.8, 24.6],
    accent: 'violet',
  },
];
