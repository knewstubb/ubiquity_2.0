# Troubleshooting

Common issues and how to fix them.

---

## "My file isn't being picked up"

The automation is running but not finding your file. Check these things:

### Is the file in the right folder?

- **Automatic mode:** Files must be in the folder shown in the preview when you set up the importer (e.g. `/base-path/daily-contact-import/`).
- **Shared/Custom mode:** Files must be in the exact read path you configured.

Open the automation settings (click the card) to confirm the expected path.

### Does the filename match the pattern?

If you're using Shared or Custom path mode, your file name must match the pattern you set.

- Pattern `contacts-*` matches `contacts-20260501.csv` but NOT `new-contacts.csv`.
- The pattern is case-sensitive.
- The `.csv` extension is expected — make sure your file has it.

### Is the file format correct?

- Files must be CSV format.
- The delimiter must match what you configured (comma by default).
- The file must have a header row matching your mapped columns.

### Is the connection healthy?

If the connection itself has a problem (expired credentials, server unreachable), you'll see the connection turn red on the Connectors page with a "Fix connection" button. Click it to update your credentials.

### Has the file already been processed?

Once UbiQuity processes a file, it moves it to the archive folder. If you re-upload the same file with the exact same name, check whether it was already picked up and archived.

---

## "I'm getting duplicate records"

Records are appearing more than once in your database.

### Check your matching columns

The most common cause is incorrect matching columns. UbiQuity uses these fields to decide if a record already exists:

- If you're matching on Email only, two records with the same email but different Customer IDs will merge.
- If you're matching on Customer ID only, records without a Customer ID will always create new entries.

**Fix:** Edit the automation and review the Matching Columns on the Configuration step. For contacts, matching on both Email and Customer ID is usually safest.

### Check for duplicates in your file

If the same person appears multiple times in a single file, turn on the **Dedupe** option in the Configuration step and select which fields to dedupe on.

### Check your update type

- **Append only** adds records without checking for matches — this will create duplicates if records already exist.
- Switch to **Append / Update** to check for existing records before adding new ones.

---

## "Fields aren't mapping correctly"

Data is landing in the wrong fields in UbiQuity.

### Column headers changed

If your source system changed its export format (renamed columns, added new ones, reordered them), your mappings may be out of date.

**Fix:**
1. Edit the automation.
2. On the File Settings step, upload a new sample CSV with the current headers.
3. On the Mapping step, review and fix the auto-generated mappings.

> **Warning:** Uploading a new CSV clears all existing mappings. You'll need to remap every field.

### Delimiter mismatch

If your file uses tabs or pipes instead of commas, the columns won't parse correctly. Check the advanced options on the File Settings step — make sure the delimiter matches your file.

### Encoding issues

If you see garbled characters (especially accented names or special symbols), the file encoding may not match. Check Advanced options on File Settings and try switching between UTF-8, ISO-8859-1, and Windows-1252.

---

## "I'm not receiving notification emails"

### Check the notification settings

1. Click the automation card to view settings.
2. Scroll to the Notifications section.
3. Confirm your email address is listed under Failure (and Success, if applicable).

### Check your spam folder

Notification emails may be filtered by your email provider. Check spam/junk and mark UbiQuity emails as safe.

### Is the notification type enabled?

- **Failure** notifications are always on (required).
- **Success** notifications are optional — make sure the toggle is turned on if you want them.
- **No-file** alerts are optional and have their own schedule — make sure the toggle is on and the schedule matches when you expect files.

---

## Connection errors

When a connection's credentials expire or the server becomes unreachable, the connection turns red on the Connectors page.

### What happens

- All automations on that connection continue to attempt their scheduled runs but will fail.
- You (and anyone in the alert email list) receive an email notification.
- A "Fix connection" button appears on the connection row.

### How to fix it

1. Click **Fix connection** (or three-dot menu → Edit Connection).
2. Update the expired credentials.
3. Test the connection.
4. Save.

Automations will resume normally on their next scheduled run.

---

## Supported file formats

| Format | Extension | Notes |
|--------|-----------|-------|
| CSV (comma-separated) | .csv | Default and most common |
| TSV (tab-separated) | .tsv | Configure via Advanced options |
| Pipe-delimited | .csv | Configure delimiter in Advanced options |

> **Note:** Only CSV-family formats are supported. Excel files (.xlsx), JSON, and XML are not supported. Convert to CSV before uploading.

---

## File size limits

- **Sample CSV upload:** Maximum 5 MB. This is just for defining your field mappings — it doesn't need to be your full production file.
- **Production files (for automated import):** Check with your account manager for current limits, as these depend on your plan.

---

## Still stuck?

If none of the above resolves your issue:

1. Check the **Activity Log** (three-dot menu on the automation) for specific error messages.
2. Verify your connection is healthy by editing it and running a connection test.
3. Contact your UbiQuity account manager with the automation name and the date/time of the failed run.
