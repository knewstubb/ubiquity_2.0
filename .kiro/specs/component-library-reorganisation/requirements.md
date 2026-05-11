# Requirements Document

## Introduction

Reorganise the Component Library page (`/admin/components`) to replace the custom sidebar with the shadcn Sidebar component, restructure categories from the current flat Foundations/Primitives/Composed/Custom grouping into a purpose-driven taxonomy (Tokens, Inputs, Display, Feedback, Navigation, Composed), and split the monolithic Token Manager page into individual sub-pages per token type.

## Glossary

- **Component_Library**: The admin page at `/admin/components` that showcases all UI components with live demos and interactive prop controls.
- **Sidebar**: The shadcn/ui Sidebar component (`npx shadcn@latest add sidebar`) used for vertical navigation within the Component Library.
- **Component_Registry**: The data file (`src/data/componentRegistry.ts`) that defines all component entries, their categories, slugs, and lazy-loaded demo imports.
- **Token_Sub_Page**: An individual page/route dedicated to a single token type (Colours, Typography, Shadows, Spacing & Radius, or Icons).
- **Controls_Panel**: The interactive prop controls panel that allows users to manipulate component props in real time.
- **Category**: A logical grouping of components in the sidebar (Tokens, Inputs, Display, Feedback, Navigation, Composed).

## Requirements

### Requirement 1: Replace Custom Sidebar with shadcn Sidebar

**User Story:** As a prototype maintainer, I want the Component Library sidebar to use the shadcn Sidebar component, so that the navigation is consistent with the design system and benefits from built-in accessibility and styling.

#### Acceptance Criteria

1. WHEN the Component Library page loads, THE Sidebar SHALL render using the shadcn Sidebar component from `src/components/ui/sidebar.tsx`.
2. THE Sidebar SHALL display category group headings with collapsible item lists beneath each heading, with all groups expanded by default.
3. WHEN a sidebar item is clicked, THE Component_Library SHALL navigate to the corresponding component demo route.
4. THE Sidebar SHALL indicate the currently active item by applying the `text-primary` colour token to the item label and a `border-l-primary` left border accent.
5. THE Sidebar SHALL remain fixed in position with a width of 220px while the main content area scrolls independently.
6. THE Sidebar SHALL support keyboard navigation such that each item is focusable via Tab and activatable via Enter or Space.
7. WHEN a category group heading is clicked, THE Sidebar SHALL toggle the visibility of that group's item list between expanded and collapsed states.
8. WHILE a category group is collapsed, THE Sidebar SHALL hide all items within that group and display a visual expand indicator on the group heading.

### Requirement 2: Restructure Component Categories

**User Story:** As a prototype maintainer, I want components grouped by purpose (Inputs, Display, Feedback, Navigation) rather than by abstraction level (Primitives), so that finding a component is intuitive.

#### Acceptance Criteria

1. THE Component_Registry SHALL define the following categories: `tokens`, `inputs`, `display`, `feedback`, `navigation`, `composed`.
2. THE Sidebar SHALL display categories in this order: Tokens, Inputs, Display, Feedback, Navigation, Composed.
3. WHEN a category heading is expanded in the Sidebar, THE Sidebar SHALL list that category's components in the order specified by criteria 4–9.
4. WHEN the `tokens` category is expanded, THE Sidebar SHALL list in this order: Colours, Typography, Shadows, Spacing & Radius, Icons.
5. WHEN the `inputs` category is expanded, THE Sidebar SHALL list in this order: Button, Calendar, Checkbox, Input, InputOTP, Label, RadioGroup, Select, Slider, Switch, Textarea, Toggle, ToggleGroup, Form.
6. WHEN the `display` category is expanded, THE Sidebar SHALL list in this order: Avatar, Badge, Card, Separator, Skeleton, Table, Progress.
7. WHEN the `feedback` category is expanded, THE Sidebar SHALL list in this order: Alert, AlertDialog, Dialog, Sheet, Sonner, Tooltip, HoverCard, Popover.
8. WHEN the `navigation` category is expanded, THE Sidebar SHALL list in this order: Accordion, Breadcrumb, Collapsible, Command, ContextMenu, DropdownMenu, Menubar, NavigationMenu, Pagination, ScrollArea, Tabs.
9. WHEN the `composed` category is expanded, THE Sidebar SHALL list in this order: CardSelector, StatusBadge, MetricCard, DataTable, Toast, Modal.
10. THE Component_Registry SHALL assign every component entry to exactly one of the six defined categories, with no component left uncategorized.

### Requirement 3: Split Token Manager into Individual Sub-Pages

**User Story:** As a prototype maintainer, I want each token type (Colours, Typography, Shadows, Spacing & Radius, Icons) to have its own dedicated page, so that navigation is direct and the Token Manager is no longer a single monolithic tabbed page.

#### Acceptance Criteria

