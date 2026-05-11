# Requirements Document

## Introduction

Consolidate all colour tokens used across the application into a single Token Manager UI. Currently, the Token Manager (at `src/pages/component-demos/TokenManagerDemo.tsx`) only manages Tailwind/shadcn tokens defined in `globals.css`. The CSS Module semantic tokens from `tokens.css` — including border-strong, border-focus, background-subtle, background-sunken, text-tertiary, accent-hover, accent-text, state-disabled-bg, and others — are not represented. This feature ensures every colour in the application flows through the Token Manager as a single source of truth, with no colour existing outside the managed system.

## Glossary

- **Token_Manager**: The UI page at `src/pages/component-demos/TokenManagerDemo.tsx` that allows editing, previewing, and exporting design token values
- **Token_Config**: The data structure (`TokenConfig` in `src/models/tokenConfig.ts`) that stores all colour, spacing, radius, and typography token values with light/dark mode variants
- **Default_Token_Config**: The static default values defined in `src/data/defaultTokenConfig.ts` that seed the Token_Config on first load
- **VARIABLE_MAP**: The mapping in `defaultTokenConfig.ts` that defines which CSS variables are updated when a token value changes (dual injection for both globals.css and tokens.css variables)
- **COLOUR_TOKEN_GROUPS**: The array in `defaultTokenConfig.ts` that organises tokens into named groups for display in the Colour Section UI
- **Colour_Section**: The UI component (`ColourSection`) that renders grouped colour swatches with editing controls
- **CSS_Module_Token**: A semantic CSS custom property defined in `tokens.css` (e.g. `--color-border-strong`, `--color-background-subtle`) used by CSS Module components
- **Tailwind_Token**: A CSS custom property defined in `globals.css` (e.g. `--border`, `--background`) consumed by Tailwind utility classes
- **Dual_Injection**: The mechanism where updating a single token in the Token_Manager sets both the Tailwind_Token and the corresponding CSS_Module_Token CSS variables simultaneously
- **useTokenConfig_Hook**: The React hook at `src/lib/useTokenConfig.ts` that reads/writes Token_Config from localStorage and injects CSS variables onto the document root

## Requirements

### Requirement 1: Register Missing Border Tokens

**User Story:** As a designer, I want the Token_Manager to include border-strong and border-focus tokens, so that all border colours used in CSS Module components are editable from one place.

#### Acceptance Criteria

1. THE Default_Token_Config SHALL include entries for `border-strong` and `border-focus` with light and dark mode primitive references matching the values in `tokens.css`
2. THE COLOUR_TOKEN_GROUPS SHALL include `border-strong` and `border-focus` within the "Border" group
3. WHEN a user edits the `border-strong` token, THE useTokenConfig_Hook SHALL set `--color-border-strong` on the document root
4. WHEN a user edits the `border-focus` token, THE useTokenConfig_Hook SHALL set `--color-border-focus` on the document root via the VARIABLE_MAP

### Requirement 2: Register Missing Background Tokens

**User Story:** As a designer, I want the Token_Manager to include background-subtle, background-sunken, and background-elevated tokens, so that all surface colours used in CSS Module components are manageable.

#### Acceptance Criteria

1. THE Default_Token_Config SHALL include entries for `background-subtle`, `background-sunken`, and `background-elevated` with light and dark mode primitive references matching the values in `tokens.css`
2. THE COLOUR_TOKEN_GROUPS SHALL include a "Background" group containing `background-subtle`, `background-sunken`, and `background-elevated`
3. WHEN a user edits the `background-subtle` token, THE useTokenConfig_Hook SHALL set `--color-background-subtle` on the document root
4. WHEN a user edits the `background-sunken` token, THE useTokenConfig_Hook SHALL set `--color-background-sunken` on the document root
5. WHEN a user edits the `background-elevated` token, THE useTokenConfig_Hook SHALL set `--color-background-elevated` on the document root

### Requirement 3: Register Missing Text Tokens

**User Story:** As a designer, I want the Token_Manager to include text-tertiary, text-disabled, text-inverse, and text-on-accent tokens, so that all text colours are controlled from the Token_Manager.

