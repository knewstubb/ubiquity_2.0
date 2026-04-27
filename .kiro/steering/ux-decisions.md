---
inclusion: manual
---

# UX/UI Decision Log

This document tracks key UX/UI decisions made during prototyping. Use it to feed decisions back into the Figma design library and as a reference for developers.

Update this file whenever a significant design decision is made or changed.

## Card Selectors (Connection Type, Automation Type)

- **Unselected**: grey-50 fill, grey-200 border, subtle shadow (0 1px 3px rgba(0,0,0,0.08))
- **Hover**: teal border (primary-300), stronger shadow, teal text
- **Selected**: teal border (primary-500), white background, teal checkmark badge positioned at top-right corner (offset -7px from edge)
- **Disabled**: 50% opacity, pointer-events none, "Coming soon" label below

## Segmented Buttons (Data Type, Path Mode, Frequency)

- Active state: teal TEXT (primary-500), white background, teal bottom border (2px)
- Inactive state: grey-100 background, muted text
- Text is uppercase, 13px, medium weight
- Full-width within their container

## Wizard Modals (Importer, Exporter)

- Size: 60vw × 80vh
- Left sidebar: 239px, grey background (rgb 245,245,245), contains icon + connection name + stepper
- Right content: scrollable body with 40px horizontal padding
- Scrollbar: 8px visible thumb, grey-300, 4px inset from edge, 8px border-radius
- Close button: top-right of content area
- Nav buttons: bottom bar with subtle top shadow
- Discard confirmation on Escape/close when dirty

## Wizard Step Layout

- Title: h3, teal (primary-500), font-lg, semibold
- Subtitle: font-sm, text-muted, -20px top margin (tight to title)
- Row layout: 160px label column (left) + 552px input column (right), 56px gap
- Label: font-sm, semibold, text-primary
- Hint: font-xs, text-muted, 4px below label

## Stepper (Wizard Sidebar)

- Rounded square badges (not circles)
- Completed: teal fill with white checkmark
- Current: teal fill with step number
- Future: grey outline
- Dashed connector lines between steps
- Labels: font-xs, tight line-height

## Toggle Labels

- Toggle label text should be the same size as the toggle component text (font-sm)
- Label sits inline next to the toggle on a single line
- Use descriptive labels (e.g. "Successful Export") not generic "Enable"

## Data Type Naming

- Contacts / Transactional / Combined (not "Both")
- "Combined" chosen over "Both" for clarity with small business users

## File Configuration

- Destination folder: Auto/Shared/Custom path modes with base path prefix
- File types: CSV and XLSX only (small business scope)
- Output preview: shows resolved file path + name below file type selector, updates dynamically
- Advanced options (delimiter, header row, date format, timezone, file naming) hidden behind toggle
- "Folders that will be created" preview box removed — replaced by output preview

## Notifications

- Failure notification is always required (no toggle, just email input)
- Success and No File notifications are optional (toggle to enable)
- "Copy from above" link to duplicate failure emails
- No File has its own schedule configuration (frequency, starting, every, at)

## Review Step

- Same title styling as other steps (teal h3)
- No edit buttons — users navigate via stepper
- Sections match step names exactly
- Output path shown in monospace
- Schedule and notification details shown in full

## Navigation

- Top nav bar on every page (not yet implemented)
- Primary: Dashboard, Audiences, Automations, Content, Analytics, Settings, Help
- Sub-nav as secondary row
- Current page: teal highlight
- Integrations lives under Automations

## Automation Types

- Importer, Exporter, Sync (disabled/coming soon)
- Sync uses looping arrows icon
