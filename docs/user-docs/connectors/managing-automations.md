# Managing Automations

Once your importers and exporters are running, here's how to monitor them and make changes.

---

## Viewing your automations

Go to **Audience > Integrations**. You'll see your connections listed as collapsible rows. Click a connection to expand it and see all the automations running on it.

Each automation card shows:

- **Direction** — an arrow icon showing whether it's an importer (↓) or exporter (↑).
- **Name** — the name you gave the automation.
- **Data type** — what kind of data it handles (Contacts, Transactional, or both).
- **Last run status** — a badge showing whether the most recent run completed or failed.
- **Last run time** — when it last ran.
- **Active/Paused toggle** — the current state of the automation.

---

## Viewing automation settings

To see the full configuration of an automation without editing it:

1. Click anywhere on the automation card.

A settings panel opens showing a read-only summary:
- File settings (paths, patterns, data type)
- Configuration (update type, matching fields)
- Field mappings
- Schedule details
- Notification settings
- When it was created and last updated

Click **Close** to dismiss, or **Edit Automation** to open the full wizard in edit mode.

You can also access this via the three-dot menu (⋯) → **Automation Settings**.

---

## Pausing and resuming

### To pause an automation

Click the toggle switch on the automation card. The automation pauses immediately — no confirmation needed.

A paused automation:
- Won't run on its next scheduled time.
- Appears dimmed on the page.
- Keeps all its configuration intact.

### To resume an automation

Click the toggle switch again. You'll see a confirmation dialog because resuming an automation resumes billing.

Type **ACCEPT** in the confirmation field and click confirm. The automation returns to active status and will run at its next scheduled time.

---

## Viewing the Activity Log

The activity log shows a chronological record of runs — what happened each time the automation executed.

1. Click the three-dot menu (⋯) on the automation card.
2. Select **Activity Log**.

Each entry shows:
- **Who triggered it** — "System" for scheduled runs, or a person's name for manual triggers.
- **What happened** — e.g. "Scheduled import completed — 1,247 records processed" or "Scheduled import failed — connection timeout after 30s".
- **When** — date and time.

Entries are colour-coded:
- Green — successful run
- Red — failed run
- Blue — manual trigger
- Grey — skipped (e.g. no file found)

---

## Viewing Change History

The change history shows who made changes to the automation's configuration over time.

1. Click the three-dot menu (⋯) on the automation card.
2. Select **Automation History**.

You'll see a timeline of events:
- When the automation was created (and by whom)
- When it was activated or deactivated
- When settings were edited

---

## Editing an existing automation

1. Click the three-dot menu (⋯) on the automation card.
2. Select **Edit Automation**.

This opens the full wizard (importer or exporter) with your current settings pre-filled. Make your changes across any step, then:

- Click **Save Changes** to apply your edits.
- Click **Done** if you opened the wizard but didn't change anything.
- Click **Cancel** or press Escape to discard changes (you'll be asked to confirm if you've made edits).

> **Note for importers:** If you want to remap fields, you'll need to upload a new sample CSV file on the File Settings step. Your existing mappings are preserved until you do.

---

## Deleting an automation

1. Click the three-dot menu (⋯) on the automation card.
2. Select **Delete Automation**.
3. Type **DELETE** in the confirmation field.
4. Click confirm.

Deletion is permanent. The automation's configuration and history are removed. Any files already processed remain on your server — deletion only stops future runs.

---

## Deleting a connection

You can only delete a connection once all its automations have been removed.

1. Remove all automations from the connection first (see above).
2. Click the three-dot menu (⋯) on the connection row.
3. Select **Delete Connection**.
4. Type **DELETE** in the confirmation field.
5. Click confirm.

If the connection still has automations, the delete option will be greyed out with a message explaining why.

---

## Quick reference

| Task | How |
|------|-----|
| See all automations | Expand a connection row |
| View full settings | Click the automation card |
| Pause | Toggle the switch off |
| Resume | Toggle the switch on → type ACCEPT |
| View run history | Three-dot menu → Activity Log |
| View change history | Three-dot menu → Automation History |
| Edit settings | Three-dot menu → Edit Automation |
| Delete automation | Three-dot menu → Delete Automation → type DELETE |
| Delete connection | Three-dot menu → Delete Connection (no automations) → type DELETE |
