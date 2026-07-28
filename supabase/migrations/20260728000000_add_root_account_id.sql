-- Add root_account_id column to accounts table
-- This column denormalizes the tree root for fast lookups

ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS root_account_id TEXT REFERENCES accounts(id);

-- Update existing rows: root accounts have themselves as root_account_id
UPDATE accounts 
SET root_account_id = id 
WHERE parent_id IS NULL AND root_account_id IS NULL;

-- Update child accounts: inherit from parent's root_account_id
-- This needs to run recursively for deep hierarchies
WITH RECURSIVE account_tree AS (
  -- Base: root accounts
  SELECT id, parent_id, id AS computed_root_id
  FROM accounts
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive: children inherit root from parent
  SELECT a.id, a.parent_id, t.computed_root_id
  FROM accounts a
  INNER JOIN account_tree t ON a.parent_id = t.id
)
UPDATE accounts a
SET root_account_id = t.computed_root_id
FROM account_tree t
WHERE a.id = t.id AND a.root_account_id IS NULL;
