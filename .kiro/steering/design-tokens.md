---
inclusion: manual
---

# Design Tokens

The Figma design system exports light and dark mode tokens as JSON files. These are the source of truth for colours, spacing, and typography values.

## Token Files

- Light mode: #[[file:src/styles/Light Mode.tokens.json]]
- Dark mode: #[[file:src/styles/Dark Mode.tokens.json]]

## Usage

When building or updating components, reference these token files to ensure colours and values match the Figma design system exactly. The prototype currently uses CSS custom properties defined in `src/styles/tokens.css` — these should be kept in sync with the token JSON files.

## Updating Tokens

1. Export updated variables from Figma (both Light Mode and Dark Mode)
2. Replace the JSON files in `src/styles/`
3. Update `src/styles/globals.css` directly with the new token values
4. Note any changes in the UX decisions log (`#ux-decisions`)

All design tokens are defined directly in `src/styles/globals.css` as CSS custom properties in `:root` and `[data-theme="dark"]` selectors, exposed to Tailwind via the `@theme inline` block.
 