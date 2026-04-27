import type { Segment } from '../models/segment';

export const segments: Segment[] = [
  {
    id: 'seg-gold',
    name: 'Gold Members',
    accountId: 'acc-master',
    type: 'smart',
    rootGroup: {
      combinator: 'AND',
      rules: [
        { field: 'membershipTier', operator: 'is_any_of', value: ['Gold', 'Platinum'] },
      ],
      groups: [],
    },
    memberCount: 18,
  },
  {
    id: 'seg-new',
    name: 'New This Month',
    accountId: 'acc-master',
    type: 'smart',
    rootGroup: {
      combinator: 'AND',
      rules: [
        { field: 'joinDate', operator: 'after', value: '2024-11-01' },
      ],
      groups: [],
    },
    memberCount: 7,
  },
  {
    id: 'seg-risk',
    name: 'At Risk',
    accountId: 'acc-master',
    type: 'smart',
    rootGroup: {
      combinator: 'AND',
      rules: [
        { field: 'lastVisitDate', operator: 'before', value: '2024-09-01' },
        { field: 'membershipTier', operator: 'is_any_of', value: ['Bronze', 'Silver'] },
      ],
      groups: [],
    },
    memberCount: 8,
  },
  {
    id: 'seg-auckland',
    name: 'Auckland Region',
    accountId: 'acc-auckland',
    type: 'manual',
    rootGroup: {
      combinator: 'AND',
      rules: [
        { field: 'accountId', operator: 'equals', value: 'acc-auckland' },
      ],
      groups: [],
    },
    memberCount: 13,
  },
  {
    id: 'seg-platinum-vip',
    name: 'Platinum VIPs',
    accountId: 'acc-master',
    type: 'smart',
    rootGroup: {
      combinator: 'AND',
      rules: [
        { field: 'membershipTier', operator: 'is', value: 'Platinum' },
      ],
      groups: [],
    },
    memberCount: 6,
  },
  {
    id: 'seg-queenstown-winter',
    name: 'Queenstown Winter Guests',
    accountId: 'acc-queenstown',
    type: 'manual',
    rootGroup: {
      combinator: 'AND',
      rules: [
        { field: 'accountId', operator: 'equals', value: 'acc-queenstown' },
        { field: 'lastVisitDate', operator: 'after', value: '2024-06-01' },
      ],
      groups: [],
    },
    memberCount: 9,
  },
];
