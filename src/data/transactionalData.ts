export interface TransactionalRecord {
  id: string;
  contactId: string;
  contactName: string;
  accountId: string;
  date: string;
  amount: number;
  description: string;
}

export interface TransactionalDatabase {
  id: string;
  name: string;
  records: TransactionalRecord[];
}

export const transactionalDatabases: TransactionalDatabase[] = [
  {
    id: 'tdb-bookings',
    name: 'Spa Bookings',
    records: [
      { id: 'txn-001', contactId: 'con-001', contactName: 'Aroha Tūhoe', accountId: 'acc-auckland', date: '2024-11-20', amount: 120, description: 'Deep Tissue Massage — 60min' },
      { id: 'txn-002', contactId: 'con-002', contactName: 'Nikau Patel', accountId: 'acc-auckland', date: '2024-11-18', amount: 180, description: 'Hot Stone Massage — 90min' },
      { id: 'txn-003', contactId: 'con-005', contactName: 'Hēmi Raukura', accountId: 'acc-auckland', date: '2024-11-15', amount: 95, description: 'Express Facial — 30min' },
      { id: 'txn-004', contactId: 'con-014', contactName: 'Tama Wiremu', accountId: 'acc-wellington', date: '2024-11-22', amount: 150, description: 'Couples Massage — 60min' },
      { id: 'txn-005', contactId: 'con-027', contactName: 'Kahu Ngata', accountId: 'acc-christchurch', date: '2024-11-19', amount: 200, description: 'Full Day Spa Package' },
      { id: 'txn-006', contactId: 'con-040', contactName: 'Rua Tūhoe', accountId: 'acc-queenstown', date: '2024-11-21', amount: 110, description: 'Aromatherapy Massage — 60min' },
    ],
  },
  {
    id: 'tdb-purchases',
    name: 'Product Purchases',
    records: [
      { id: 'txn-101', contactId: 'con-001', contactName: 'Aroha Tūhoe', accountId: 'acc-auckland', date: '2024-11-20', amount: 45, description: 'Lavender Essential Oil Set' },
      { id: 'txn-102', contactId: 'con-003', contactName: 'Maia Chen', accountId: 'acc-auckland', date: '2024-11-17', amount: 89, description: 'Organic Skincare Bundle' },
      { id: 'txn-103', contactId: 'con-015', contactName: 'Mere Pōtiki', accountId: 'acc-wellington', date: '2024-11-16', amount: 35, description: 'Relaxation Candle' },
      { id: 'txn-104', contactId: 'con-028', contactName: 'Ari Manu', accountId: 'acc-christchurch', date: '2024-11-14', amount: 120, description: 'Gift Voucher — $120' },
      { id: 'txn-105', contactId: 'con-041', contactName: 'Tui Rangi', accountId: 'acc-queenstown', date: '2024-11-13', amount: 65, description: 'Body Scrub Kit' },
    ],
  },
  {
    id: 'tdb-treatments',
    name: 'Treatment History',
    records: [
      { id: 'txn-201', contactId: 'con-001', contactName: 'Aroha Tūhoe', accountId: 'acc-auckland', date: '2024-11-22', amount: 95, description: 'Hydrating Facial — 45min' },
      { id: 'txn-202', contactId: 'con-005', contactName: 'Hēmi Raukura', accountId: 'acc-auckland', date: '2024-11-20', amount: 140, description: 'Anti-Aging Treatment — 60min' },
    ],
  },
  {
    id: 'tdb-memberships',
    name: 'Membership Rewards Programme',
    records: [
      { id: 'txn-301', contactId: 'con-002', contactName: 'Nikau Patel', accountId: 'acc-auckland', date: '2024-10-01', amount: 99, description: 'Gold Monthly Membership' },
      { id: 'txn-302', contactId: 'con-014', contactName: 'Tama Wiremu', accountId: 'acc-wellington', date: '2024-09-15', amount: 149, description: 'Platinum Annual Membership' },
    ],
  },
  {
    id: 'tdb-gift-cards',
    name: 'Gift Card Redemptions',
    records: [
      { id: 'txn-401', contactId: 'con-003', contactName: 'Maia Chen', accountId: 'acc-auckland', date: '2024-11-25', amount: 50, description: 'Digital Gift Card — $50' },
      { id: 'txn-402', contactId: 'con-027', contactName: 'Kahu Ngata', accountId: 'acc-christchurch', date: '2024-11-10', amount: 100, description: 'Physical Gift Card — $100' },
    ],
  },
  {
    id: 'tdb-loyalty',
    name: 'Customer Loyalty Points',
    records: [
      { id: 'txn-501', contactId: 'con-001', contactName: 'Aroha Tūhoe', accountId: 'acc-auckland', date: '2024-11-20', amount: 120, description: 'Points earned — booking' },
      { id: 'txn-502', contactId: 'con-002', contactName: 'Nikau Patel', accountId: 'acc-auckland', date: '2024-11-18', amount: 180, description: 'Points earned — booking' },
    ],
  },
];
