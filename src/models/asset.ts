export type AssetType = 'image' | 'colour' | 'font' | 'footer';
export type AssetScope = 'global' | 'campaign' | 'account';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  scope: AssetScope;
  accountId: string;          // always set — the owning account (or master for global)
  campaignId: string | null;  // set only when scope is 'campaign'
  tags: string[];
  createdAt: string;          // ISO date string
  colourValue?: string;       // hex colour value, only for type 'colour'
}
