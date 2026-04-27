import type { Account } from '../models/account';

export const accounts: Account[] = [
  {
    id: 'acc-master',
    name: 'Serenity Spa Group',
    parentId: null,
    childIds: ['acc-auckland', 'acc-wellington', 'acc-christchurch', 'acc-queenstown'],
    region: 'National',
    status: 'active',
  },
  {
    id: 'acc-auckland',
    name: 'Serenity Spa Auckland',
    parentId: 'acc-master',
    childIds: [],
    region: 'Auckland',
    status: 'active',
  },
  {
    id: 'acc-wellington',
    name: 'Serenity Spa Wellington',
    parentId: 'acc-master',
    childIds: [],
    region: 'Wellington',
    status: 'active',
  },
  {
    id: 'acc-christchurch',
    name: 'Serenity Spa Christchurch',
    parentId: 'acc-master',
    childIds: [],
    region: 'Christchurch',
    status: 'active',
  },
  {
    id: 'acc-queenstown',
    name: 'Serenity Spa Queenstown',
    parentId: 'acc-master',
    childIds: [],
    region: 'Queenstown',
    status: 'active',
  },
];
