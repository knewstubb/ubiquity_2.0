import type { SyncRule, AccountSchema } from '../models/account-sync';

/**
 * Simulated account schemas — different accounts have slightly different column names
 * to demonstrate the mapping complexity.
 */
export const accountSchemas: AccountSchema[] = [
  // Serenity Spa Group (root)
  {
    accountId: 'acc-master',
    contactColumns: [
      'email_address',
      'first_name',
      'last_name',
      'phone_number',
      'membership_tier',
      'date_of_birth',
      'preferred_location',
      'marketing_opt_in',
      'sms_opt_in',
      'signup_date',
      'customer_id',
      'notes',
    ],
    transactionalLists: [
      {
        id: 'tl-master-bookings',
        name: 'Bookings',
        columns: ['booking_id', 'treatment_type', 'treatment_date', 'duration_minutes', 'price', 'therapist_name', 'location', 'status'],
      },
      {
        id: 'tl-master-purchases',
        name: 'Product Purchases',
        columns: ['purchase_id', 'product_name', 'quantity', 'amount', 'purchase_date', 'payment_method'],
      },
    ],
  },
  // Serenity Spa Auckland
  {
    accountId: 'acc-auckland',
    contactColumns: [
      'email',
      'given_name',
      'surname',
      'mobile',
      'loyalty_level',
      'dob',
      'home_branch',
      'email_consent',
      'sms_consent',
      'registration_date',
      'external_id',
      'comments',
    ],
    transactionalLists: [
      {
        id: 'tl-akl-appointments',
        name: 'Appointments',
        columns: ['appointment_id', 'service_type', 'appointment_date', 'duration_mins', 'cost', 'practitioner', 'branch', 'appointment_status'],
      },
    ],
  },
  // Serenity Spa Wellington
  {
    accountId: 'acc-wellington',
    contactColumns: [
      'email_address',
      'first_name',
      'last_name',
      'contact_phone',
      'tier',
      'birth_date',
      'location_preference',
      'email_optin',
      'sms_optin',
      'joined_date',
      'ref_id',
      'internal_notes',
    ],
    transactionalLists: [
      {
        id: 'tl-wlg-bookings',
        name: 'Bookings',
        columns: ['booking_ref', 'service_name', 'booking_date', 'length_minutes', 'total_price', 'therapist', 'venue', 'booking_status'],
      },
    ],
  },
  // Auckland CBD (grandchild)
  {
    accountId: 'acc-akl-cbd',
    contactColumns: [
      'email',
      'first_name',
      'last_name',
      'phone',
      'membership_level',
      'date_of_birth',
      'branch',
      'email_subscribed',
      'sms_subscribed',
      'created_date',
      'client_id',
    ],
    transactionalLists: [
      {
        id: 'tl-cbd-visits',
        name: 'Salon Visits',
        columns: ['visit_id', 'treatment', 'visit_date', 'duration', 'charge', 'stylist', 'visit_status'],
      },
    ],
  },
  // Serenity Spa Christchurch
  {
    accountId: 'acc-christchurch',
    contactColumns: [
      'email',
      'first_name',
      'surname',
      'phone_number',
      'loyalty_tier',
      'dob',
      'preferred_branch',
      'email_opt_in',
      'sms_opt_in',
      'join_date',
      'customer_ref',
    ],
    transactionalLists: [
      {
        id: 'tl-chc-bookings',
        name: 'Bookings',
        columns: ['booking_ref', 'treatment_name', 'date', 'duration_min', 'amount', 'staff_member', 'booking_status'],
      },
    ],
  },
  // Serenity Spa Queenstown
  {
    accountId: 'acc-queenstown',
    contactColumns: [
      'email_address',
      'given_name',
      'family_name',
      'mobile_number',
      'member_level',
      'date_of_birth',
      'location',
      'marketing_consent',
      'sms_consent',
      'registered_date',
      'external_ref',
    ],
    transactionalLists: [
      {
        id: 'tl-qtn-bookings',
        name: 'Bookings',
        columns: ['reference', 'service', 'booking_date', 'minutes', 'price_nzd', 'therapist', 'status'],
      },
    ],
  },
  // Auckland Newmarket (grandchild)
  {
    accountId: 'acc-akl-newmarket',
    contactColumns: [
      'email',
      'first_name',
      'last_name',
      'mobile',
      'tier',
      'birth_date',
      'store',
      'email_optin',
      'sms_optin',
      'signup_date',
      'client_ref',
    ],
    transactionalLists: [
      {
        id: 'tl-newmarket-appointments',
        name: 'Appointments',
        columns: ['appt_id', 'service_type', 'appt_date', 'length', 'price', 'staff', 'status'],
      },
    ],
  },
  // Christchurch City Council (root)
  {
    accountId: 'acc-ccc',
    contactColumns: [
      'email_address',
      'first_name',
      'last_name',
      'phone',
      'resident_type',
      'address',
      'suburb',
      'postcode',
      'newsletter_opt_in',
      'rates_account_number',
      'registration_date',
    ],
    transactionalLists: [
      {
        id: 'tl-ccc-events',
        name: 'Event Registrations',
        columns: ['registration_id', 'event_name', 'event_date', 'venue', 'ticket_type', 'quantity', 'total_cost'],
      },
    ],
  },
  // CCC Libraries
  {
    accountId: 'acc-ccc-libraries',
    contactColumns: [
      'email',
      'given_name',
      'family_name',
      'mobile_phone',
      'membership_type',
      'street_address',
      'suburb',
      'post_code',
      'email_notifications',
      'library_card_number',
      'member_since',
    ],
    transactionalLists: [
      {
        id: 'tl-lib-loans',
        name: 'Book Loans',
        columns: ['loan_id', 'title', 'author', 'loan_date', 'due_date', 'return_date', 'branch', 'fine_amount'],
      },
    ],
  },
];

