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

1. Export updated tokens from Figma
2. Replace the JSON files in `src/styles/`
3. Update CSS custom properties if any values changed
4. Note any changes in the UX decisions log (`#ux-decisions`)
