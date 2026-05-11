# Requirements Document

## Introduction

Migrate the UbiQuity prototype from a dual styling system (CSS Modules + Tailwind) to a single Tailwind-based system. Currently, CSS Modules reference `--color-*` variables from `tokens.css`, while shadcn/ui components reference Tailwind-mapped variables from `globals.css`. A `VARIABLE_MAP` in `defaultTokenConfig.ts` performs dual injection to keep both in sync. This migration consolidates to one token set following shadcn naming conventions, makes `globals.css` the single source of truth, converts all CSS Module components to Tailwind utilities, and removes the dual injection layer.

## Glossary

- **Token_Set**: The collection of CSS custom properties (variables) that define the design system's colours, spacing, radius, and typography values
- **globals.css**: The Tailwind CSS entry point file (`src/styles/globals.css`) that defines CSS variables in `:root` and `[data-theme="dark"]` selectors and exposes them to Tailwind via `@theme inline`
- **tokens.css**: The legacy UDS token file (`src/styles/tokens.css`) containing primitive palettes, semantic tokens, and backward-compatible aliases
- **VARIABLE_MAP**: The TypeScript object in `src/data/defaultTokenConfig.ts` that maps each token name to an array of CSS variable names for dual injection into both `globals.css` and `tokens.css` variable namespaces
- **CSS_Module**: A `.module.css` file co-located with a React component that provides scoped styles using CSS class names and `var(--color-*)` token references
- **shadcn_Convention**: The naming pattern used by shadcn/ui where semantic colours follow `{semantic}` for background and `{semantic}-foreground` for text on that background (e.g. `destructive` / `destructive-foreground`)
- **Tailwind_Utility**: A Tailwind CSS class that applies a single style property (e.g. `bg-primary`, `text-muted-foreground`, `border-border`)
- **Duplicate_Token**: A token in the current system that resolves to the same hex value as another token and serves the same semantic purpose
- **Token_Manager**: The in-app UI (`src/components/token-manager/`) that allows runtime editing of token values and uses the `VARIABLE_MAP` for injection

## Requirements

### Requirement 1: Consolidate Duplicate Tokens

**User Story:** As a developer, I want a single canonical token for each semantic colour, so that I do not encounter ambiguity about which variable to use.

#### Acceptance Criteria

1. WHEN the consolidated Token_Set is defined, THE Token_Set SHALL contain exactly one token per semantic purpose, retaining the shadcn_Convention name as the canonical token
2. WHEN a Duplicate_Token exists (e.g. `accent-subtle` duplicating `accent`, `danger-border` duplicating `destructive-border`), THE Token_Set SHALL remove the UDS-named duplicate and retain only the shadcn-named equivalent
3. THE Token_Set SHALL merge `secondary`, `muted`, and `background-subtle` into a single `muted` token for subtle surface backgrounds
4. THE Token_Set SHALL merge `muted-foreground` and `neutral-default` into a single `muted-foreground` token for secondary text
5. THE Token_Set SHALL merge `tertiary-foreground` and `text-tertiary` into a single `tertiary-foreground` token for lowest-emphasis text
6. THE Token_Set SHALL merge `primary`, `accent-border`, `ring`, and `border-focus` into `primary` for the brand colour and `ring` for focus indicators
7. THE Token_Set SHALL merge `destructive-subtle` and `danger-subtle` into `destructive-subtle`
8. THE Token_Set SHALL merge `destructive-border` and `danger-border` into `destructive-border`
9. THE Token_Set SHALL merge `text-disabled` and `state-disabled-text` into a single `disabled-foreground` token following shadcn_Convention
10. THE Token_Set SHALL merge `border` and `input` into a single `border` token (shadcn components reference `input` separately but both resolve to the same value)

### Requirement 2: Establish globals.css as Single Source of Truth

**User Story:** As a developer, I want all design tokens defined in one file, so that I have a single place to update values and no synchronisation issues.

#### Acceptance Criteria

1. THE globals.css SHALL define all semantic colour tokens in `:root` and `[data-theme="dark"]` selectors
2. THE globals.css SHALL expose all semantic tokens to Tailwind via the `@theme inline` block
3. WHEN the migration is complete, THE tokens.css file SHALL be removed from the project
4. WHEN the migration is complete, THE globals.css SHALL NOT reference any variable defined in tokens.css
5. THE globals.css SHALL retain the custom `mint` palette as CSS variables for use in the `@theme inline` block where Tailwind does not provide a built-in equivalent
6. WHEN a non-colour token (spacing, radius, typography, font-weight, shadow, transition) is currently defined only in tokens.css, THE globals.css SHALL absorb that definition or the value SHALL be expressed directly via Tailwind's default scale

### Requirement 3: Migrate CSS Module Components to Tailwind Utilities

**User Story:** As a developer, I want all components styled with Tailwind utility classes, so that the codebase uses a single styling mechanism and components are portable.

#### Acceptance Criteria

