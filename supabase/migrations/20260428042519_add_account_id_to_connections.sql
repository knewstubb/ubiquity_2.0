ALTER TABLE connections ADD COLUMN IF NOT EXISTS account_id text DEFAULT 'acc-master';
