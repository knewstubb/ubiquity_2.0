# Error States

> **Last updated:** 2026-05-21

## Error Types

| Type | Pattern | Example |
|------|---------|---------|
| Field validation | Inline below the field | "Email address is required" |
| Form submission | Banner at top of form | "2 fields need attention" |
| Action failure | Toast notification | "Failed to save. Try again." |
| Connection/system error | Inline status indicator | Red icon + "Fix connection" button |
| Page-level error | Full content area replacement | "Something went wrong" + retry |

## Field Validation

- Error text appears below the input, 4px gap
- Text: Body XS (12px), `text-destructive`
- Input border changes to `border-destructive`
- Error appears on blur (not on every keystroke) or on form submission
- Error clears when the user starts typing in the field again

## Form Submission Errors

- Banner appears at the top of the scrollable form area
- Background: `bg-destructive-subtle`, border: `border-destructive-border`
- Icon: WarningCircle (16px, `text-destructive`)
- Text: summary of what's wrong ("Connection name is required")
- Scrolls to the first errored field

## Toast Notifications

- Used for action failures that don't relate to a specific field
- Position: top-right, below nav bar
- Auto-dismiss: 5 seconds (errors stay longer than success toasts)
- Include a "Retry" or "Dismiss" action when applicable
- TBD: Toast component styling and animation details

## Connection/System Errors

- Inline within the relevant UI element (not a separate page)
- Red icon replaces the normal state icon
- Text turns `text-destructive`
- Action button appears: "Fix connection", "Retry", etc.
- Affected child elements show reduced styling (red hover border instead of teal)

## Page-Level Errors

- Replace the entire content area (not the nav/shell)
- Centred layout, same structure as empty states:
  - Icon: WarningCircle (48px, Light, `text-destructive`)
  - Headline: "Something went wrong"
  - Supporting text: brief explanation
  - CTA: "Try Again" or "Go Back"

## Design Decisions

1. **Errors are inline, not modal** — never show an error in a dialog/modal unless the user is already in a modal. Errors appear in context.

2. **Red is only for errors** — `text-destructive` and `border-destructive` are exclusively for error states. Never use red for non-error emphasis.

3. **Validate on blur, not on type** — showing errors while the user is still typing is hostile. Wait until they leave the field.

4. **Clear errors on re-engagement** — once the user starts fixing the field, remove the error immediately. Don't wait for them to blur again.

5. **TBD: Error specificity for connection tests** — generic "Connection failed" vs specific server error messages not yet decided (tracked in Design Decisions DB).