1. WHEN a CSS_Module references `var(--color-*)` tokens, THE Migration SHALL replace those references with equivalent Tailwind_Utility classes applied directly in the component's JSX
2. WHEN a CSS_Module is fully converted to Tailwind utilities, THE Migration SHALL delete the `.module.css` file and remove its import from the component
3. THE Migration SHALL preserve the visual appearance of every component after conversion (same colours, spacing, borders, and layout)
4. WHEN a CSS_Module uses non-token styles (layout, positioning, animations), THE Migration SHALL convert those to Tailwind utilities or retain them as inline Tailwind classes
5. THE Migration SHALL use the `cn()` utility from `src/lib/utils.ts` for conditional class composition in components that have dynamic styling
6. IF a CSS_Module contains styles that cannot be expressed as Tailwind utilities, THEN THE Migration SHALL use Tailwind's arbitrary value syntax (e.g. `bg-[var(--custom)]`) as a last resort
7. WHEN all CSS_Module files are removed, THE project SHALL have zero `.module.css` files remaining

### Requirement 4: Remove the VARIABLE_MAP and Dual Injection Layer

**User Story:** As a developer, I want the dual injection mechanism removed, so that the token system is simple and there is no hidden synchronisation logic.

#### Acceptance Criteria

1. WHEN the migration is complete, THE `VARIABLE_MAP` export SHALL be removed from `src/data/defaultTokenConfig.ts`
2. WHEN the migration is complete, THE Token_Manager SHALL read and write token values directly against the canonical CSS variables defined in globals.css
3. IF the Token_Manager injects CSS variables at runtime, THEN THE Token_Manager SHALL inject only the single canonical variable name (e.g. `--primary`) rather than an array of aliases
4. THE removal SHALL NOT break the Token_Manager's ability to preview colour changes in real time
5. WHEN the VARIABLE_MAP is removed, THE `TOKEN_DESCRIPTIONS` and `COLOUR_TOKEN_GROUPS` in `defaultTokenConfig.ts` SHALL be updated to reference only the consolidated token names

### Requirement 5: Follow shadcn Naming Conventions for All Tokens

**User Story:** As a developer, I want consistent token naming, so that I can predict the correct utility class without checking documentation.

#### Acceptance Criteria

1. THE Token_Set SHALL follow the pattern `{semantic}` for background/surface colours and `{semantic}-foreground` for text on that surface
2. THE Token_Set SHALL use `{semantic}-subtle` for light tinted backgrounds used in alerts and banners
3. THE Token_Set SHALL use `{semantic}-border` for status-coloured borders
4. WHEN a new token is needed for disabled states, THE Token_Set SHALL name it `disabled` for the background and `disabled-foreground` for the text, following shadcn_Convention
5. THE Token_Set SHALL NOT contain any token using the UDS `--color-*` prefix pattern (e.g. `--color-accent-default`, `--color-text-primary`)
6. THE Token_Set SHALL NOT contain tokens using `state-*`, `danger-*`, `neutral-*`, `text-*`, or `background-*` prefixes that duplicate a shadcn-named token

### Requirement 6: Update Steering Files and Project Configuration

**User Story:** As a developer, I want the project documentation to reflect the new single-system approach, so that future contributors follow the correct patterns.

#### Acceptance Criteria

1. WHEN the migration is complete, THE `tech-stack.md` steering file SHALL describe Tailwind CSS as the single styling mechanism for all components
2. WHEN the migration is complete, THE `project-structure.md` steering file SHALL remove references to CSS Modules as the default styling approach and remove the co-location rule for `.module.css` files
3. WHEN the migration is complete, THE `project-structure.md` SHALL document that all components use Tailwind utility classes and the `cn()` utility for conditional styling
4. THE `tech-stack.md` SHALL state that `src/styles/globals.css` is the single source of truth for design tokens
5. WHEN the migration is complete, THE Tailwind configuration SHALL NOT import or reference `tokens.css`

### Requirement 7: Maintain Dark Mode Support

**User Story:** As a user, I want dark mode to continue working correctly after the migration, so that my theme preference is respected.

#### Acceptance Criteria

1. THE globals.css SHALL define dark mode token overrides in the `[data-theme="dark"]` selector
2. THE Tailwind configuration SHALL map the `dark:` variant to `[data-theme="dark"]` via the existing `@custom-variant` directive
3. WHEN a component uses dark-mode-specific styling, THE Migration SHALL use Tailwind's `dark:` variant prefix (e.g. `dark:bg-zinc-800`)
4. THE Migration SHALL verify that all migrated components render correctly in both light and dark modes

### Requirement 8: Preserve Mint Palette Availability

**User Story:** As a developer, I want the custom mint colour palette available as Tailwind utilities, so that I can use brand colours directly in markup.

#### Acceptance Criteria

1. THE globals.css SHALL define the mint palette (mint-50 through mint-950) as CSS variables
2. THE `@theme inline` block SHALL expose the mint palette so that Tailwind utilities like `bg-mint-500` and `text-mint-700` are available
3. WHEN a component previously referenced `var(--color-mint-*)` from tokens.css, THE Migration SHALL replace it with the corresponding Tailwind utility (e.g. `bg-mint-500`)
