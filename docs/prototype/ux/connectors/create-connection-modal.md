# Create Connection Modal

> **Type:** Modal (two-step)
> **Route/Trigger:** "+ New Connection" button on Connectors page, or "Edit Connection" from meatball menu
> **Parent:** [Connectors Page](./connectors-page.md)

## Purpose

Set up or edit a connection to an external data source (SFTP, AWS S3, or Azure Blob) that automations will use to move files in and out of UbiQuity.

## Flow

### Step 1: Select Connection Type (create only)

Uses the ChooserModal pattern — a card selector with three options:

| Option | Icon | Label |
|--------|------|-------|
| AWS S3 | Package | AWS S3 |
| Azure Blob | SquaresFour | Azure Blob |
| SFTP | FolderOpen | SFTP |

- Title: "Select Connection Type"
- Description: "Select the protocol your data source uses. This determines how UbiQuity connects to your files."
- "Next" button disabled until a type is selected
- In edit mode, this step is skipped entirely — type is locked after creation

### Step 2: Configure Connection

A Dialog (max-width 560px) with:
- Header: connection name (edit) or "Set Up {Type} Connection" (create) + close button
- Scrollable body (max-height 60vh) with type-specific fields
- Footer: Cancel (ghost) + Create/Update Connection (primary, disabled until test passes for new connections)

## Fields by Connection Type

### All types (General section)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Connection Name | Text input | Yes | Cannot be empty. No uniqueness constraint — system uses a unique ID. |
| Base Path | Text input | No | Root directory on the remote server where UbiQuity looks for files. All automation paths are relative to this. |
| Alert Email(s) | ChipInput (email) | Yes | Who to notify if this connection's credentials fail or the server becomes unreachable. Pre-filled with the current user's email. Supports multiple addresses. Uses team member autocomplete suggestions. |

### AWS S3 (Connection Settings section)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| AWS Region | Select dropdown | Yes | Options: us-east-1, us-west-2, eu-west-1, ap-southeast-2 |
| Bucket Name | Text input | Yes | |
| Prefix | Text input | No | Optional path prefix within the bucket |

### AWS S3 (Authentication section — grey background box)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Authentication Method | Select | Yes | "Access Key" or "IAM Role" |
| Access Key ID | Text input | Yes (if Access Key) | Shown when auth method = Access Key |
| Secret Access Key | Password input | Yes (if Access Key) | Shown when auth method = Access Key |
| AWS Account ID | Text input | Yes (if IAM Role) | Shown when auth method = IAM Role |
| IAM Role ARN | Text input | Yes (if IAM Role) | Shown when auth method = IAM Role |

### Azure Blob (Connection Settings section)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Container Name | Text input | Yes | |
| Account Name | Text input | Yes | |

### Azure Blob (Authentication section — grey background box)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| SAS Token | Text input | Yes | |

### SFTP (Connection Settings section)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Hostname | Text input | Yes | |
| Port | Text input | Yes | Defaults to 22 |

### SFTP (Authentication section — grey background box)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Username | Text input | Yes | |
| Public SSH Key | Textarea | No | |

## Test Connection

Located at the bottom of the Authentication section (inside the grey box), separated by a border-top.

- "Test Connection" button (outline, small)
- States:
  - **Idle:** Button enabled, helper text "Test your connection settings"
  - **Testing:** Button disabled, label changes to "Testing…"
  - **Success:** Green checkmark + "Connection verified" text, button hidden

### Test rules

- **Create mode:** Test is mandatory. Create button stays disabled until test passes.
- **Edit mode:** Test is optional if only non-connection fields changed (name, base path). If connection-affecting fields changed (credentials, host, bucket, etc.), the test must pass again before saving.

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Edit mode | Step 1 skipped, type locked, title shows connection name |
| Auth method = Access Key (AWS) | Shows Access Key ID + Secret Access Key fields |
| Auth method = IAM Role (AWS) | Shows AWS Account ID + IAM Role ARN fields |
| Connection fields unchanged (edit) | Test button disabled, "Connection verified" shown, Update button enabled |
| Connection fields changed (edit) | Test required again before Update enables |

## Validation

- All credential and connection field validation follows the existing connectors 0.2 system rules
- Connection Name: cannot be empty
- TBD: Error handling for failed connection tests (what message to show, how specific)

## States

- **Default (create):** Step 1 shown with no type selected
- **Default (edit):** Step 2 shown with fields pre-populated from existing connection
- **Test in progress:** Button shows "Testing…", disabled
- **Test passed:** Green "Connection verified" indicator
- **Test failed:** TBD — error display not yet decided

## Components Used

- ChooserModal (step 1 — card selector pattern)
- Dialog, DialogContent, DialogHeader, DialogFooter
- Input, Select, Textarea, Label
- ChipInput (alert email entry with team member autocomplete)
- Button (ghost cancel, primary create/update, outline test)
- CloseButton

## Edge Cases

- Type is locked after creation — user cannot change protocol on an existing connection
- In edit mode, if no connection-affecting fields changed, the previous test result carries over (no re-test needed)
- Base Path defaults to "/company/base-path/" if left empty

## Related

- [Connectors Page](./connectors-page.md) — parent page
- [ChooserModal](../_shared/chooser-modal.md) — reusable card selector pattern
