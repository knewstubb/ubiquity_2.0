# Notifications Step

> **Type:** Wizard Step (second-to-last step)
> **Parent:** [Importer Wizard](./overview.md)

## Purpose

Configure who gets notified about import results — failures, successes, and missing files.

## Layout

Same horizontal two-column layout: label column (160px) + input column (552px). Three notification groups stacked vertically with 32px gap.

## Fields

### Failure (required)
- ChipInput for email addresses
- At least one email required (validates the step)
- Autocomplete suggestions from team member emails
- Always visible, no toggle

### Success (optional)
- Toggle switch to enable/disable
- When enabled: ChipInput for email addresses with "copy from above" link
- "Copy from above" copies all failure emails into the success field

### No File (optional)
- Toggle switch to enable/disable
- When enabled, shows scheduling UI:
  - **Frequency** (SegmentedControl): Hourly / Daily / Weekly / Monthly
  - **Starting** date input
  - **On** (weekly only): DayPicker component for selecting days of week
  - **Pattern** (monthly only): Day/Date toggle with ordinal+day or date chip selection
  - **Every** + **At**: interval select + time input
  - **Email Address**: ChipInput with "copy from above" link
- HelpPopover explains no-file alerts

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Add failure email | Type + Enter or select from suggestions | Adds chip, validates step |
| Remove failure email | X on chip | Removes chip, may invalidate step |
| Toggle success | Switch | Shows/hides success email input |
| Copy from above (success) | Link click | Copies failure emails to success field |
| Toggle no-file | Switch | Shows/hides scheduling UI |
| Change frequency | SegmentedControl | Shows/hides frequency-specific fields (days, pattern) |
| Copy from above (no-file) | Link click | Copies failure emails to no-file field |

## States

- **Default:** Failure empty (step invalid), success disabled, no-file disabled
- **Valid:** At least one failure email entered
- **Success enabled:** Shows email input with copy link
- **No-file enabled:** Shows full scheduling form

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| Failure emails empty | Next button disabled (step invalid) |
| Success toggle off | Success email input hidden |
| No-file toggle off | Entire scheduling UI hidden |
| Frequency = Weekly | "On" day picker shown |
| Frequency = Monthly | "Pattern" toggle + "On the" selector shown |
| Monthly pattern = Day | Ordinal + day-of-week selects shown |
| Monthly pattern = Date | Date chip selector shown |

## Components Used

- ChipInput (email entry with autocomplete)
- SegmentedControl (frequency selection)
- Switch, Label
- DayPicker (weekly day selection)
- Select (interval, ordinal, day-of-week)
- Input (starting date, time)
- HelpPopover

## Edge Cases

- "Copy from above" replaces existing emails (not appends)
- Scheduling state is preserved when toggling no-file off and back on
- The scheduling UI is complete for prototype purposes — date values may be hardcoded placeholders
- Email validation: accepts any valid email format, no domain restriction

## Related

- [Importer Wizard Overview](./overview.md)
- [Mapping Step](./mapping.md)
- [Review Step](./review.md)
