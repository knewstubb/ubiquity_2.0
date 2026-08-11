export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'welcome' | 'promotional' | 'transactional' | 'nurture' | 're-engagement';
  accountId: string | null; // null = global template
  createdAt: string;
  updatedAt: string;
}

export const emailTemplates: EmailTemplate[] = [
  // Global templates (available to all accounts)
  {
    id: 'tpl-welcome-1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}!',
    category: 'welcome',
    accountId: null,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'tpl-welcome-series-2',
    name: 'Welcome Series - Day 3',
    subject: 'Getting started with your account',
    category: 'welcome',
    accountId: null,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'tpl-promo-1',
    name: 'Monthly Newsletter',
    subject: "{{month}}'s Newsletter",
    category: 'promotional',
    accountId: null,
    createdAt: '2024-07-15T00:00:00Z',
    updatedAt: '2024-07-15T00:00:00Z',
  },
  {
    id: 'tpl-promo-2',
    name: 'Special Offer',
    subject: 'Exclusive offer just for you',
    category: 'promotional',
    accountId: null,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: 'tpl-tx-1',
    name: 'Order Confirmation',
    subject: 'Your order #{{order_id}} has been confirmed',
    category: 'transactional',
    accountId: null,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'tpl-tx-2',
    name: 'Appointment Reminder',
    subject: 'Reminder: Your appointment on {{date}}',
    category: 'transactional',
    accountId: null,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'tpl-nurture-1',
    name: 'Tips & Tricks',
    subject: 'Tips to get more from your membership',
    category: 'nurture',
    accountId: null,
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 'tpl-reeng-1',
    name: 'We Miss You',
    subject: "It's been a while, {{first_name}}",
    category: 're-engagement',
    accountId: null,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  // Account-specific templates
  {
    id: 'tpl-akl-promo-1',
    name: 'Auckland Special Event',
    subject: 'Join us for an exclusive Auckland event',
    category: 'promotional',
    accountId: 'acc-auckland',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 'tpl-wgn-welcome-1',
    name: 'Wellington Welcome',
    subject: 'Welcome to Wellington!',
    category: 'welcome',
    accountId: 'acc-wellington',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
];
