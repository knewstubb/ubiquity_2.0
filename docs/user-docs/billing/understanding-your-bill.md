# Understanding Your Bill

This page explains what each line item on your billing report means, how costs are calculated, and how the billing cycle works.

---

## Billing categories explained

### Database Records

**What it is:** The number of contact records stored in your databases during the billing cycle.

**How it's counted:** UbiQuity counts the total contacts in your database for the cycle. This is a snapshot — you're charged for the contacts that exist, not for how many times they're accessed.

**Unit price:** $0.003 per record

**Example:** 4,280 contacts × $0.003 = $12.84

---

### Transactional Records

**What it is:** Data records synced into UbiQuity via connectors (e.g. purchase history, booking records, loyalty transactions).

**How it's counted:** Each record synced counts as one item. Counted by the date the record was created/synced.

**Unit price:** $0.002 per record

**Example:** 1,500 transaction records × $0.002 = $3.00

---

### Mailouts

**What it is:** Promotional emails sent to recipients — things like newsletters, product launches, and seasonal campaigns.

**How it's counted:** Each recipient of a send counts as one item. If you send the same campaign to 500 people, that's 500 items. Counted by the send date.

**Unit price:** $0.008 per recipient

**Example:** 800 recipients × $0.008 = $6.40

---

### Automated Mailouts

**What it is:** Recurring automated emails — welcome sequences, re-engagement flows, transactional journeys that run continuously.

**How it's counted:** Same as Mailouts — each recipient of each automated send is one item. Counted by send date.

**Unit price:** $0.008 per recipient

**Example:** 250 recipients of an automated welcome series × $0.008 = $2.00

---

### Form Triggered Emails

**What it is:** Confirmation or follow-up emails sent automatically when someone submits a form (contact form, booking form, signup form).

**How it's counted:** Each email triggered by a form submission is one item. Counted by send date.

**Unit price:** $0.008 per email

**Example:** 45 form submissions triggering emails × $0.008 = $0.36

---

### Event Triggered Emails

**What it is:** Emails triggered by behavioural events — birthday messages, abandoned cart reminders, anniversary rewards, membership renewal notices.

**How it's counted:** Each email triggered by an event is one item. Counted by send date.

**Unit price:** $0.008 per email

**Example:** 120 birthday emails × $0.008 = $0.96

---

### TXT Message Parts

**What it is:** SMS messages sent to contacts. A single SMS can be split into multiple "parts" if it exceeds 160 characters — each part is billed separately.

**How it's counted:** Each message part sent is one item. A 200-character SMS counts as 2 parts. Counted by send date.

**Unit price:** $0.065 per part

**Example:** 300 SMS parts × $0.065 = $19.50

---

### Survey Responses

**What it is:** Responses collected from surveys you've sent out (NPS surveys, feedback forms, satisfaction questionnaires).

**How it's counted:** Each completed survey response is one item. Counted by the date the response was recorded.

**Unit price:** $0.015 per response

**Example:** 85 survey responses × $0.015 = $1.28

---

### Connector

**What it is:** Active connectors — the integrations you've set up to move data in and out of UbiQuity (e.g. your AWS S3 connection with its automations).

**How it's counted:** Each active automation within a connector is billed as one unit per billing cycle. This is a flat fee, not usage-based.

**Unit price:** $250.00 per connector per cycle

**Example:** 3 active connector automations × $250.00 = $750.00

---

## How totals are calculated

Your total bill is the sum of all line items:

> **Total = Σ (items × unit price)** for each line item

The billing report shows this breakdown per line item, per account, and rolled up across your entire account hierarchy.

---

## Billing cycle timing

| Detail | Value |
|--------|-------|
| Cycle start | 26th of the month |
| Cycle end | 25th of the following month |
| Example | 26 April – 25 May |

- **Storage items** (Database Records, Connectors): Included if the billing cycle overlaps with the selected date range.
- **Send items** (Mailouts, Automated Mailouts, Form/Event Triggered Emails, TXT Messages): Included based on the date the message was actually sent.
- **Activity items** (Transactional Records, Survey Responses): Included based on the date the record was created.

---

## Multi-account billing

If your organisation uses a parent/child account structure:

- Each account's usage is tracked and billed individually.
- Parent accounts show a **rolled-up total** — their own usage plus all child and grandchild accounts beneath them.
- You can drill into any parent account to see exactly which child accounts are contributing to the total.

This means a franchise or multi-location business can see both the big picture and the per-location detail in a single report.
