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
    name: 'Bookings',
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
    name: 'Purchases',
    records: [
      { id: 'txn-101', contactId: 'con-001', contactName: 'Aroha Tūhoe', accountId: 'acc-auckland', date: '2024-11-20', amount: 45, description: 'Lavender Essential Oil Set' },
      { id: 'txn-102', contactId: 'con-003', contactName: 'Maia Chen', accountId: 'acc-auckland', date: '2024-11-17', amount: 89, description: 'Organic Skincare Bundle' },
      { id: 'txn-103', contactId: 'con-015', contactName: 'Mere Pōtiki', accountId: 'acc-wellington', date: '2024-11-16', amount: 35, description: 'Relaxation Candle' },
      { id: 'txn-104', contactId: 'con-028', contactName: 'Ari Manu', accountId: 'acc-christchurch', date: '2024-11-14', amount: 120, description: 'Gift Voucher — $120' },
      { id: 'txn-105', contactId: 'con-041', contactName: 'Tui Rangi', accountId: 'acc-queenstown', date: '2024-11-13', amount: 65, description: 'Body Scrub Kit' },
    ],
  },
];
