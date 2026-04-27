export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type JourneyType = 'welcome' | 're-engagement' | 'transactional' | 'promotional';

export interface Campaign {
  id: string;
  name: string;
  accountId: string;
  goal: string;
  dateRange: { start: string; end: string };
  status: CampaignStatus;
  journeyIds: string[];
  tags: string[];
}

export interface Journey {
  id: string;
  name: string;
  campaignId: string;
  accountId: string;
  status: CampaignStatus;
  nodeCount: number;
  entryCount: number;
  type: JourneyType;
}
