import type { PermissionUser } from '../models/permissions';

export const users: PermissionUser[] = [
  { id: 'usr-001', name: 'Aroha Mitchell', email: 'aroha@serenityspa.co.nz', initials: 'AM' },
  { id: 'usr-002', name: 'Nikau Patel', email: 'nikau@serenityspa.co.nz', initials: 'NP' },
  { id: 'usr-003', name: 'Maia Chen', email: 'maia@serenityspa.co.nz', initials: 'MC' },
  { id: 'usr-004', name: 'Tāne Williams', email: 'tane@serenityspa.co.nz', initials: 'TW' },
  { id: 'usr-005', name: 'Isla Thompson', email: 'isla@serenityspa.co.nz', initials: 'IT' },

  // Christchurch City Council users
  { id: 'usr-006', name: 'Sarah Thornton', email: 'sarah@ccc.govt.nz', initials: 'ST' },
  { id: 'usr-007', name: 'Mike Regan', email: 'mike@ccc.govt.nz', initials: 'MR' },
  { id: 'usr-008', name: 'Priya Sharma', email: 'priya@ccc.govt.nz', initials: 'PS' },

  // Save the Children NZ users
  { id: 'usr-009', name: 'Emma Wilson', email: 'emma@savethechildren.org.nz', initials: 'EW' },
  { id: 'usr-010', name: 'David Tui', email: 'david@savethechildren.org.nz', initials: 'DT' },
  { id: 'usr-011', name: 'Hana Moana', email: 'hana@savethechildren.org.nz', initials: 'HM' },
];
