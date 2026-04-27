import type { Asset } from '../models/asset';

export const seedAssets: Asset[] = [
  // Global assets
  { id: 'asset-g1', name: 'Brand Logo', type: 'image', scope: 'global', accountId: 'acc-master', campaignId: null, tags: ['branding'], createdAt: '2024-11-01T00:00:00Z' },
  { id: 'asset-g2', name: 'Primary Teal', type: 'colour', scope: 'global', accountId: 'acc-master', campaignId: null, tags: ['branding'], createdAt: '2024-11-01T00:00:00Z', colourValue: '#14B88A' },
  { id: 'asset-g3', name: 'Inter', type: 'font', scope: 'global', accountId: 'acc-master', campaignId: null, tags: ['typography'], createdAt: '2024-11-01T00:00:00Z' },
  { id: 'asset-g4', name: 'Standard Footer', type: 'footer', scope: 'global', accountId: 'acc-master', campaignId: null, tags: ['email'], createdAt: '2024-11-01T00:00:00Z' },
  // Campaign assets (tied to first seed campaign)
  { id: 'asset-c1', name: 'Summer Banner', type: 'image', scope: 'campaign', accountId: 'acc-master', campaignId: 'cmp-summer-glow', tags: ['seasonal'], createdAt: '2024-12-01T00:00:00Z' },
  { id: 'asset-c2', name: 'Campaign Accent', type: 'colour', scope: 'campaign', accountId: 'acc-master', campaignId: 'cmp-summer-glow', tags: ['seasonal'], createdAt: '2024-12-01T00:00:00Z', colourValue: '#F59E0B' },
  // Account assets
  { id: 'asset-a1', name: 'Auckland Hero Image', type: 'image', scope: 'account', accountId: 'acc-auckland', campaignId: null, tags: ['regional'], createdAt: '2024-12-15T00:00:00Z' },
  { id: 'asset-a2', name: 'Wellington Footer', type: 'footer', scope: 'account', accountId: 'acc-wellington', campaignId: null, tags: ['regional'], createdAt: '2024-12-15T00:00:00Z' },
  { id: 'asset-a3', name: 'Christchurch Brand Font', type: 'font', scope: 'account', accountId: 'acc-christchurch', campaignId: null, tags: ['regional'], createdAt: '2024-12-15T00:00:00Z' },
];
