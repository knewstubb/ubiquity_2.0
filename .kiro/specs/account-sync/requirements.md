# Requirements: Account Sync

## 1. Problem Statement

UbiQuity supports multi-location businesses (spa groups, councils, charities) where each location operates as a separate account with its own contact database and column structure. When Head Office updates a customer's details, those changes do not automatically flow to branch accounts. Staff end up with stale data or must manually re-enter changes across accounts.

Account Sync solves this by watching for changes in one account and automatically pushing them to another account in near real-time, with no manual effort.

## 2. Outcome

- Contact and transaction data stays eventually consistent across accounts in the same tree without manual intervention.
- Administrators can configure directional sync rules with fine-grained control over which columns map, what happens when records are missing, and when sync triggers fire.
- Loop-free propagation is guaranteed via CallerType tagging.

## 3. Users

| User | Role |
|------|------|
| Global Administrator | Configures, activates, pauses, and deletes sync rules. The only role with access to the Account Sync page in v1. |
| Branch Staff (indirect) | Benefits from up-to-date data in their local account without performing any sync actions themselves. |

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Sync is eventually consistent; a 100K contact import should process within 1-2 minutes via batching. |
| NFR-2 | Failed writes retry automatically via SQS dead-letter queue. |
| NFR-3 | Sync writes are idempotent — re-processing the same change produces the same result. |
| NFR-4 | The system scales horizontally (ECS Fargate 0.5 vCPU, auto-scales 1-4 tasks based on lag). |
| NFR-5 | Every synced change creates an audit trail entry in the target contact's timeline. |

## 5. User Stories & Acceptance Criteria

### 5.1 Access Control

**US-5.1.1** As a global administrator, I want the Account Sync page to be available under Admin > Account Sync so that I can manage sync rules for my organisation.

#### Acceptance Criteria

- WHEN a user with the global administrator role navigates to Admin > Account Sync, THE SYSTEM SHALL display the Account Sync management page with a summary showing the total number of sync rules and how many are active.
- WHEN a user without the global administrator role attempts to access the Account Sync page, THE SYSTEM SHALL deny access and not render the page or its controls.

---

### 5.2 Contact Sync Rule Creation

**US-5.2.1** As a global administrator, I want to create a contact sync rule between two accounts so that contact data flows from a source account to a target account.

#### Acceptance Criteria

- WHEN the administrator clicks "New Contact Sync", THE SYSTEM SHALL open a creation modal with fields for source account, target account, match key, column mapping, on-missing behaviour, and trigger-on-mapped-only toggle.
- WHEN selecting a source account, THE SYSTEM SHALL present only accounts within the currently active account tree, excluding the already-selected target account.
- WHEN selecting a target account, THE SYSTEM SHALL present only accounts within the currently active account tree, excluding the already-selected source account.
- WHEN the administrator selects the same account for both source and target, THE SYSTEM SHALL display a validation error: "Source and target must be different accounts."
- WHEN the administrator has selected both source and target accounts, THE SYSTEM SHALL populate the match key column dropdowns with the contact columns available in each respective account's schema.
- WHEN the administrator has not completed all required fields (source account, target account, match key source column, match key target column), THE SYSTEM SHALL disable the save/create button.
- WHEN the administrator completes all required fields and clicks "Create Contact Sync", THE SYSTEM SHALL create the rule with status "paused" and display it in the rules list.

---

### 5.3 Match Key Configuration

**US-5.3.1** As a global administrator, I want to specify a match key (source column to target column) so that the system can identify the same person in both accounts.

#### Acceptance Criteria

- WHEN configuring a match key, THE SYSTEM SHALL require exactly one source column and one target column to be selected.
- WHEN displaying the match key section, THE SYSTEM SHALL show descriptive text explaining that the match key column must be unique in the target account.
- WHEN the source or target account has no schema columns available, THE SYSTEM SHALL disable the match key column dropdowns.

---

### 5.4 Column Mapping

**US-5.4.1** As a global administrator, I want to map source columns to target columns so that only specific fields are synced and field-name differences between accounts are handled.

