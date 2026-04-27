import type { ContactRecord } from './data';

export interface ActivityEvent {
  id: string;
  type: 'purchase' | 'visit' | 'email_open' | 'form_submit' | 'journey_enter';
  description: string;
  timestamp: string;
}

export interface Contact extends ContactRecord {
  accountId: string;
  segmentIds: string[];
  journeyIds: string[];
  activityTimeline: ActivityEvent[];
}
