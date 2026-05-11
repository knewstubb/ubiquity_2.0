# Requirements Document

## Introduction

Migrate all CSS Module components from hardcoded hex values and primitive palette variables to semantic design tokens so that the existing dark mode toggle produces a correct dark theme across the entire prototype. Additionally, replace the current text-based dark mode menu item with a toggle switch for better UX.

## Glossary

- **Semantic_Token**: A CSS custom property that maps to a role (e.g. `--color-background-default`) rather than a specific colour value. Semantic tokens are redefined under `[data-theme="dark"]` in `tokens.css` to produce dark mode.
- **Primitive_Variable**: A CSS custom property that maps directly to a fixed colour value (e.g. `--color-zinc-200: #E4E4E7`). These do NOT change between themes.
- **CSS_Module**: A scoped `.module.css` file co-located with its React component.
- **Dark_Mode_Toggle**: The UI control in the avatar dropdown menu that switches between light and dark themes by setting `data-theme="dark"` on the document root.
- **Token_Migration**: The process of replacing hardcoded hex values and primitive variables with their corresponding semantic tokens.
- **AppNavBar**: The primary navigation bar component at `src/components/layout/AppNavBar.tsx`.

## Requirements

### Requirement 1: Migrate Hardcoded Hex Colours to Semantic Tokens

**User Story:** As a user, I want all UI components to respond to the dark mode toggle, so that I get a consistent dark theme across the entire application.

#### Acceptance Criteria

1. WHEN the Token_Migration is complete, THE CSS_Module files SHALL contain zero hardcoded hex colour values (e.g. `#fff`, `#FFFFFF`, `#14B88A`, `#e6f7f2`) in any colour-accepting CSS property, including `color`, `background-color`, `background`, `border-color`, `border`, `outline-color`, `box-shadow`, `fill`, and `stroke`
2. WHEN a hardcoded white hex value (`#fff` or `#FFFFFF`) is used as a background, THE CSS_Module SHALL use `var(--color-background-default)` or the contextually appropriate semantic background token (e.g. `--color-background-subtle` for surface areas, `--color-background-elevated` for raised containers)
3. WHEN a hardcoded brand teal hex value is used, THE CSS_Module SHALL replace it with the semantic accent token matching its role: `#14B88A` maps to `var(--color-accent-default)`, `#E6F9F5` or `#e6f7f2` maps to `var(--color-accent-subtle)`, `#10A078` maps to `var(--color-accent-hover)`, and `#0D8866` maps to `var(--color-accent-text)`
4. IF a hardcoded hex value does not have a direct semantic token mapping, THEN THE developer SHALL select the closest semantic token based on the element's role (background, text, border, accent) from the available tokens defined in `tokens.css`
5. WHEN the Token_Migration is complete, THE CSS_Module files SHALL pass a case-insensitive regex scan for `#[0-9a-fA-F]{3,8}` within colour-accepting property declarations with zero matches

### Requirement 2: Migrate Primitive Palette Variables to Semantic Tokens

**User Story:** As a user, I want components using primitive palette variables to adapt to dark mode, so that switching themes produces correct contrast and readability.

#### Acceptance Criteria

1. WHEN the Token_Migration is complete, THE CSS_Module files SHALL contain zero references to primitive zinc palette variables (`--color-zinc-*`) in any colour-rendering CSS property (`color`, `background`, `background-color`, `border`, `border-color`, `border-top`, `border-bottom`, `border-left`, `border-right`, `outline`, `outline-color`, `box-shadow`, `accent-color`, `fill`, `stroke`)
2. WHEN the Token_Migration is complete, THE CSS_Module files SHALL contain zero references to primitive primary palette variables (`--color-primary-*`) in any colour-rendering CSS property
3. WHEN the Token_Migration is complete, THE CSS_Module files SHALL contain zero references to primitive grey palette variables (`--color-grey-*`) in any colour-rendering CSS property
4. WHEN `var(--color-zinc-50)` is used as a background, THE CSS_Module SHALL use `var(--color-background-default)`
5. WHEN `var(--color-zinc-100)` is used as a background, THE CSS_Module SHALL use `var(--color-background-subtle)`
6. WHEN `var(--color-zinc-200)` is used as a border colour, THE CSS_Module SHALL use `var(--color-border-default)`
7. WHEN `var(--color-zinc-300)` is used as a border colour, THE CSS_Module SHALL use `var(--color-border-strong)`
8. WHEN `var(--color-zinc-400)` is used as a text colour, THE CSS_Module SHALL use `var(--color-text-tertiary)`
9. WHEN `var(--color-zinc-500)` or `var(--color-zinc-600)` is used as a text colour, THE CSS_Module SHALL use `var(--color-text-secondary)`
10. WHEN `var(--color-zinc-800)`, `var(--color-zinc-900)`, or `var(--color-zinc-950)` is used as a text colour, THE CSS_Module SHALL use `var(--color-text-primary)`
11. WHEN `var(--color-primary-500)` is used, THE CSS_Module SHALL use `var(--color-accent-default)`
12. WHEN `var(--color-primary-50)` is used as a background, THE CSS_Module SHALL use `var(--color-accent-subtle)`
13. WHEN `var(--color-primary-700)` is used as a text colour, THE CSS_Module SHALL use `var(--color-accent-text)`
14. WHEN `var(--color-primary-600)` is used as a hover-state background, THE CSS_Module SHALL use `var(--color-accent-hover)`
15. IF a primitive palette variable is used in a context not explicitly covered by criteria 4–14, THEN THE developer SHALL select the closest semantic token based on the element's visual role (background → `--color-background-*`, text → `--color-text-*`, border → `--color-border-*`, accent → `--color-accent-*`)
16. WHEN `var(--color-zinc-200)` or `var(--color-zinc-300)` is used as a background for a visual divider or separator element, THE CSS_Module SHALL use `var(--color-border-default)` or `var(--color-border-strong)` respectively