#### Acceptance Criteria

1. THE Default_Token_Config SHALL include entries for `text-tertiary`, `text-disabled`, `text-inverse`, and `text-on-accent` with light and dark mode primitive references matching the values in `tokens.css`
2. THE COLOUR_TOKEN_GROUPS SHALL include a "Text" group containing `text-tertiary`, `text-disabled`, `text-inverse`, and `text-on-accent`
3. WHEN a user edits the `text-tertiary` token, THE useTokenConfig_Hook SHALL set `--color-text-tertiary` on the document root
4. WHEN a user edits the `text-disabled` token, THE useTokenConfig_Hook SHALL set `--color-text-disabled` on the document root
5. WHEN a user edits the `text-inverse` token, THE useTokenConfig_Hook SHALL set `--color-text-inverse` on the document root
6. WHEN a user edits the `text-on-accent` token, THE useTokenConfig_Hook SHALL set `--color-text-on-accent` on the document root

### Requirement 4: Register Missing Accent Tokens

**User Story:** As a designer, I want the Token_Manager to include accent-hover, accent-subtle, accent-text, and accent-border tokens, so that all accent colour variants are editable.

#### Acceptance Criteria

1. THE Default_Token_Config SHALL include entries for `accent-hover`, `accent-subtle`, `accent-text`, and `accent-border` with light and dark mode primitive references matching the values in `tokens.css`
2. THE COLOUR_TOKEN_GROUPS SHALL include `accent-hover`, `accent-subtle`, `accent-text`, and `accent-border` within the existing "Accent" group
3. WHEN a user edits the `accent-hover` token, THE useTokenConfig_Hook SHALL set `--color-accent-hover` on the document root
4. WHEN a user edits the `accent-subtle` token, THE useTokenConfig_Hook SHALL set `--color-accent-subtle` on the document root
5. WHEN a user edits the `accent-text` token, THE useTokenConfig_Hook SHALL set `--color-accent-text` on the document root
6. WHEN a user edits the `accent-border` token, THE useTokenConfig_Hook SHALL set `--color-accent-border` on the document root

### Requirement 5: Register Missing State Tokens

**User Story:** As a designer, I want the Token_Manager to include state-disabled-bg and state-disabled-text tokens, so that disabled state colours are centrally managed.

#### Acceptance Criteria

1. THE Default_Token_Config SHALL include entries for `state-disabled-bg` and `state-disabled-text` with light and dark mode primitive references matching the values in `tokens.css`
2. THE COLOUR_TOKEN_GROUPS SHALL include a "State" group containing `state-disabled-bg` and `state-disabled-text`
3. WHEN a user edits the `state-disabled-bg` token, THE useTokenConfig_Hook SHALL set `--color-state-disabled-bg` on the document root
4. WHEN a user edits the `state-disabled-text` token, THE useTokenConfig_Hook SHALL set `--color-state-disabled-text` on the document root

### Requirement 6: Register Missing Danger Tokens

**User Story:** As a designer, I want the Token_Manager to include danger-hover, danger-subtle, danger-text, and danger-border tokens, so that all danger/error colour variants are editable alongside the existing destructive tokens.

#### Acceptance Criteria

1. THE Default_Token_Config SHALL include entries for `danger-hover`, `danger-subtle`, `danger-text`, and `danger-border` with light and dark mode primitive references matching the values in `tokens.css`
2. THE COLOUR_TOKEN_GROUPS SHALL include a "Danger" group containing `danger-hover`, `danger-subtle`, `danger-text`, and `danger-border`
3. WHEN a user edits the `danger-hover` token, THE useTokenConfig_Hook SHALL set `--color-danger-hover` on the document root
4. WHEN a user edits the `danger-text` token, THE useTokenConfig_Hook SHALL set `--color-danger-text` on the document root

### Requirement 7: Register Missing Neutral Tokens

**User Story:** As a designer, I want the Token_Manager to include neutral-default, neutral-hover, neutral-subtle, neutral-text, and neutral-border tokens, so that the neutral colour scale is centrally managed.

#### Acceptance Criteria

