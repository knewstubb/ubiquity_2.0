# Creating an Exporter

An exporter sends data from UbiQuity to your connected file storage as a CSV (or similar) file. Use an exporter when you need to get data out of UbiQuity on a regular schedule — for ad platforms, partner systems, or reporting tools that consume flat files.

## When to use an exporter

- You need to send a segment of contacts to an advertising platform daily.
- Your reporting tool needs a fresh data extract each week.
- A partner system requires a file drop of transactional data.
- You want to archive records to external storage on a schedule.

---

## Before you start

- You need an active connection. If you haven't created one yet, see [Creating a connection](./creating-a-connection.md).
- Know what data you want to export (contacts, transactions, or message delivery data).
- Know which fields you want to include and in what order.

---

## Starting the wizard

1. Go to **Audience > Integrations**.
2. Find the connection you want to use and expand it by clicking the row.
3. Click the **+ Add Automation** button.
4. Select **Exporter**, then click **Next**.

This opens the export wizard — a six-step process.

---

## Step 1: Source

This step defines what data to export. It builds progressively — each section appears after you complete the one above it.

### Choose your data source

Select one of three options:

- **Contacts** — export contact records from your database.
- **Transactions** — export transactional data (purchases, bookings, etc.).
- **Messages** — export message delivery data (email sends, opens, bounces).

### Select a sub-source (Transactions and Messages only)

**For Transactions:** Choose which transaction table to export from (e.g. Purchases, Bookings, Subscriptions, Returns).

**For Messages:** Select one or more channels (Email, SMS, Push).

### Filter records

Choose which records to include:

**For Contacts:**
- All contacts
- Created in the last N days
- In a specific list or segment
- Unsubscribed contacts only
- Contacts not sent a specific campaign

**For Transactions:**
- All records
- Created in the last N days
- Records matching a field filter

**For Messages:**
- All messages
- By delivery status (delivered, bounced, failed, opened)
- For a specific campaign
- Within a date range

After you select a filter, a match count appears showing how many records meet your criteria.

### Add context (optional)

Enrich your export by including columns from related data. For example, if you're exporting contacts, you can add transaction columns or message columns alongside the contact data.

Click **Next** when your source is configured.

---

## Step 2: Field Mapping

Choose which fields to include in your export file and what order they appear in.

### Selecting fields

- Use the checkboxes to select or deselect fields.
- Click the **Select All** checkbox at the top to include everything.
- Selected fields appear at the top of the list with a teal accent and a position number.

### Reordering fields

Drag the handle on any selected field to change its position. The column order in your exported file matches the order you set here.

### Renaming columns

Each selected field has a rename input. If your receiving system expects specific column names (different from UbiQuity's field names), type the new name here.

- A reset button appears if you've renamed a field — click it to revert to the original name.
- Column names must be unique. If you accidentally create a duplicate, you'll see an error.

Click **Next** when your fields are set.

---

## Step 3: File Configuration

Configure how the output file is structured and named.

### File Name

Enter a prefix for your exported files. UbiQuity automatically appends a timestamp and extension, so a prefix of `daily-contacts` produces files like `daily-contacts-20260509T143022.csv`.

Only letters, numbers, hyphens, and underscores are allowed.

### File Format

Choose the output format:

- **CSV** (comma-separated) — the most common choice.
- **TSV** (tab-separated) — useful if your data contains commas.
- **Pipe-delimited** — less common but required by some legacy systems.

### Timezone

Select the timezone for date and time values in your export. Defaults to Pacific/Auckland.

### Format Options (advanced)

Click to expand additional settings:

- **Delimiter** — comma, tab, pipe, or semicolon.
- **Include header row** — whether the first row contains column names (usually yes).
- **Date format** — ISO 8601, US format, EU format, or UNIX timestamp.

A **preview** at the bottom shows the generated filename so you can confirm it looks right.

Click **Next** when you're happy with the file settings.

---

## Step 4: Schedule

Choose when and how often this exporter runs.

### Frequency options

- **Hourly** — runs every hour. No additional configuration needed.
- **Daily** — runs once per day. No additional configuration needed.
- **Weekly** — select which day(s) of the week to run.
- **Monthly** — select which date(s) of the month to run (1st through 28th).

> **Note:** The exact execution time is assigned automatically by UbiQuity to avoid scheduling conflicts with other automations.

For weekly schedules, select at least one day. For monthly schedules, select at least one date.

Click **Next** when your schedule is set.

---

## Step 5: Notifications

Choose who gets notified about this exporter's runs. This works the same as importer notifications:

### Failure notifications (required)

Enter at least one email address. These people are notified immediately if an export fails.

### Success notifications (optional)

Turn this on to receive a confirmation email after each successful export. Click "copy from above" to reuse the failure email addresses.

### No-file alerts (optional)

Turn this on to be notified if no export file was produced when expected. Configure the check schedule and recipients.

Click **Next** when notifications are configured.

---

## Step 6: Review

A summary of your entire exporter configuration:

- **Data Source** — what you're exporting and any filters applied.
- **Fields** — the list of fields in export order, including any renames.
- **Output Configuration** — file name pattern, format, timezone.
- **Schedule** — how often and when.
- **Notifications** — who gets notified and when.

Each section has an **Edit** button. Click it to jump back to that step if anything needs changing.

When everything looks right, click **Create Exporter**.

Your new exporter appears on the Connectors page under its connection. It will produce its first file at the next scheduled time.

---

## Tips

- **Start simple.** Export all contacts with a basic daily schedule. You can always refine the filter and fields later.
- **Check your field order.** If the receiving system expects columns in a specific order, use drag-and-drop to match exactly.
- **Use meaningful file prefixes.** Something like `segment-gold-daily` is much clearer than `export1` when you're looking at files on your server months later.
- **Test with a small segment first.** Export a filtered subset to verify the file format works with your receiving system before switching to the full dataset.
- **The match count is your friend.** If it shows zero, your filter might be too restrictive. Adjust before creating the exporter.
