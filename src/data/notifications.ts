import type { Notification } from '../models/notification';

export const notifications: Notification[] = [
  {
    id: 'ntf-001',
    type: 'success',
    message: 'Summer Glow Campaign is now live across all locations.',
    timestamp: '2024-11-15T09:00:00Z',
    read: true,
    linkTo: '/automations/campaigns',
  },
  {
    id: 'ntf-002',
    type: 'info',
    message: '12 new members joined this week across all regions.',
    timestamp: '2024-12-09T08:00:00Z',
    read: false,
    linkTo: '/audiences/databases',
  },
  {
    id: 'ntf-003',
    type: 'warning',
    message: 'Auckland Re-engagement journey has a low open rate (12%). Consider revising subject lines.',
    timestamp: '2024-12-08T14:30:00Z',
    read: false,
    linkTo: '/automations/journeys',
  },
  {
    id: 'ntf-004',
    type: 'error',
    message: 'Mailchimp integration sync failed. Check connection settings.',
    timestamp: '2024-12-10T06:15:00Z',
    read: false,
    linkTo: '/',
  },
  {
    id: 'ntf-005',
    type: 'success',
    message: 'Win-Back Campaign completed — 23% of lapsed members re-engaged.',
    timestamp: '2024-12-01T10:00:00Z',
    read: true,
  },
  {
    id: 'ntf-006',
    type: 'info',
    message: 'Loyalty Programme Launch campaign is ready for review.',
    timestamp: '2024-12-12T11:00:00Z',
    read: false,
    linkTo: '/automations/campaigns',
  },
  {
    id: 'ntf-007',
    type: 'warning',
    message: '8 contacts in the "At Risk" segment haven\'t visited in over 90 days.',
    timestamp: '2024-12-11T09:00:00Z',
    read: true,
    linkTo: '/audiences/segments',
  },
];