#### Acceptance Criteria

- WHEN the administrator clicks "Add Column Mapping", THE SYSTEM SHALL add a new empty mapping row with source and target column dropdowns.
- WHEN a mapping row has both source and target columns selected, THE SYSTEM SHALL count it as a valid mapping and display the total mapped count in a badge.
- WHEN the administrator clicks the remove button on a mapping row, THE SYSTEM SHALL remove that mapping from the list.
- WHEN no source or target account is selected (and therefore no columns are available), THE SYSTEM SHALL disable the "Add Column Mapping" button.
- WHEN saving a rule, THE SYSTEM SHALL only persist mapping rows where both source and target columns have been selected (incomplete rows are discarded).

---

### 5.5 On-Missing Behaviour

**US-5.5.1** As a global administrator, I want to choose what happens when a synced contact does not exist in the target account so that I can control whether new contacts are created or updates are skipped.

#### Acceptance Criteria

- WHEN configuring the on-missing behaviour, THE SYSTEM SHALL offer exactly two options: "Create new" and "Skip".
- WHEN "Create new" is selected, THE SYSTEM SHALL create a new contact in the target account when a match-key lookup finds no existing record.
- WHEN "Skip" is selected, THE SYSTEM SHALL ignore the change event if no matching record exists in the target account.
- WHEN creating a new rule, THE SYSTEM SHALL default the on-missing behaviour to "Create new".

---

### 5.6 Trigger on Mapped Only

**US-5.6.1** As a global administrator, I want to optionally restrict sync triggers to only fire when mapped columns change so that irrelevant field updates do not cause unnecessary sync writes.

#### Acceptance Criteria

- WHEN the "Only trigger when mapped columns change" toggle is off (default), THE SYSTEM SHALL trigger a sync for any change to the source contact, regardless of which column changed.
- WHEN the toggle is on, THE SYSTEM SHALL only trigger a sync when one or more of the mapped columns has changed in the source contact.
- WHEN creating a new rule, THE SYSTEM SHALL default the trigger-on-mapped-only toggle to off.

---

### 5.7 Contact Sync Rule Status Management

**US-5.7.1** As a global administrator, I want to activate and pause contact sync rules so that I can control when data propagation is running.

#### Acceptance Criteria

- WHEN the administrator toggles a paused contact sync rule to active, THE SYSTEM SHALL set its status to "active" and begin processing change events for that rule.
- WHEN the administrator toggles an active contact sync rule to paused, THE SYSTEM SHALL set its status to "paused", stop processing change events, and cascade the pause to all child transaction sync rules.
- WHEN a contact sync rule is paused via cascade, THE SYSTEM SHALL set each child transaction rule's status to "paused".
- WHEN a contact sync rule is resumed (paused → active), THE SYSTEM SHALL NOT automatically resume any child transaction sync rules; each must be manually reactivated.

---

### 5.8 Contact Sync Rule Editing

**US-5.8.1** As a global administrator, I want to edit an existing contact sync rule so that I can update mappings, match key, or behaviour settings after creation.

#### Acceptance Criteria

- WHEN the administrator clicks the edit action on a contact sync rule, THE SYSTEM SHALL open the edit modal pre-populated with the rule's current configuration.
- WHEN the administrator saves changes, THE SYSTEM SHALL update the rule's configuration and set the `updatedAt` timestamp.
- WHEN editing, THE SYSTEM SHALL preserve the rule's existing status (active or paused).

---

### 5.9 Contact Sync Rule Deletion

**US-5.9.1** As a global administrator, I want to delete a contact sync rule so that data propagation stops and the configuration is removed.

#### Acceptance Criteria

- WHEN the administrator clicks the delete action on a contact sync rule, THE SYSTEM SHALL display a confirmation dialog warning that deletion is permanent and will stop data propagation.
- WHEN the contact rule has child transaction sync rules, THE SYSTEM SHALL warn in the confirmation dialog that all associated transaction sync rules will also be deleted.
- WHEN the administrator confirms deletion of a contact rule, THE SYSTEM SHALL remove the contact rule and all its child transaction sync rules.
- WHEN the administrator cancels deletion, THE SYSTEM SHALL close the dialog and leave the rule unchanged.

