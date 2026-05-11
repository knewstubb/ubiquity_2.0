---
inclusion: manual
---

# Shared Component Conventions

Rules for building shared UI components from Figma designs. Every component in `src/components/shared/` follows this pattern.

## Workflow: Figma to Shared Component

1. Pull the component data from Figma using the figma-to-code agent or MCP tools
2. **Check existing shared components first** — before creating anything new, read `src/components/shared/` to see if a component already exists that can be used or extended
3. Create the component at `src/components/shared/{ComponentName}.tsx`
4. Create the CSS Module at `src/components/shared/{ComponentName}.module.css`
5. Add a live example section to the Component Library page (`src/pages/ComponentLibraryPage.tsx`)
6. Replace any inline-styled instances across the app with the shared component

## Component Reuse Rule — CRITICAL

Before writing ANY new UI element, you MUST:

1. Read `src/components/shared/` to check if a matching component exists
2. If a shared component exists (Button, TextField, CardSelector, Toggle), USE IT — never create inline alternatives
3. If the existing component is close but missing a prop/variant, EXTEND IT rather than creating a new one
4. Only create a new shared component if nothing in the library covers the need

Available shared components:
- `Button` — all interactive buttons (solid, outline, destructive, ghost × large, regular, compact, xs)
- `TextField` — all text inputs with labels, validation, prefix/suffix, icons
- `CardSelector` — selectable cards with icon + label
- `Toggle` — on/off switch
- `ProtocolIcon` — connection type icons
- `ResetAccountButton` — account reset action

## File Structure

```
src/components/shared/
├── Button.tsx
├── Button.module.css
├── Toggle.tsx
├── Toggle.module.css
├── Input.tsx
├── Input.module.css
└── ...
```

## Component Anatomy

```tsx
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  // ... other props
}

export function ComponentName({ variant = 'primary', size = 'md', disabled = false, children }: ComponentNameProps) {
  const className = [
    styles.root,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
  ].filter(Boolean).join(' ');

  return (
    <element className={className} disabled={disabled}>
      {children}
    </element>
  );
}
```

## CSS Module Rules

- Use semantic tokens exclusively — never hardcoded hex values
- All colours must come from `--color-*` tokens (accent, text, background, border, state, danger, warning, info, neutral)
- Spacing uses `--space-*` tokens (xs=4, sm=8, md=16, lg=24, xl=32)
- Border radius uses `--radius-*` tokens (none=0, sm=4, md=8, lg=12, full=9999)
- Font sizes use `--font-size-*` tokens (xs=10, sm=12, base=14, lg=16, xl=18, 2xl=24)
- Font weights use `--font-weight-*` tokens (light=300, normal=400, medium=500, semibold=600, bold=700)
- Font family uses `--font-family-primary` or `--font-family-mono`
- Transitions use `--transition-fast` (150ms), `--transition-base` (200ms), `--transition-slow` (300ms)

## Interaction States (from Figma UDS)

Every interactive component must implement these states:

| State | Visual Treatment |
|---|---|
| Default | Base token colours |
| Hover | `opacity: 0.8` with `var(--transition-fast)` |
| Focus | `outline: 2px solid var(--color-border-focus); outline-offset: 2px` |
| Active/Pressed | `transform: scale(0.95)` with `100ms ease` |
| Disabled | `background: var(--color-state-disabled-bg); color: var(--color-state-disabled-text); cursor: not-allowed; opacity: 0.6; pointer-events: none` |

## Dark Mode

- Components get dark mode for free via semantic tokens
- Never use primitive palette tokens (--color-zinc-500) for component colours — always use semantic tokens (--color-text-secondary)
- The `[data-theme="dark"]` selector in tokens.css handles all overrides
- No additional dark mode logic needed in components

## Accessibility

- Use native HTML elements (`<button>`, `<input>`, `<select>`) — not divs with click handlers
- Set `disabled` attribute on the native element (not just visual styling)
- Support `aria-label` prop when visible label is insufficient
- Ensure keyboard focusability (Tab navigation)
- Disabled elements excluded from tab order automatically via native `disabled`
- Focus ring must be visible (use the focus state above)

## Component Library Integration

When adding a new shared component:

1. Add a sidebar entry to the `SECTIONS` array in `ComponentLibraryPage.tsx`
2. Add a `<section>` with the component's `id` matching the sidebar entry
3. Show all variants, sizes, and states as live interactive examples
4. Group examples with labels (variant name, state name)
5. Use the real shared component — never inline styles for examples

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `Button.tsx`, `CardSelector.tsx` |
| CSS Module | Same name | `Button.module.css` |
| CSS root class | `.root` | Always the base class |
| CSS variant classes | camelCase matching prop value | `.solid`, `.ghost`, `.small` |
| Props interface | `{ComponentName}Props` | `ButtonProps` |
| Export | Named export | `export function Button(...)` |

## Props Pattern

- `variant` — visual style (solid, ghost, outline, danger)
- `size` — dimensions (sm, md, lg)
- `disabled` — interaction state
- `children` — label content
- `leadingIcon` / `trailingIcon` — optional Phosphor icon elements
- `onClick` — event handler
- `className` — optional override for composition
- `type` — for buttons: "button" | "submit" | "reset" (default "button")
- Spread remaining props via `...rest` for flexibility

## What NOT to Do

- No inline styles
- No Tailwind
- No CSS-in-JS
- No hardcoded colours (hex, rgb, hsl)
- No `div` with `onClick` when a `button` would work
- No component-specific dark mode logic
- No importing from `@phosphor-icons/react` inside the CSS (icons are passed as props)
- No inline `<input>`, `<select>`, or `<textarea>` elements with custom CSS — always use the shared `TextField` component from `src/components/shared/TextField.tsx`
- No inline `<button>` elements with custom CSS — always use the shared `Button` component from `src/components/shared/Button.tsx`
