# Requirements Document

## Introduction

A Token Management UI page within the existing Component Library (`/admin/components`) that provides a visual interface for viewing and editing all design tokens used in the UbiQuity design system. The page eliminates hardcoded hex values from semantic token definitions by referencing Tailwind colour primitives (e.g. `zinc-800` instead of `#27272A`), and allows live editing of token assignments with persistence.

## Glossary

- **Token_Manager**: The token management page and its associated components within the Component Library admin section
- **Semantic_Token**: A CSS custom property with a meaningful name (e.g. `--background`, `--primary`) that references a Tailwind colour primitive rather than a hardcoded hex value
- **Tailwind_Primitive**: A colour from the Tailwind CSS default palette identified by name and shade (e.g. `zinc-50`, `red-500`, `amber-800`)
- **Token_Config**: A JSON data structure that stores the mapping between semantic token names and their Tailwind primitive references for both light and dark modes
- **Colour_Section**: The section of the Token Manager displaying colour tokens with light and dark mode values side by side
- **Spacing_Section**: The section displaying spacing scale tokens with visual size indicators
- **Radius_Section**: The section displaying border radius tokens with shape previews
- **Typography_Section**: The section displaying font family, size scale, and weight tokens
- **Icon_Section**: The section displaying the configured icon set
- **Live_Preview**: The immediate visual update of token changes applied via CSS custom property injection without page reload

## Requirements

### Requirement 1: Token Management Page Navigation

**User Story:** As a designer, I want to access a token management page within the Component Library, so that I can view and edit design tokens alongside the components they style.

#### Acceptance Criteria

1. THE Token_Manager SHALL be accessible at the route `/admin/components/foundations/tokens` within the existing Component Library page
2. THE Token_Manager SHALL appear in the Component Library sidebar under the "Foundations" category with the label "Design Tokens"
3. WHEN the Token_Manager page loads, THE Token_Manager SHALL display section tabs for Colours, Spacing, Border Radius, Typography, and Icons

### Requirement 2: Colour Token Display

**User Story:** As a designer, I want to see all colour tokens with their light and dark mode values side by side, so that I can review the full colour system at a glance like I do in Figma.

#### Acceptance Criteria

1. THE Colour_Section SHALL display each semantic token as a row containing the token name, a light mode value, and a dark mode value
2. THE Colour_Section SHALL show a colour swatch preview next to each token value
3. THE Colour_Section SHALL display the Tailwind primitive reference name (e.g. `zinc-50`) for each token value instead of a hex code
4. THE Colour_Section SHALL group tokens into logical subsections: Core Surfaces, Primary, Secondary, Muted, Accent, Destructive, Warning, Success, Info, Border, Sidebar, and Charts
5. WHEN a token value references a Tailwind primitive, THE Colour_Section SHALL display both the primitive name and the resolved hex value

### Requirement 3: Colour Token Editing

**User Story:** As a designer, I want to change which Tailwind colour a semantic token references, so that I can adjust the design system without manually editing CSS files.

#### Acceptance Criteria

1. WHEN the user clicks a token value in the Colour_Section, THE Token_Manager SHALL open a colour picker showing the full Tailwind colour palette (zinc, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, neutral, stone) with all shade steps (50–950)
2. WHEN the user selects a Tailwind primitive from the colour picker, THE Token_Manager SHALL update the token value to reference the selected primitive
3. WHEN a token value is changed, THE Live_Preview SHALL apply the new colour immediately to the page via CSS custom property injection
4. THE Token_Manager SHALL allow independent editing of light mode and dark mode values for each colour token

### Requirement 4: Token Persistence

**User Story:** As a designer, I want my token changes to persist between sessions, so that I do not lose my work when I close the browser.

#### Acceptance Criteria