1. THE Default_Token_Config SHALL include entries for `neutral-default`, `neutral-hover`, `neutral-subtle`, `neutral-text`, and `neutral-border` with light and dark mode primitive references matching the values in `tokens.css`
2. THE COLOUR_TOKEN_GROUPS SHALL include a "Neutral" group containing `neutral-default`, `neutral-hover`, `neutral-subtle`, `neutral-text`, and `neutral-border`
3. WHEN a user edits any neutral token, THE useTokenConfig_Hook SHALL set the corresponding `--color-neutral-*` CSS variable on the document root

### Requirement 8: Extend VARIABLE_MAP for Dual Injection

**User Story:** As a designer, I want token edits to update both the Tailwind/shadcn CSS variable and the CSS Module semantic variable simultaneously, so that both styling systems stay in sync from a single edit.

#### Acceptance Criteria

1. THE VARIABLE_MAP SHALL contain entries for all tokens that have corresponding variables in both `globals.css` and `tokens.css`
2. WHEN a token has entries in the VARIABLE_MAP, THE useTokenConfig_Hook SHALL set all mapped CSS variables to the same resolved hex value
3. THE VARIABLE_MAP SHALL map `background` to both `--background` and `--color-background-default`
4. THE VARIABLE_MAP SHALL map `foreground` to both `--foreground` and `--color-text-primary`
5. THE VARIABLE_MAP SHALL map `border` to both `--border` and `--color-border-default`
6. THE VARIABLE_MAP SHALL map `muted-foreground` to both `--muted-foreground` and `--color-text-secondary`
7. THE VARIABLE_MAP SHALL map `ring` to both `--ring` and `--color-border-focus`

### Requirement 9: Colour Section UI Displays All Groups

**User Story:** As a designer, I want the Colour Section UI to display all registered token groups including the newly added Background, Text, Accent, State, Danger, and Neutral groups, so that I can see and edit every colour from one interface.

#### Acceptance Criteria

1. THE Colour_Section SHALL render a group heading and token swatches for every entry in COLOUR_TOKEN_GROUPS
2. THE Colour_Section SHALL display the token name, current light mode value, and current dark mode value for each token
3. WHEN a new group is added to COLOUR_TOKEN_GROUPS, THE Colour_Section SHALL display the group without code changes to the component itself

### Requirement 10: No Unmanaged Colours

**User Story:** As a designer, I want every semantic colour variable in `tokens.css` to have a corresponding entry in the Token_Config, so that no colour exists outside the managed system.

#### Acceptance Criteria

1. FOR ALL semantic colour variables defined in the `:root` block of `tokens.css` (variables matching `--color-*` excluding primitive palette variables like `--color-zinc-*`), THE Default_Token_Config SHALL contain a corresponding token entry
2. THE Default_Token_Config light mode values SHALL resolve to the same hex values as the `:root` definitions in `tokens.css`
3. THE Default_Token_Config dark mode values SHALL resolve to the same hex values as the `[data-theme="dark"]` definitions in `tokens.css`

### Requirement 11: Backward Compatibility on Reset

**User Story:** As a designer, I want the reset function to restore all tokens (including newly added CSS Module tokens) to their default values, so that I can return to the baseline state.

#### Acceptance Criteria

1. WHEN the user triggers a reset, THE useTokenConfig_Hook SHALL clear all inline styles from the document root
2. WHEN the user triggers a reset, THE useTokenConfig_Hook SHALL restore the Token_Config state to the full Default_Token_Config including all newly registered tokens
3. WHEN the user triggers a reset, THE Token_Manager SHALL display default values for all token groups

### Requirement 12: Export Includes All Tokens

**User Story:** As a designer, I want the JSON export to include all managed tokens (both Tailwind and CSS Module tokens), so that the exported file represents the complete colour system.

#### Acceptance Criteria

1. WHEN the user triggers an export, THE useTokenConfig_Hook SHALL produce a JSON file containing all token entries from the Token_Config
2. THE exported JSON SHALL include entries for all newly registered tokens (background-subtle, border-strong, accent-hover, state-disabled-bg, etc.)
3. THE exported JSON SHALL preserve the `{ light: PrimitiveRef, dark: PrimitiveRef }` structure for each colour token
