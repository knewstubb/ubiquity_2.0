# Requirements Document

## Introduction

Rebuild the ConnectionRow and AutomationCard components on the Integrations page using shadcn primitives and Tailwind utility classes, replacing the current CSS Modules implementation. This follows the same migration pattern established by the connection-modal-shadcn spec (CreateConnectionModal and InitialModal). The components remain feature-scoped in `src/components/dashboard/` — they use shadcn primitives internally but are not generic design system components.

## Glossary

- **ConnectionRow**: The parent row component that displays a connection's protocol, name, status summary, and an expandable section containing child AutomationCard rows.
- **AutomationCard**: The child row component nested inside a ConnectionRow that displays an automation's direction, name, entity type, last-run status, toggle switch, and actions menu.
- **Collapsible**: The shadcn/Radix primitive (`@/components/ui/collapsible`) that provides accessible expand/collapse behaviour with animation support.
- **DropdownMenu**: The shadcn/Radix primitive (`@/components/ui/dropdown-menu`) that provides an accessible actions menu triggered by a button.
- **Switch**: The shadcn/Radix primitive (`@/components/ui/switch`) that provides an accessible toggle control.
- **StatusBadge**: The composed component (`@/components/composed/status-badge`) that renders a coloured pill badge for status indicators.
- **ProtocolIcon**: The existing shared component (`@/components/shared/ProtocolIcon`) that renders a coloured icon for S3, SFTP, or Azure Blob protocols.
- **CSS_Modules**: The `.module.css` files co-located with components that are being replaced by Tailwind utility classes.

## Requirements

### Requirement 1: ConnectionRow Rebuild with shadcn Collapsible

**User Story:** As a developer, I want the ConnectionRow component rebuilt using shadcn Collapsible and Tailwind utilities, so that it uses the same primitive library as the rest of the migrated components.

#### Acceptance Criteria

1. THE ConnectionRow SHALL render using the shadcn Collapsible primitive for expand/collapse behaviour.
2. WHEN the user clicks the ConnectionRow header, THE Collapsible SHALL toggle between expanded and collapsed states.
3. WHEN the user presses Enter or Space on the focused header, THE Collapsible SHALL toggle between expanded and collapsed states.
4. THE ConnectionRow SHALL display a chevron icon that rotates 90 degrees when expanded.
5. THE ConnectionRow SHALL display the ProtocolIcon, protocol label, and connection name in the header left section.
6. WHILE the connection status is "connected", THE ConnectionRow SHALL display an automation count summary (e.g. "4 of 5 Automations Active") centred in the header.
7. WHILE the connection status is "error", THE ConnectionRow SHALL display "Connection Error. Automations Cannot Run" in destructive colour centred in the header.
8. THE ConnectionRow SHALL preserve the existing prop interface (`ConnectionRowProps`) so that parent components require no changes.
9. THE ConnectionRow SHALL use Tailwind utility classes for all layout and styling with no CSS Module import.

### Requirement 2: ConnectionRow Actions DropdownMenu

**User Story:** As a user, I want the three-dot actions menu on a connection row to use the shadcn DropdownMenu, so that it has consistent keyboard navigation and accessibility.

#### Acceptance Criteria

1. THE ConnectionRow SHALL render a shadcn DropdownMenu triggered by a DotsThree icon button.
2. WHEN the DropdownMenu is open, THE ConnectionRow SHALL display menu items for "Add Automation", "Edit Connection", and "Delete Connection".
3. WHILE the connection status is "error", THE DropdownMenu SHALL hide the "Add Automation" menu item.
4. WHILE the connection has one or more automations, THE "Delete Connection" menu item SHALL be disabled with a tooltip explaining the constraint.
5. THE "Delete Connection" menu item SHALL use destructive styling (red text).
6. WHEN a menu item is clicked, THE DropdownMenu SHALL close and invoke the corresponding callback prop.
7. THE DropdownMenu trigger click SHALL NOT propagate to the parent header (preventing unintended expand/collapse).

### Requirement 3: AutomationCard Rebuild with Tailwind Grid Layout

**User Story:** As a developer, I want the AutomationCard component rebuilt using Tailwind utilities and shadcn primitives, so that it aligns with the migrated component library.

#### Acceptance Criteria

