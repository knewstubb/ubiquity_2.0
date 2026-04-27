CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES accounts(id),
  child_ids TEXT[] DEFAULT '{}',
  region TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  goal TEXT NOT NULL DEFAULT '',
  date_range JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  journey_ids TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  modified_by TEXT
);

CREATE TABLE journeys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  node_count INTEGER NOT NULL DEFAULT 0,
  entry_count INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('welcome', 're-engagement', 'transactional', 'promotional')),
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  modified_by TEXT
);

CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('S3', 'SFTP', 'Azure Blob')),
  status TEXT NOT NULL CHECK (status IN ('connected', 'error')),
  base_path TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}',
  modified_by TEXT
);

CREATE TABLE connectors (
  id TEXT PRIMARY KEY,
  connection_id TEXT NOT NULL REFERENCES connections(id),
  name TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'export',
  data_type TEXT NOT NULL,
  transactional_source TEXT,
  enrichment_key_field TEXT,
  selected_fields JSONB NOT NULL DEFAULT '[]',
  file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'json', 'xml')),
  format_options JSONB NOT NULL DEFAULT '{}',
  file_naming_pattern TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_by TEXT
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  membership_tier TEXT NOT NULL CHECK (membership_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  join_date TEXT NOT NULL,
  communication_preferences JSONB NOT NULL DEFAULT '{}',
  account_id TEXT NOT NULL REFERENCES accounts(id),
  segment_ids TEXT[] DEFAULT '{}',
  journey_ids TEXT[] DEFAULT '{}',
  activity_timeline JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE segments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  type TEXT NOT NULL CHECK (type IN ('smart', 'manual')),
  root_group JSONB NOT NULL DEFAULT '{}',
  member_count INTEGER NOT NULL DEFAULT 0,
  modified_by TEXT
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'colour', 'font', 'footer')),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'campaign', 'account')),
  account_id TEXT NOT NULL REFERENCES accounts(id),
  campaign_id TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  colour_value TEXT,
  modified_by TEXT
);

CREATE TABLE treatments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES contacts(id),
  treatment_type TEXT NOT NULL,
  therapist_name TEXT NOT NULL,
  treatment_date TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES contacts(id),
  product_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Skincare', 'Wellness', 'Gift Card', 'Treatment Voucher')),
  purchase_channel TEXT NOT NULL CHECK (purchase_channel IN ('In-Person', 'Online')),
  purchase_date TEXT NOT NULL,
  price NUMERIC NOT NULL
);

CREATE TABLE permission_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  permissions JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE user_account_assignments (
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  permission_group_id TEXT REFERENCES permission_groups(id),
  custom_permissions JSONB,
  PRIMARY KEY (user_id, account_id)
);

CREATE TABLE prototype_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  initials TEXT NOT NULL DEFAULT ''
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  link_to TEXT
);

CREATE TABLE field_registry (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE operator_registry (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE journey_seeds (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE spa_contacts (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE transactional_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);;
