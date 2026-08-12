import type { Mailout } from '../models/mailout';

/**
 * Sample mailout data for prototype
 * Represents sent email campaigns with engagement metrics
 */
export const mailouts: Mailout[] = [
  // Spa & Wellness (acc-master hierarchy)
  {
    id: 'mlo-summer-launch',
    name: 'Summer Specials Launch',
    subject: 'Introducing Our Summer Glow Collection ☀️',
    preheaderText: 'Exclusive treatments to help you shine this summer',
    accountId: 'acc-master',
    campaignId: 'cmp-summer-glow',
    status: 'sent',
    sentAt: '2026-08-10T09:00:00Z',
    segmentId: 'seg-all-active',
    segmentName: 'All Active Members',
    metrics: {
      sent: 12450,
      delivered: 12105,
      bounced: 345,
      hardBounced: 124,
      softBounced: 221,
      opened: 4842,
      clicked: 1936,
      unsubscribed: 24,
      optedOut: 18,
      spamComplaints: 3,
    },
    links: [
      { id: 'link-1', url: 'https://example.com/summer-specials', label: 'View Summer Specials', uniqueClicks: 856, totalClicks: 1124 },
      { id: 'link-2', url: 'https://example.com/book-now', label: 'Book Now', uniqueClicks: 542, totalClicks: 678 },
      { id: 'link-3', url: 'https://example.com/gift-cards', label: 'Gift Cards', uniqueClicks: 234, totalClicks: 298 },
      { id: 'link-4', url: 'https://example.com/locations', label: 'Find a Location', uniqueClicks: 189, totalClicks: 212 },
    ],
    deviceBreakdown: { desktop: 35, mobile: 65 },
    hourlyActivity: [
      { hour: 9, opens: 1245, clicks: 498 },
      { hour: 10, opens: 876, clicks: 350 },
      { hour: 11, opens: 654, clicks: 262 },
      { hour: 12, opens: 543, clicks: 217 },
      { hour: 13, opens: 432, clicks: 173 },
      { hour: 14, opens: 321, clicks: 128 },
      { hour: 15, opens: 287, clicks: 115 },
      { hour: 16, opens: 234, clicks: 94 },
      { hour: 17, opens: 156, clicks: 62 },
      { hour: 18, opens: 94, clicks: 37 },
    ],
  },
  {
    id: 'mlo-auckland-welcome',
    name: 'Auckland Welcome Email',
    subject: 'Welcome to Glow Spa Auckland!',
    preheaderText: 'Your journey to relaxation starts here',
    accountId: 'acc-auckland',
    campaignId: 'cmp-welcome-series',
    journeyId: 'jrn-welcome-akl',
    status: 'sent',
    sentAt: '2026-08-08T14:30:00Z',
    segmentName: 'New Members - Auckland',
    metrics: {
      sent: 156,
      delivered: 154,
      bounced: 2,
      hardBounced: 1,
      softBounced: 1,
      opened: 89,
      clicked: 45,
      unsubscribed: 0,
      optedOut: 0,
      spamComplaints: 0,
    },
    links: [
      { id: 'link-1', url: 'https://example.com/member-portal', label: 'Access Member Portal', uniqueClicks: 28, totalClicks: 32 },
      { id: 'link-2', url: 'https://example.com/first-visit', label: 'Prepare for Your First Visit', uniqueClicks: 22, totalClicks: 25 },
      { id: 'link-3', url: 'https://example.com/treatments', label: 'Browse Treatments', uniqueClicks: 15, totalClicks: 18 },
    ],
    deviceBreakdown: { desktop: 28, mobile: 72 },
    hourlyActivity: [
      { hour: 14, opens: 45, clicks: 23 },
      { hour: 15, opens: 22, clicks: 11 },
      { hour: 16, opens: 12, clicks: 6 },
      { hour: 17, opens: 6, clicks: 3 },
      { hour: 18, opens: 4, clicks: 2 },
    ],
  },
  {
    id: 'mlo-winback-reminder',
    name: 'We Miss You - 20% Off',
    subject: 'It\'s been a while... Here\'s 20% off your next visit',
    preheaderText: 'Come back and treat yourself',
    accountId: 'acc-master',
    campaignId: 'cmp-win-back',
    status: 'sent',
    sentAt: '2026-08-05T10:00:00Z',
    segmentName: 'Lapsed 90+ Days',
    metrics: {
      sent: 2845,
      delivered: 2756,
      bounced: 89,
      hardBounced: 34,
      softBounced: 55,
      opened: 689,
      clicked: 207,
      unsubscribed: 45,
      optedOut: 38,
      spamComplaints: 2,
    },
    links: [
      { id: 'link-1', url: 'https://example.com/redeem-offer', label: 'Redeem 20% Off', uniqueClicks: 156, totalClicks: 189 },
      { id: 'link-2', url: 'https://example.com/whats-new', label: 'See What\'s New', uniqueClicks: 67, totalClicks: 78 },
    ],
    deviceBreakdown: { desktop: 42, mobile: 58 },
    hourlyActivity: [
      { hour: 10, opens: 234, clicks: 70 },
      { hour: 11, opens: 156, clicks: 47 },
      { hour: 12, opens: 123, clicks: 37 },
      { hour: 13, opens: 89, clicks: 27 },
      { hour: 14, opens: 56, clicks: 17 },
      { hour: 15, opens: 31, clicks: 9 },
    ],
  },

  // Christchurch City Council
  {
    id: 'mlo-ccc-summer-events',
    name: 'Summer Events Newsletter - January',
    subject: 'What\'s on in Christchurch this January',
    preheaderText: 'Festivals, markets, and free activities for the whole family',
    accountId: 'acc-ccc',
    campaignId: 'cmp-ccc-summer',
    status: 'sent',
    sentAt: '2026-08-01T08:00:00Z',
    segmentName: 'Event Subscribers',
    metrics: {
      sent: 45230,
      delivered: 44125,
      bounced: 1105,
      hardBounced: 412,
      softBounced: 693,
      opened: 15443,
      clicked: 4633,
      unsubscribed: 89,
      optedOut: 67,
      spamComplaints: 12,
    },
    links: [
      { id: 'link-1', url: 'https://ccc.govt.nz/events/sparks', label: 'Sparks in the Park', uniqueClicks: 1234, totalClicks: 1567 },
      { id: 'link-2', url: 'https://ccc.govt.nz/events/buskers', label: 'World Buskers Festival', uniqueClicks: 987, totalClicks: 1234 },
      { id: 'link-3', url: 'https://ccc.govt.nz/pools', label: 'Pool Opening Hours', uniqueClicks: 756, totalClicks: 892 },
      { id: 'link-4', url: 'https://ccc.govt.nz/libraries', label: 'Library Holiday Programmes', uniqueClicks: 543, totalClicks: 654 },
      { id: 'link-5', url: 'https://ccc.govt.nz/parks', label: 'Parks & Reserves Map', uniqueClicks: 432, totalClicks: 523 },
    ],
    deviceBreakdown: { desktop: 45, mobile: 55 },
    hourlyActivity: [
      { hour: 8, opens: 3456, clicks: 1037 },
      { hour: 9, opens: 2876, clicks: 863 },
      { hour: 10, opens: 2345, clicks: 704 },
      { hour: 11, opens: 1987, clicks: 596 },
      { hour: 12, opens: 1654, clicks: 496 },
      { hour: 13, opens: 1234, clicks: 370 },
      { hour: 14, opens: 987, clicks: 296 },
      { hour: 15, opens: 654, clicks: 196 },
      { hour: 16, opens: 250, clicks: 75 },
    ],
  },
  {
    id: 'mlo-ccc-rates-q3',
    name: 'Rates Due Reminder - Q3 2026',
    subject: 'Your rates payment is due on 20 August',
    preheaderText: 'Pay online, by direct debit, or at any service centre',
    accountId: 'acc-ccc',
    campaignId: 'cmp-ccc-rates',
    status: 'sent',
    sentAt: '2026-08-06T07:00:00Z',
    segmentName: 'Q3 Rates Due',
    metrics: {
      sent: 89456,
      delivered: 87234,
      bounced: 2222,
      hardBounced: 856,
      softBounced: 1366,
      opened: 52340,
      clicked: 31404,
      unsubscribed: 23,
      optedOut: 19,
      spamComplaints: 5,
    },
    links: [
      { id: 'link-1', url: 'https://ccc.govt.nz/pay-rates', label: 'Pay Now', uniqueClicks: 28456, totalClicks: 34123 },
      { id: 'link-2', url: 'https://ccc.govt.nz/rates-rebate', label: 'Check Rebate Eligibility', uniqueClicks: 2345, totalClicks: 2876 },
      { id: 'link-3', url: 'https://ccc.govt.nz/payment-plans', label: 'Set Up Payment Plan', uniqueClicks: 1234, totalClicks: 1456 },
    ],
    deviceBreakdown: { desktop: 52, mobile: 48 },
    hourlyActivity: [
      { hour: 7, opens: 8765, clicks: 5259 },
      { hour: 8, opens: 9876, clicks: 5926 },
      { hour: 9, opens: 8234, clicks: 4940 },
      { hour: 10, opens: 6543, clicks: 3926 },
      { hour: 11, opens: 5432, clicks: 3259 },
      { hour: 12, opens: 4567, clicks: 2740 },
      { hour: 13, opens: 3456, clicks: 2074 },
      { hour: 14, opens: 2876, clicks: 1726 },
      { hour: 15, opens: 1987, clicks: 1192 },
      { hour: 16, opens: 604, clicks: 362 },
    ],
  },

  // Save the Children NZ
  {
    id: 'mlo-stc-eoy-appeal',
    name: 'End of Year Appeal - Launch',
    subject: 'Give the gift of hope this Christmas',
    preheaderText: 'Your donation can change a child\'s life',
    accountId: 'acc-stc',
    campaignId: 'cmp-stc-eoy',
    status: 'sent',
    sentAt: '2026-08-03T09:00:00Z',
    segmentName: 'All Donors',
    metrics: {
      sent: 34567,
      delivered: 33890,
      bounced: 677,
      hardBounced: 245,
      softBounced: 432,
      opened: 11863,
      clicked: 2965,
      unsubscribed: 67,
      optedOut: 52,
      spamComplaints: 8,
    },
    links: [
      { id: 'link-1', url: 'https://savethechildren.org.nz/donate', label: 'Donate Now', uniqueClicks: 1876, totalClicks: 2345 },
      { id: 'link-2', url: 'https://savethechildren.org.nz/impact', label: 'See Your Impact', uniqueClicks: 654, totalClicks: 789 },
      { id: 'link-3', url: 'https://savethechildren.org.nz/sponsor', label: 'Sponsor a Child', uniqueClicks: 432, totalClicks: 543 },
    ],
    deviceBreakdown: { desktop: 38, mobile: 62 },
    hourlyActivity: [
      { hour: 9, opens: 2876, clicks: 719 },
      { hour: 10, opens: 2345, clicks: 586 },
      { hour: 11, opens: 1987, clicks: 497 },
      { hour: 12, opens: 1654, clicks: 414 },
      { hour: 13, opens: 1234, clicks: 309 },
      { hour: 14, opens: 876, clicks: 219 },
      { hour: 15, opens: 543, clicks: 136 },
      { hour: 16, opens: 348, clicks: 85 },
    ],
  },
  {
    id: 'mlo-stc-sponsor-aug',
    name: 'August Sponsor Update',
    subject: 'See how your sponsorship is making a difference',
    preheaderText: 'A message from your sponsored child',
    accountId: 'acc-stc',
    campaignId: 'cmp-stc-sponsor',
    status: 'sent',
    sentAt: '2026-08-07T10:00:00Z',
    segmentName: 'Active Sponsors',
    metrics: {
      sent: 8934,
      delivered: 8823,
      bounced: 111,
      hardBounced: 42,
      softBounced: 69,
      opened: 5823,
      clicked: 2329,
      unsubscribed: 4,
      optedOut: 3,
      spamComplaints: 0,
    },
    links: [
      { id: 'link-1', url: 'https://savethechildren.org.nz/my-child', label: 'View Child\'s Profile', uniqueClicks: 1654, totalClicks: 2012 },
      { id: 'link-2', url: 'https://savethechildren.org.nz/send-message', label: 'Send a Message', uniqueClicks: 543, totalClicks: 678 },
      { id: 'link-3', url: 'https://savethechildren.org.nz/send-gift', label: 'Send a Gift', uniqueClicks: 234, totalClicks: 289 },
    ],
    deviceBreakdown: { desktop: 32, mobile: 68 },
    hourlyActivity: [
      { hour: 10, opens: 1456, clicks: 582 },
      { hour: 11, opens: 1234, clicks: 494 },
      { hour: 12, opens: 987, clicks: 395 },
      { hour: 13, opens: 765, clicks: 306 },
      { hour: 14, opens: 543, clicks: 217 },
      { hour: 15, opens: 432, clicks: 173 },
      { hour: 16, opens: 287, clicks: 115 },
      { hour: 17, opens: 119, clicks: 47 },
    ],
  },

  // A recent scheduled one that's still sending
  {
    id: 'mlo-loyalty-teaser',
    name: 'Loyalty Programme Sneak Peek',
    subject: 'Something exciting is coming...',
    preheaderText: 'Be the first to know about our new rewards programme',
    accountId: 'acc-auckland',
    campaignId: 'cmp-loyalty-launch',
    status: 'sending',
    sentAt: '2026-08-13T09:00:00Z',
    scheduledAt: '2026-08-13T09:00:00Z',
    segmentName: 'Auckland VIP Members',
    metrics: {
      sent: 2456,
      delivered: 1890,
      bounced: 45,
      hardBounced: 18,
      softBounced: 27,
      opened: 567,
      clicked: 189,
      unsubscribed: 2,
      optedOut: 1,
      spamComplaints: 0,
    },
    links: [
      { id: 'link-1', url: 'https://example.com/loyalty-preview', label: 'Get Early Access', uniqueClicks: 156, totalClicks: 189 },
      { id: 'link-2', url: 'https://example.com/refer-friend', label: 'Refer a Friend', uniqueClicks: 45, totalClicks: 56 },
    ],
    deviceBreakdown: { desktop: 30, mobile: 70 },
    hourlyActivity: [
      { hour: 9, opens: 345, clicks: 115 },
      { hour: 10, opens: 222, clicks: 74 },
    ],
  },
];

/**
 * Helper to get mailouts for a specific account (including child accounts)
 */
export function getMailoutsForAccount(accountId: string, allMailouts: Mailout[] = mailouts): Mailout[] {
  // In a real app, this would check account hierarchy
  // For prototype, we return mailouts matching the account or its children
  if (accountId === 'acc-master') {
    // Master account sees all spa-related mailouts
    return allMailouts.filter(m => 
      m.accountId === 'acc-master' || 
      m.accountId.startsWith('acc-auckland') ||
      m.accountId.startsWith('acc-wellington') ||
      m.accountId.startsWith('acc-christchurch') ||
      m.accountId.startsWith('acc-queenstown')
    );
  }
  if (accountId === 'acc-ccc') {
    return allMailouts.filter(m => m.accountId.startsWith('acc-ccc'));
  }
  if (accountId === 'acc-stc') {
    return allMailouts.filter(m => m.accountId.startsWith('acc-stc'));
  }
  return allMailouts.filter(m => m.accountId === accountId);
}