/**
 * Seed sync rules demonstrating different scenarios:
 * - Parent-to-child sync (root → Auckland)
 * - Sibling sync (Auckland → Wellington)
 * - Grandchild sync (Auckland → Auckland CBD)
 * - Transaction sync nested under a contact rule
 * - Paused rule
 */
export const syncRules: SyncRule[] = [
  // Contact sync: Master → Auckland (active, 6 columns mapped)
  {
    id: 'sync-master-akl',
    sourceAccountId: 'acc-master',
    targetAccountId: 'acc-auckland',
    tableType: 'contact',
    matchColumnSource: 'email_address',
    matchColumnTarget: 'email',
    onMissing: 'create',
    triggerOnMappedOnly: false,
    excludedCallerTypes: [],
    columnMappings: [
      { id: 'cm-1', sourceColumn: 'first_name', targetColumn: 'given_name' },
      { id: 'cm-2', sourceColumn: 'last_name', targetColumn: 'surname' },
      { id: 'cm-3', sourceColumn: 'phone_number', targetColumn: 'mobile' },
      { id: 'cm-4', sourceColumn: 'membership_tier', targetColumn: 'loyalty_level' },
      { id: 'cm-5', sourceColumn: 'marketing_opt_in', targetColumn: 'email_consent' },
      { id: 'cm-6', sourceColumn: 'sms_opt_in', targetColumn: 'sms_consent' },
    ],
    status: 'active',
    createdAt: '2026-06-20T10:30:00Z',
    updatedAt: '2026-07-01T14:20:00Z',
  },
  // Transaction sync: Master Bookings → Auckland Appointments (active, nested under contact rule)
  {
    id: 'sync-master-akl-bookings',
    sourceAccountId: 'acc-master',
    targetAccountId: 'acc-auckland',
    tableType: 'transaction',
    sourceListName: 'Bookings',
    targetListName: 'Appointments',
    parentRuleId: 'sync-master-akl',
    matchColumnSource: 'booking_id',
    matchColumnTarget: 'appointment_id',
    onMissing: 'create',
    triggerOnMappedOnly: true,
    excludedCallerTypes: ['BulkImport'],
    columnMappings: [
      { id: 'cm-7', sourceColumn: 'treatment_type', targetColumn: 'service_type' },
      { id: 'cm-8', sourceColumn: 'treatment_date', targetColumn: 'appointment_date' },
      { id: 'cm-9', sourceColumn: 'duration_minutes', targetColumn: 'duration_mins' },
      { id: 'cm-10', sourceColumn: 'price', targetColumn: 'cost' },
      { id: 'cm-11', sourceColumn: 'therapist_name', targetColumn: 'practitioner' },
    ],
    status: 'active',
    createdAt: '2026-06-22T08:00:00Z',
    updatedAt: '2026-07-01T14:20:00Z',
  },
  // Contact sync: Auckland → Wellington (active, sibling sync)
  {
    id: 'sync-akl-wlg',
    sourceAccountId: 'acc-auckland',
    targetAccountId: 'acc-wellington',
    tableType: 'contact',
    matchColumnSource: 'email',
    matchColumnTarget: 'email_address',
    onMissing: 'skip',
    triggerOnMappedOnly: true,
    excludedCallerTypes: ['BulkImport', 'Migration'],
    columnMappings: [
      { id: 'cm-12', sourceColumn: 'given_name', targetColumn: 'first_name' },
      { id: 'cm-13', sourceColumn: 'surname', targetColumn: 'last_name' },
      { id: 'cm-14', sourceColumn: 'mobile', targetColumn: 'contact_phone' },
      { id: 'cm-15', sourceColumn: 'loyalty_level', targetColumn: 'tier' },
    ],
    status: 'active',
    createdAt: '2026-06-25T09:15:00Z',
    updatedAt: '2026-06-25T09:15:00Z',
  },
  // Contact sync: Auckland → Auckland CBD (parent → grandchild, paused)
  {
    id: 'sync-akl-cbd',
    sourceAccountId: 'acc-auckland',
    targetAccountId: 'acc-akl-cbd',
    tableType: 'contact',
    matchColumnSource: 'email',
    matchColumnTarget: 'email',
    onMissing: 'create',
    triggerOnMappedOnly: false,
    excludedCallerTypes: [],
    columnMappings: [
      { id: 'cm-16', sourceColumn: 'given_name', targetColumn: 'first_name' },
      { id: 'cm-17', sourceColumn: 'surname', targetColumn: 'last_name' },
      { id: 'cm-18', sourceColumn: 'mobile', targetColumn: 'phone' },
      { id: 'cm-19', sourceColumn: 'loyalty_level', targetColumn: 'membership_level' },
      { id: 'cm-20', sourceColumn: 'dob', targetColumn: 'date_of_birth' },
    ],
    status: 'paused',
    createdAt: '2026-07-01T11:00:00Z',
    updatedAt: '2026-07-10T16:45:00Z',
  },
  // Contact sync: CCC → CCC Libraries (active)
  {
    id: 'sync-ccc-lib',
    sourceAccountId: 'acc-ccc',
    targetAccountId: 'acc-ccc-libraries',
    tableType: 'contact',
    matchColumnSource: 'email_address',
    matchColumnTarget: 'email',
    onMissing: 'create',
    triggerOnMappedOnly: false,
    excludedCallerTypes: [],
    columnMappings: [
      { id: 'cm-21', sourceColumn: 'first_name', targetColumn: 'given_name' },
      { id: 'cm-22', sourceColumn: 'last_name', targetColumn: 'family_name' },
      { id: 'cm-23', sourceColumn: 'phone', targetColumn: 'mobile_phone' },
      { id: 'cm-24', sourceColumn: 'address', targetColumn: 'street_address' },
      { id: 'cm-25', sourceColumn: 'postcode', targetColumn: 'post_code' },
      { id: 'cm-26', sourceColumn: 'newsletter_opt_in', targetColumn: 'email_notifications' },
      { id: 'cm-27', sourceColumn: 'rates_account_number', targetColumn: 'library_card_number' },
    ],
    status: 'active',
    createdAt: '2026-06-18T14:00:00Z',
    updatedAt: '2026-07-05T09:30:00Z',
  },
];