1. THE Component_Library SHALL provide individual routes for each token type: `/admin/components/tokens/colours`, `/admin/components/tokens/typography`, `/admin/components/tokens/shadows`, `/admin/components/tokens/spacing-radius`, `/admin/components/tokens/icons`.
2. WHEN a token sub-page route is accessed, THE Component_Library SHALL render the corresponding token editor content that was previously a tab within the Token Manager, including the ActionBar with reset and export controls.
3. THE Token_Sub_Page for Colours SHALL display the colour palette editor where changes to a colour token value are reflected in the rendered colour swatches within 200ms without a page reload.
4. THE Token_Sub_Page for Typography SHALL display the typography scale editor where changes to a font-size token value are reflected in the rendered type samples within 200ms without a page reload.
5. THE Token_Sub_Page for Shadows SHALL display the shadow token editor where changes to a shadow token value are reflected in the rendered shadow examples within 200ms without a page reload.
6. THE Token_Sub_Page for Spacing & Radius SHALL display both the spacing scale editor and the border-radius editor on a single page, where changes to spacing or radius token values are reflected in the rendered examples within 200ms without a page reload.
7. THE Token_Sub_Page for Icons SHALL display the icon library browser listing all available Phosphor icons with a search filter that returns matching results as the user types.
8. WHILE a user is on any Token_Sub_Page, THE Component_Library SHALL preserve token edits in memory so that navigating between token sub-pages retains unsaved changes for the duration of the session.
9. WHEN the `/admin/components/tokens` route is accessed without a specific token type slug, THE Component_Library SHALL redirect to `/admin/components/tokens/colours`.

### Requirement 4: Remove Redundant Foundations Items

**User Story:** As a prototype maintainer, I want the standalone Typography, Colours, Shadows, and Spacing & Radius demo pages removed from the registry, so that there is no duplication between the old foundation demos and the new token sub-pages.

#### Acceptance Criteria

1. THE Component_Registry SHALL NOT contain entries for the legacy `foundations` category items: Typography (slug: `typography`), Colours (slug: `colours`), Shadows (slug: `shadows`), Spacing & Radius (slug: `spacing-radius`).
2. THE Component_Registry SHALL NOT contain the combined Design Tokens entry (slug: `tokens`).
3. WHEN a user navigates to `/admin/components/foundations/typography`, `/admin/components/foundations/colours`, `/admin/components/foundations/shadows`, or `/admin/components/foundations/spacing-radius`, THE Component_Library SHALL redirect to the corresponding token sub-page at `/admin/components/tokens/typography`, `/admin/components/tokens/colours`, `/admin/components/tokens/shadows`, or `/admin/components/tokens/spacing-radius` respectively.
4. THE Component_Registry `ComponentCategory` type SHALL NOT include the `foundations` or `custom` values.
5. IF a user navigates to `/admin/components/foundations` or `/admin/components/foundations/tokens`, THEN THE Component_Library SHALL redirect to `/admin/components/tokens`.

### Requirement 5: Preserve Controls Panel Functionality

**User Story:** As a prototype maintainer, I want the existing Controls Panel (propControls, useControlValues, ControlsPanel) to continue working after the reorganisation, so that interactive prop editing is unaffected.

#### Acceptance Criteria

1. WHEN a component with `propControls` defined is viewed, THE Controls_Panel SHALL render alongside the component demo displaying one control input for each entry in the component's `propControls` array.
2. WHEN a control value is changed, THE Controls_Panel SHALL pass the updated value to the demo component and the demo component SHALL re-render reflecting the new prop value.
3. WHEN the reset button is clicked, THE Controls_Panel SHALL restore all control values to the `defaultValue` specified in each `PropDefinition`.
4. IF a component entry includes a `usedIn` array with one or more entries, THEN THE Controls_Panel SHALL display a "Used In" link for each entry, navigating to the specified route.
5. IF a component entry does not define `propControls`, THEN THE Controls_Panel SHALL not render the controls section for that component.

### Requirement 6: Update Route Structure

**User Story:** As a prototype maintainer, I want the route structure to reflect the new category taxonomy, so that URLs are predictable and bookmarkable.

#### Acceptance Criteria

1. THE Component_Library SHALL use routes in the format `/admin/components/:category/:slug` for all component demos, where `:category` is one of `tokens`, `inputs`, `display`, `feedback`, `navigation`, `composed`.
2. WHEN the `/admin/components` route is accessed without a sub-path, THE Component_Library SHALL redirect to `/admin/components/tokens`.
3. WHEN a valid category route is accessed without a component slug, THE Component_Library SHALL display a category overview listing the name and description of each component registered in that category.
4. THE Component_Library SHALL lazy-load all component demo modules to maintain code-splitting behaviour.
5. IF a user navigates to a route with an unrecognised category or slug, THEN THE Component_Library SHALL redirect to `/admin/components/tokens`.