### Requirement 3: Preserve Light Mode Visual Appearance

**User Story:** As a user, I want the application to look identical in light mode after the migration, so that the token swap does not introduce visual regressions.

#### Acceptance Criteria

1. WHEN the Token_Migration is complete, THE application SHALL produce the same computed CSS colour values in light mode for every migrated property, verified by confirming each semantic token in the `:root` scope resolves to the same hex value as the primitive or hardcoded value it replaces
2. WHEN `data-theme` is not set on the document root, THE application SHALL display using light mode semantic token values defined in the `:root` block of `tokens.css`
3. IF a semantic token resolves to a different light-mode hex value than the primitive it replaces (e.g. `--color-text-secondary` is `#71717A` but the replaced primitive `--color-zinc-600` is `#52525B`), THEN THE developer SHALL choose the semantic token whose `:root` value is the closest match to the original hex value, preferring an exact match when one exists
4. IF a hardcoded `#FFFFFF` value is replaced with a semantic background token that resolves to a different value (e.g. `--color-background-default` resolves to `#FAFAFA`), THEN THE developer SHALL use `--color-text-inverse` for text-on-accent contexts or retain `#FFFFFF` only where no semantic token provides an exact match, and document the deviation as a comment in the CSS_Module

### Requirement 4: Dark Mode Theme Switching

**User Story:** As a user, I want all migrated components to switch to dark colours when I activate dark mode, so that the entire interface is readable in low-light conditions.

#### Acceptance Criteria

1. WHEN `data-theme="dark"` is set on the document root, THE application SHALL display all components using the dark mode semantic token values defined in the `[data-theme="dark"]` block of `tokens.css`
2. WHILE `data-theme="dark"` is set on the document root, THE application SHALL maintain a minimum contrast ratio of 4.5:1 between text and its immediate background for all text rendered with semantic tokens
3. WHILE `data-theme="dark"` is set on the document root, THE application SHALL display accent colours using the dark-mode accent token values (e.g. `--color-accent-text` resolves to `#4DD4B6` instead of `#0D8866`)
4. WHILE `data-theme="dark"` is set on the document root, THE application SHALL apply dark mode semantic token values to all interactive states (hover, focus, active, disabled) without any element retaining light mode colours

### Requirement 5: Replace Dark Mode Text Item with Toggle Switch

**User Story:** As a user, I want a toggle switch for dark mode instead of a clickable text item, so that the current theme state is visually obvious at a glance.

#### Acceptance Criteria

1. THE Dark_Mode_Toggle SHALL render as a toggle switch component with a "Dark Mode" label in the avatar dropdown menu of the AppNavBar
2. WHILE dark mode is active, THE Dark_Mode_Toggle switch SHALL display in the "on" position
3. WHILE dark mode is inactive, THE Dark_Mode_Toggle switch SHALL display in the "off" position
4. WHEN the user clicks the Dark_Mode_Toggle, THE AppNavBar SHALL toggle the `data-theme` attribute on the document root between `"dark"` and unset, and the switch position SHALL update to reflect the new state
5. THE Dark_Mode_Toggle SHALL replace the existing clickable text item that reads "Light Mode" or "Dark Mode"
6. THE Dark_Mode_Toggle SHALL be styled consistently with the dropdown menu design (matching font size, padding, and alignment of other menu items)

### Requirement 6: Migration Scope Boundaries

**User Story:** As a developer, I want clear boundaries on what is in scope for this migration, so that I do not introduce unintended changes to the token system or global styles.

#### Acceptance Criteria

1. THE Token_Migration SHALL apply to all `.module.css` files within `src/components/` (excluding `src/components/ui/`) and `src/pages/`
2. THE Token_Migration SHALL NOT modify the structure or values in `src/styles/tokens.css`
3. THE Token_Migration SHALL NOT modify the structure or values in `src/styles/globals.css`
4. THE Token_Migration SHALL NOT modify files in `src/components/ui/` (shadcn components use Tailwind, not CSS Modules)
5. WHEN a CSS_Module uses a primitive variable for a non-colour property (e.g. spacing, font-size, font-weight, border-radius, transition), THE Token_Migration SHALL leave that reference unchanged
6. WHEN a CSS_Module uses a primitive colour variable within a shorthand property that includes non-colour values (e.g. `border`, `box-shadow`, `outline`), THE Token_Migration SHALL replace only the colour portion with the corresponding semantic token
7. THE Token_Migration SHALL NOT modify `.css` files that are not CSS Modules (files without the `.module.css` suffix) other than `src/styles/tokens.css` and `src/styles/globals.css` which are covered by criteria 2 and 3
