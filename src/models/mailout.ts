export type MailoutStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface MailoutMetrics {
  sent: number;
  delivered: number;
  bounced: number;
  hardBounced: number;
  softBounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  optedOut: number;
  spamComplaints: number;
}

export interface MailoutLink {
  id: string;
  url: string;
  label: string;
  uniqueClicks: number;
  totalClicks: number;
}

export interface MailoutDeviceBreakdown {
  desktop: number;
  mobile: number;
}

export interface MailoutHourlyActivity {
  hour: number;
  opens: number;
  clicks: number;
}

export interface Mailout {
  id: string;
  name: string;
  subject: string;
  preheaderText?: string;
  accountId: string;
  campaignId?: string;
  journeyId?: string;
  status: MailoutStatus;
  sentAt: string;
  scheduledAt?: string;
  templateId?: string;
  segmentId?: string;
  segmentName?: string;
  metrics: MailoutMetrics;
  links: MailoutLink[];
  deviceBreakdown: MailoutDeviceBreakdown;
  hourlyActivity: MailoutHourlyActivity[];
}
