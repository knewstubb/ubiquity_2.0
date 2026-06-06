# Billing Reports

Billing reports show you exactly what you're being charged for across all your accounts. Every email sent, every contact stored, every SMS — it's all itemised in one place so there are no surprises on your invoice.

## How billing works in UbiQuity

UbiQuity charges based on usage. You pay for what you actually use each billing cycle — there are no fixed tiers or packages to worry about.

Every action that consumes platform resources is tracked as a billable item. These items are grouped into categories (like "Mailouts" or "Database Records"), each with a fixed per-unit price. At the end of the cycle, your total is simply the sum of all items multiplied by their unit prices.

### What gets billed

| Category | What it means |
|----------|---------------|
| Database Records | Each contact stored in your databases |
| Transactional Records | Data records synced via connectors |
| Mailouts | Recipients of promotional email sends |
| Automated Mailouts | Recipients of automated/recurring email sends |
| Form Triggered Emails | Emails sent when someone submits a form |
| Event Triggered Emails | Emails triggered by behavioural events (e.g. birthday, abandoned cart) |
| TXT Message Parts | SMS message parts sent |
| Survey Responses | Responses collected from surveys |
| Connector | Active connectors (flat fee per connector per cycle) |

### Billing cycles

Billing runs on a fixed monthly cycle from the **26th to the 25th**. For example, the May cycle runs from 26 April to 25 May.

- Storage-based items (Database Records, Connectors) are counted once per cycle — you're charged for what's active during that period.
- Usage-based items (emails, SMS, surveys) are counted each time they occur within the cycle.

### Multi-account billing

If your organisation has multiple accounts (parent accounts with child accounts beneath them), billing rolls up through the hierarchy. The report shows each account's usage individually, but you can also see the totals rolled up to any parent level.

## Where to find Billing Reports

Billing lives under the **Admin** section. Click **Admin** in the top navigation, then select **Billing** from the dropdown menu.

## What's next

- [Understanding your bill](./understanding-your-bill.md) — what each category means and how costs are calculated
- [Using the report](./using-the-report.md) — filtering, sorting, exporting, and reading the data