1. WHEN the user changes a token value, THE Token_Manager SHALL save the updated Token_Config to localStorage
2. WHEN the Token_Manager page loads, THE Token_Manager SHALL read the Token_Config from localStorage and apply any saved overrides to the active CSS custom properties
3. THE Token_Manager SHALL provide a "Reset to Defaults" action that restores all tokens to their original values defined in `globals.css`
4. THE Token_Manager SHALL provide an "Export" action that outputs the Token_Config as a downloadable JSON file

### Requirement 5: Spacing Token Display and Editing

**User Story:** As a designer, I want to see the spacing scale with visual indicators, so that I can understand the relative sizes and adjust them if needed.

#### Acceptance Criteria

1. THE Spacing_Section SHALL display each spacing token (xxs through xxl) with its name, pixel value, and a horizontal bar whose width represents the token value
2. THE Spacing_Section SHALL display the spacing tokens in ascending order from smallest to largest
3. WHEN the user edits a spacing token value, THE Token_Manager SHALL accept a numeric pixel value and update the visual indicator accordingly

### Requirement 6: Border Radius Token Display and Editing

**User Story:** As a designer, I want to see the radius scale with visual shape previews, so that I can understand how each radius value looks on an element.

#### Acceptance Criteria

1. THE Radius_Section SHALL display each radius token (none, sm, md, lg, xl, full) with its name, pixel value, and a square preview element using that border radius
2. THE Radius_Section SHALL display the base radius value (`--radius`) with a note that other values are derived from it
3. WHEN the user edits the base radius value, THE Token_Manager SHALL recalculate and display the derived radius values (sm = base × 0.6, md = base × 0.8, lg = base, xl = base × 1.4)

### Requirement 7: Typography Token Display and Editing

**User Story:** As a designer, I want to see font families, the size scale, and weight options, so that I can review and adjust the typographic system.

#### Acceptance Criteria

1. THE Typography_Section SHALL display font family tokens (primary and mono) with a text sample rendered in each font
2. THE Typography_Section SHALL display the font size scale (xxs through 5xl) with each size shown as a text sample at that size
3. THE Typography_Section SHALL display font weight tokens (light through bold) with a text sample rendered at each weight
4. WHEN the user edits a font size token, THE Token_Manager SHALL accept a numeric pixel value and update the text sample preview

### Requirement 8: Icon Set Configuration Display

**User Story:** As a designer, I want to see the configured icon set, so that I can confirm which icon library is in use.

#### Acceptance Criteria

1. THE Icon_Section SHALL display the name of the active icon library (Phosphor Icons)
2. THE Icon_Section SHALL display a grid of sample icons from the active library showing common UI icons (e.g. search, settings, close, check, arrow, plus, trash)
3. THE Icon_Section SHALL display the icon style variant in use (regular weight)

### Requirement 9: Non-Breaking Token Propagation

**User Story:** As a designer, I want token changes to propagate through the existing CSS variable system, so that existing components update without breaking.

#### Acceptance Criteria

1. WHEN a colour token is changed, THE Live_Preview SHALL update the corresponding CSS custom property on the document root element
2. THE Token_Manager SHALL update both the `globals.css` semantic tokens (used by shadcn/Tailwind components) and the equivalent `tokens.css` variables (used by CSS Module components) when values overlap
3. IF a token change causes a CSS custom property to become invalid, THEN THE Token_Manager SHALL revert the change and display an error message

### Requirement 10: Tailwind Primitive Reference Format

**User Story:** As a designer, I want all colour tokens to reference Tailwind primitives by name instead of hex codes, so that the design system is maintainable and consistent with the Tailwind ecosystem.

#### Acceptance Criteria

1. THE Token_Config SHALL store colour values as Tailwind primitive references in the format `{palette}-{shade}` (e.g. `zinc-50`, `red-500`)
2. THE Token_Manager SHALL resolve Tailwind primitive references to their hex values for CSS injection using the standard Tailwind colour palette
3. WHEN displaying a token value, THE Token_Manager SHALL show the primitive reference name as the primary label with the hex value as secondary information
4. THE Token_Manager SHALL include the mint palette (the custom UDS teal brand scale) as a selectable option alongside standard Tailwind palettes