---

### 5.10 Transaction Sync Rule Creation

**US-5.10.1** As a global administrator, I want to create a transaction sync rule nested under an existing contact sync rule so that transactional data (bookings, purchases) is synced alongside contacts.

#### Acceptance Criteria

- WHEN the administrator clicks "Add Transaction Sync" within a contact rule card, THE SYSTEM SHALL open a creation modal with the source and target accounts locked (inherited from the parent contact rule) and clearly labelled as "Inherited from contact sync".
- WHEN creating a transaction sync rule, THE SYSTEM SHALL require the administrator to select a source transactional list and a target transactional list.
- WHEN the source and target lists are selected, THE SYSTEM SHALL populate the match key and column mapping dropdowns with columns from those lists (not the contact columns).
- WHEN the parent contact sync rule is paused, THE SYSTEM SHALL disable the "Add Transaction Sync" button with a tooltip: "Resume the contact sync before adding transaction syncs".
- WHEN saving a transaction sync rule, THE SYSTEM SHALL store the parent contact rule's ID as the `parentRuleId`.
- WHEN saving a transaction sync rule, THE SYSTEM SHALL create it with status "paused".

---

### 5.11 Transaction Sync Rule Status Management

**US-5.11.1** As a global administrator, I want to activate and pause transaction sync rules independently so that I have granular control over transactional data flow.

#### Acceptance Criteria

- WHEN the administrator attempts to resume a transaction sync rule whose parent contact rule is paused, THE SYSTEM SHALL prevent the resume and leave the rule paused.
- WHEN the administrator toggles a paused transaction sync rule to active (and the parent is active), THE SYSTEM SHALL set its status to "active".
- WHEN the administrator toggles an active transaction sync rule to paused, THE SYSTEM SHALL set its status to "paused".

---

### 5.12 Transaction Sync Rule Editing and Deletion

**US-5.12.1** As a global administrator, I want to edit or delete a transaction sync rule independently of its parent.

#### Acceptance Criteria

- WHEN the administrator edits a transaction sync rule, THE SYSTEM SHALL open the edit modal with source/target accounts locked and pre-populated from the parent rule.
- WHEN the administrator deletes a transaction sync rule, THE SYSTEM SHALL display a confirmation dialog and, upon confirmation, remove only that transaction rule (not the parent or siblings).

---

### 5.13 Loop Prevention

**US-5.13.1** As a system, loop-free propagation must be guaranteed so that bidirectional sync rules do not cause infinite update cycles.

#### Acceptance Criteria

- WHEN the sync worker writes data to a target account, THE SYSTEM SHALL tag the write with `CallerType = AccountSync`.
- WHEN the sync worker encounters a change event tagged with `CallerType = AccountSync`, THE SYSTEM SHALL skip that event and not propagate it further.
- WHEN an administrator configures bidirectional sync (A→B and B→A), THE SYSTEM SHALL ensure that a change originating from a user in Account A syncs once to Account B and does not bounce back.

---

### 5.14 Rules Display and Hierarchy

**US-5.14.1** As a global administrator, I want sync rules displayed with transaction rules visually nested under their parent contact rules so that the hierarchy is clear.

#### Acceptance Criteria

- WHEN displaying rules, THE SYSTEM SHALL show contact rules as top-level cards, each within a bordered container.
- WHEN a contact rule has child transaction rules, THE SYSTEM SHALL display them indented beneath the contact rule with a left border indicating nesting.
- WHEN no sync rules exist, THE SYSTEM SHALL display an empty state with explanatory text and a button to create the first contact sync rule.
- WHEN displaying the page header, THE SYSTEM SHALL show the total rule count and the number of active rules.

---

### 5.15 Excluded Caller Types

