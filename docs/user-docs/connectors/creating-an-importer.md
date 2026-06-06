# Creating an Importer

An importer brings data into UbiQuity from files on your connected storage. Use an importer when you have an external system (CRM, POS, booking engine) that regularly produces CSV files you want to load into your contact or transactional database.

## When to use an importer

- Your CRM exports a daily file of new or updated contacts.
- Your point-of-sale system drops transaction files overnight.
- You receive a regular file from a partner with new customer records.
- You need to keep UbiQuity in sync with an external system automatically.

---

## Before you start

- You need an active connection. If you haven't created one yet, see [Creating a connection](./creating-a-connection.md).
- You need a sample CSV file — a real file (or a representative sample) with headers that match what you'll be importing regularly.
- Know which database you're importing into (Contacts, or a Transactional table like Treatments or Products).

---

## Starting the wizard

1. Go to **Audience > Integrations**.
2. Find the connection you want to use and expand it by clicking the row.
3. Click the **+ Add Automation** button.
4. Select **Importer**, then click **Next**.

This opens the import wizard. You'll work through several steps using the sidebar on the left to track your progress.

---

## Step 1: File Settings

This step tells UbiQuity where to find your files and what kind of data they contain.

### Importer Name

Give your importer a clear name. This appears on the Connectors page and in notifications.

**Example:** "Daily Contact Import" or "Weekly Transactions — Treatments"

### File Path

Choose how UbiQuity should organise files on your server. You have three options:

**Automatic** (recommended for most users)
- UbiQuity creates a dedicated folder (based on your importer name) with subfolders for processed and failed files.
- You just drop files into the main folder.
- A preview shows the exact folder structure that will be created.

**Shared**
- Uses your connection's base path directly.
- Good when multiple importers share a folder and you use file patterns to distinguish them.

**Custom**
- You specify exact paths for the read folder, error folder, and archive folder.
- Use this if you have a specific folder structure you need to follow.

### Sample CSV

Upload a sample of the file you'll be importing. UbiQuity reads the column headers and uses them for field mapping in a later step.

- Drag a file onto the drop area, or click to browse.
- Only CSV files are accepted (max 5 MB).
- If you need to change delimiter or encoding settings, click **Advanced options** below the upload area.

> **Tip:** This doesn't have to be your full production file — even a few rows is enough. UbiQuity just needs the headers.

### File Pattern (Shared and Custom modes only)

If you're using Shared or Custom path mode, enter a file pattern so UbiQuity knows which files to pick up. Use `*` as a wildcard.

**Examples:**
- `contacts-daily-*` — matches any file starting with "contacts-daily-"
- `*-export` — matches any file ending with "-export"

The `.csv` extension is added automatically — you don't need to type it.

### Importing To

Choose what kind of data this file contains:

- **Contacts** — people records (names, emails, phone numbers).
- **Transactional** — event or purchase records linked to contacts.
- **Combined** — a file that contains both contact information and transactional data.

If you choose Transactional or Combined, you'll also select which transactional table to import into (e.g. Treatments, Products).

Once you've completed this step, click **Next**.

---

## Step 2: Configuration

This step controls how UbiQuity handles records during import.

### Update Type

Choose what happens when imported records overlap with existing data:

- **Append / Update** (default) — add new records and update any existing records that match. This is the most common choice.
- **Append only** — add new records but leave existing records untouched.
- **Update only** — update existing records but don't add new ones.

### Blank Values

> This only appears when your update type includes updating existing records.

When a field in your file is blank, should UbiQuity:

- **Preserve existing data** (default) — ignore blank values, keep what's already there.
- **Import blank values** — overwrite existing data with blank (clearing the field).

### Matching Columns

UbiQuity needs to know how to identify which records in your file match records in the database. Select one or more fields to match on.

**Common choices:**
- Email + Customer ID (for contacts)
- Customer ID alone (for transactional records)

Type in the field to search, or click the dropdown to browse available options.

### Dedupe

Turn this on if your file might contain duplicate records. When enabled, choose which fields UbiQuity should use to identify duplicates within the file.

> **Note:** This only removes duplicates within the uploaded file — it doesn't check against your existing database.

Click **Next** when you're done.

---

## Step 3: Field Mapping

This step connects the columns in your file to the fields in UbiQuity's database.

### How auto-mapping works

When you first reach this step, UbiQuity automatically matches your file's column headers to database fields. It recognises common variations — for example, "email" or "Email Address" will both map to the email field.

### The mapping table

You'll see a table with three columns:

- **File Column** — the header from your CSV file.
- **UbiQuity Column** — the database field it maps to (dropdown to change).
- **Example Value** — a sample value from your file to help you verify the mapping is correct.

### Fixing mappings

- If a column shows a yellow warning icon, UbiQuity couldn't find an automatic match. Click the dropdown and choose the correct field manually.
- If a column shows a red warning icon, two file columns are mapped to the same database field. Change one of them to resolve the conflict.
- To skip a column entirely, choose **[[Ignore Column]]** from the dropdown. UbiQuity won't import data from that column.

### Import Defaults

If you need every imported record to receive a specific value for a field (even though it's not in your file), click **+ Set import default**.

**Examples:**
- Set a "Source" field to "CRM Import" for all records from this importer.
- Stamp a next-send-date based on a schedule.

### Lookup Mapping (Transactional imports only)

For transactional data, you need to tell UbiQuity how to link each transaction to a contact. This section lets you match columns in your file (like email or customer ID) to the corresponding contact field.

You need at least one lookup mapping before you can proceed.

Click **Next** when your mappings look correct.

---

## Step 4: Notifications

Choose who gets notified about this importer's runs.

### Failure notifications (required)

Enter at least one email address. These people will be notified immediately if an import fails.

### Success notifications (optional)

Turn this on if you want confirmation emails when imports complete successfully. Click "copy from above" to reuse the same addresses from the failure field.

### No-file alerts (optional)

Turn this on to be notified if UbiQuity checks your folder and no file is waiting. This helps you catch issues with upstream systems that should be producing files on a schedule.

When enabled, you configure:
- How often to check (hourly, daily, weekly, or monthly).
- What day(s) and time to check.
- Who to notify.

Click **Next** when you're done.

---

## Step 5: Review

The final step shows a summary of everything you've configured:

- File settings (path, pattern, data type)
- Configuration (update type, matching fields)
- Field mappings (source → target for each column)
- Notification settings

Review each section. If something looks wrong, click **Edit** next to that section to jump back to the relevant step.

When everything looks right, click **Create Importer**.

Your new importer appears on the Connectors page under its connection. It starts in an active state and will run on its next scheduled time.

---

## Tips for each step

| Step | Tip |
|------|-----|
| File Settings | Use Automatic path mode unless you have a specific reason not to — it's the simplest setup. |
| Configuration | Start with "Append / Update" unless you have a specific reason for the other options. |
| Mapping | Check the Example Value column carefully — it confirms you're mapping the right data to the right fields. |
| Notifications | Always add at least one real person to failure notifications — don't rely on a shared mailbox alone. |
| Review | Pay special attention to the matching columns — incorrect matching can cause duplicate records. |

---

## Common file patterns explained

| Pattern | What it matches |
|---------|-----------------|
| `contacts-*` | Any file starting with "contacts-" (e.g. contacts-20260501.csv) |
| `*-daily` | Any file ending with "-daily" (e.g. crm-daily.csv) |
| `report-2026*` | Any file starting with "report-2026" (e.g. report-20260415.csv) |

Only one wildcard (`*`) is allowed per pattern. You can't use `*contacts*` — instead, use a prefix or suffix that's consistent.