1. THE AutomationCard SHALL use a CSS Grid layout via Tailwind utilities with four column groups: name, data type, status, and actions.
2. THE AutomationCard SHALL display a direction icon (arrow down for import, arrow up for export) coloured with the primary token when active.
3. THE AutomationCard SHALL display the automation name in semibold text, truncated with ellipsis on overflow.
4. THE AutomationCard SHALL display the data type label with an appropriate Phosphor icon (UsersThree for contacts, NewspaperClipping for transactional).
5. WHEN the automation data type is "transactional_with_contact", THE AutomationCard SHALL display both the transactional source name and "contacts" with their respective icons.
6. THE AutomationCard SHALL display a StatusBadge composed component showing the last run status ("Completed" or "Failed").
7. THE AutomationCard SHALL display the last run time as muted text beside the status badge.
8. WHILE the automation status is "paused", THE AutomationCard SHALL render with reduced opacity and a subtle background.
9. THE AutomationCard SHALL preserve the existing prop interface (`AutomationCardProps`) so that parent components require no changes.
10. THE AutomationCard SHALL use Tailwind utility classes for all layout and styling with no CSS Module import.

### Requirement 4: AutomationCard Toggle Switch

**User Story:** As a user, I want the active/inactive toggle on each automation row to use the shadcn Switch primitive, so that it has consistent styling and accessibility.

#### Acceptance Criteria

1. THE AutomationCard SHALL render a shadcn Switch component reflecting the automation's active/paused status.
2. WHEN the user clicks the Switch, THE AutomationCard SHALL invoke the `onToggleStatus` callback.
3. THE Switch click event SHALL NOT propagate to the parent row (preventing unintended navigation to settings).
4. THE Switch SHALL be visually consistent with the shadcn Switch styling (primary colour when checked).

### Requirement 5: AutomationCard Actions DropdownMenu

**User Story:** As a user, I want the three-dot actions menu on each automation row to use the shadcn DropdownMenu, so that it has consistent keyboard navigation and accessibility.

#### Acceptance Criteria

1. THE AutomationCard SHALL render a shadcn DropdownMenu triggered by a DotsThree icon button.
2. WHEN the DropdownMenu is open, THE AutomationCard SHALL display menu items for "Automation Settings", "Edit Automation", "Activity Log", "History", and "Delete Automation".
3. THE "Delete Automation" menu item SHALL use destructive styling (red text) and be separated by a divider.
4. WHEN a menu item is clicked, THE DropdownMenu SHALL close and invoke the corresponding callback prop.
5. THE DropdownMenu trigger click SHALL NOT propagate to the parent row (preventing unintended navigation).

### Requirement 6: Expand/Collapse Animation

**User Story:** As a user, I want the connection row expand/collapse to animate smoothly, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. WHEN the ConnectionRow expands, THE child content SHALL animate from zero height to full content height using a CSS grid-rows transition or Tailwind animation utility.
2. WHEN the ConnectionRow collapses, THE child content SHALL animate from full height to zero height.
3. THE expand/collapse animation duration SHALL match the existing transition timing (300ms).

### Requirement 7: CSS Module Deletion

**User Story:** As a developer, I want the old CSS Module files removed after migration, so that there is no dead code in the repository.

#### Acceptance Criteria

1. WHEN the ConnectionRow migration is complete, THE file `ConnectionRow.module.css` SHALL be deleted from `src/components/dashboard/`.
2. WHEN the AutomationCard migration is complete, THE file `AutomationCard.module.css` SHALL be deleted from `src/components/dashboard/`.
3. WHEN the OverflowMenu is no longer imported by any component, THE files `OverflowMenu.tsx` and `OverflowMenu.module.css` SHALL be deleted from `src/components/dashboard/`.
4. WHEN the StatusToggle is no longer imported by any component, THE files `StatusToggle.tsx` and `StatusToggle.module.css` SHALL be deleted from `src/components/dashboard/`.

### Requirement 8: Visual Parity

**User Story:** As a designer, I want the rebuilt components to be visually identical to the current implementation, so that the migration does not introduce regressions.

#### Acceptance Criteria

1. THE ConnectionRow SHALL render with a 1px border, rounded-lg corners, and padding-4 matching the current card appearance.
2. THE AutomationCard SHALL render with a 1px border, rounded-md corners, shadow-sm, and the same grid proportions as the current implementation.
3. THE AutomationCard hover state SHALL show an elevated shadow and primary-coloured border matching the current behaviour.
4. THE ConnectionRow chevron, protocol icon spacing, and text hierarchy SHALL match the current visual layout.
5. THE DropdownMenu items SHALL match the current context menu styling: 13px text, medium weight, 10px padding, 6px container padding, with hover backgrounds.