**US-5.15.1** As a global administrator, I want to optionally exclude specific caller types from triggering sync so that bulk imports or automated processes do not flood the target account.

#### Acceptance Criteria

- WHEN a change event's CallerType matches an entry in the rule's excluded caller types list, THE SYSTEM SHALL skip that event.
- WHEN the excluded caller types list is empty, THE SYSTEM SHALL process all non-AccountSync change events.

---

### 5.16 Audit Trail

**US-5.16.1** As branch staff viewing a contact's history, I want to see sync-originated changes clearly attributed so that I know where and when the data came from.

#### Acceptance Criteria

- WHEN a sync write completes in the target account, THE SYSTEM SHALL create a history entry on the target contact showing the source account name, action type (Inserted or Updated), and timestamp.

---

### 5.17 Tree Constraint Enforcement

**US-5.17.1** As a system, sync rules must only operate within account trees so that data does not cross organisational boundaries.

#### Acceptance Criteria

- WHEN creating or editing a sync rule, THE SYSTEM SHALL only present accounts that belong to the currently active account tree as selectable options.
- WHEN displaying sync rules, THE SYSTEM SHALL filter the visible rules to only those involving accounts in the active tree.

---

### 5.18 Transaction Sync Prerequisite

**US-5.18.1** As a system, transaction sync rules must depend on an existing contact sync rule so that transactions can be linked to contacts in the target account.

#### Acceptance Criteria

- WHEN an administrator attempts to create a transaction sync rule, THE SYSTEM SHALL require it to be created within the context of an existing contact sync rule (via the "Add Transaction Sync" button on a contact rule card).
- WHEN no contact sync rules exist, THE SYSTEM SHALL not provide any mechanism to create a standalone transaction sync rule.

## 6. In Scope

- One-directional contact sync rules between accounts in the same tree.
- One-directional transaction sync rules nested under contact sync rules.
- Match key configuration (source column → target column).
- N:N column mapping with add/remove capability.
- On-missing behaviour: create or skip.
- Trigger-on-mapped-only toggle.
- Excluded caller types (configurable per rule).
- Status management: active / paused with cascade semantics.
- Loop prevention via CallerType tagging.
- Confirmation dialogs for destructive actions (delete).
- Audit trail entries for synced writes.
- Empty state for zero-rule configuration.
- Rule visibility scoped to the active account tree.

## 7. Out of Scope

| Item | Reason |
|------|--------|
| Delete propagation | Complexity of cascading deletes across accounts; deferred to assess demand. |
| Contact filtering (sync subset only) | v1 syncs all contacts matching the rule; filtering adds significant UX and engine complexity. |
| Historical backfill | Sync only processes forward-looking changes; seeding existing data requires CSV import. |
| Cross-tenant sync | Rules are constrained to accounts within the same tree; cross-org sync raises data governance concerns. |
| Self-service by non-global-admin users | v1 restricts configuration to global administrators to limit risk during rollout. |
| Conflict resolution | If the same contact is updated in both source and target simultaneously, last-write-wins applies (no merge logic). |
| Real-time sync guarantees | The system is eventually consistent, not strongly consistent. |

## 8. Open Questions

| # | Question | Impact |
|---|----------|--------|
| 1 | Should there be a limit on the number of sync rules per account tree? | Could affect system load and UX complexity. |
| 2 | Should the excluded caller types be configurable via the UI or only via API/config? | The prototype includes the field in the data model but no UI input for it in the modal. |
| 3 | When a match key lookup returns multiple matches in the target (non-unique), what is the expected behaviour? | Could result in data corruption if not handled — needs a decision on fail-safe behaviour. |
| 4 | Should pausing a contact rule immediately halt in-flight transaction syncs, or allow queued items to drain? | Affects consistency guarantees during pause transitions. |
| 5 | Is there a maximum number of column mappings per rule? | UX and performance consideration for very wide schemas. |
| 6 | Should editing a rule's match key on an active rule trigger a re-evaluation of existing reference mappings? | Could cause duplicate contacts if the key changes while active. |
