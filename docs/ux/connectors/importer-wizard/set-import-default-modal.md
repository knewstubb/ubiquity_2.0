# Set Import Default Modal

> **Type:** Modal (sub-dialog)
> **Route/Trigger:** "+ Set import default" button on the Mapping step
> **Parent:** [Mapping Step](./mapping.md)

## Purpose

Define a value to inject into a database column for every imported record — either a fixed value or a calculated next-send-date based on a schedule.

## Layout

Standard Dialog (max-width 560px) with:
- Header: "Set import default" + close button
- Body: progressive disclosure — field selection → mode selection → mode-specific inputs
- Footer: Cancel (ghost) + Create (primary, disabled until valid)

## Flow

1. **Select target column** — Combobox showing unmapped database fields (excludes already-mapped and already-defaulted fields, excludes boolean fields)
2. **Choose mode** — Two card options appear after field selection:
   - **Fixed value** (Tag icon) — apply the same value to every record
   - **Next send date/time** (CalendarBlank icon) — stamp each record with the next scheduled send date (only enabled for Date/DateTime fields)
3. **Configure** — mode-specific inputs appear below the cards

## Fields

### Target Column
- Combobox with available (unmapped, un-defaulted) fields
- Shows field type badge after selection (Text, Number, Date, DateTime)
- Boolean fields excluded from the list

### Fixed Value Mode
- Single text input
- Placeholder: "e.g. campaign-2024-q1"

### Next Send Date Mode (Date/DateTime fields only)
- **Send days** — DayPicker (Mon–Sun toggles)
- **Include time** — Switch toggle
- **Select hours** (when Include time on) — ChipInput with hour options (05:00–22:00)
- **Apply to active period** — Switch toggle
- **Avoid public holidays** — Switch toggle

## Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Select field | Combobox selection | Shows mode cards, enables/disables "Next send date" based on field type |
| Select Fixed value | Card click | Shows text input |
| Select Next send date | Card click (Date/DateTime only) | Shows schedule form |
| Create | Button click | Adds import default row to mapping table, closes modal, resets form |
| Cancel / Close | Button or X | Closes modal, resets form |

## States

- **Default:** No field selected, mode cards hidden, Create disabled
- **Field selected (non-date):** Both cards shown, "Next send date" disabled with "Requires a Date or DateTime column" text
- **Field selected (date/datetime):** Both cards enabled
- **Fixed value selected:** Text input shown, Create enabled when value non-empty
- **Send date selected:** Schedule form shown, Create enabled when at least one day selected

## Conditional Logic

| Condition | Effect |
|-----------|--------|
| No field selected | Mode cards hidden |
| Field type ≠ Date/DateTime | "Next send date" card disabled (greyed out, not clickable) |
| Mode = fixed, value empty | Create button disabled |
| Mode = send-date, no days selected | Create button disabled |
| Include time off | Hours input hidden |

## Validation

- Target field required
- Mode required
- Fixed value: non-empty string
- Send date: at least one day selected

## Components Used

- Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter
- Combobox (field selection)
- Button (card selectors, cancel, create)
- Input (fixed value)
- Switch, Label (include time, active period, avoid holidays)
- DayPicker (send days)
- ChipInput (hour selection)
- Badge (field type indicator)
- CloseButton

## Edge Cases

- Available fields list excludes fields already mapped in the main table AND fields already set as defaults
- Changing the target field resets the mode if switching from date to non-date field
- Modal form resets completely on close (whether via Cancel, X, or successful Create)
- Boolean fields are never shown in the field list (they can't receive a meaningful default)

## Related

- [Mapping Step](./mapping.md)
- [Importer Wizard Overview](./overview.md)
