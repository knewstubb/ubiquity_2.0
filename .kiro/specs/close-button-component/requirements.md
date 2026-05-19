# Requirements Document

## Introduction

A standardised CloseButton component that serves as the single source of truth for all close/dismiss buttons (X buttons) across the application. The component covers modals, panels, banners, and dialogs — but excludes chip remove buttons and field clear buttons. It uses CVA for size variants, supports the asChild pattern for Radix primitive composition, and follows the project's existing focus ring and hover conventions.

## Glossary

- **CloseButton**: A reusable React component rendered as a button element displaying a Phosphor X icon, used exclusively for closing or dismissing UI containers
- **CVA**: Class Variance Authority — the library used to define variant-based Tailwind class maps for components
- **asChild**: A prop pattern (via @radix-ui/react-slot) that merges the component's props and styles onto its single child element instead of rendering its own DOM node
- **Focus_Ring**: The standard focus-visible indicator pattern used across the project: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background`
- **Size_Variant**: One of four predefined size options (xs, sm, default, lg) controlling the button dimensions and icon size

## Requirements

### Requirement 1

**User Story:** As a developer, I want a single CloseButton component with consistent styling, so that all close/dismiss buttons across the app look and behave identically.

#### Acceptance Criteria

1. THE CloseButton SHALL render a button element with a centred Phosphor X icon and a screen-reader-only "Close" label
2. THE CloseButton SHALL apply the base classes: inline-flex, items-center, justify-center, rounded-sm, transition-colors, and disabled:pointer-events-none disabled:opacity-50
3. THE CloseButton SHALL display a hover state using hover:bg-secondary
4. THE CloseButton SHALL display the Focus_Ring pattern when focused via keyboard navigation

### Requirement 2

**User Story:** As a developer, I want size variants for the CloseButton, so that I can use appropriately sized close buttons in different UI contexts.

#### Acceptance Criteria

1. WHEN the size prop is "xs", THE CloseButton SHALL render at 20px × 20px with a 12px icon
2. WHEN the size prop is "sm", THE CloseButton SHALL render at 24px × 24px with a 14px icon
3. WHEN the size prop is "default" or omitted, THE CloseButton SHALL render at 28px × 28px with a 16px icon
4. WHEN the size prop is "lg", THE CloseButton SHALL render at 32px × 32px with a 20px icon
5. THE CloseButton SHALL use "default" as the size when no size prop is provided

### Requirement 3

**User Story:** As a developer, I want the CloseButton to support the asChild pattern, so that I can compose it with Radix primitives like DialogClose and SheetPrimitive.Close.

#### Acceptance Criteria

1. WHEN the asChild prop is true, THE CloseButton SHALL render its single child element using @radix-ui/react-slot instead of a native button element
2. WHEN the asChild prop is true, THE CloseButton SHALL merge its variant classes, event handlers, and ref onto the child element
3. WHEN the asChild prop is false or omitted, THE CloseButton SHALL render a native button element

### Requirement 4

**User Story:** As a developer, I want the CloseButton to accept a className prop, so that I can apply positioning classes (e.g. absolute right-4 top-4) without overriding base styles.

#### Acceptance Criteria

1. THE CloseButton SHALL accept an optional className prop and merge it with the variant classes using the cn() utility
2. THE CloseButton SHALL forward all standard button HTML attributes (onClick, aria-label, disabled, etc.) to the rendered element
3. THE CloseButton SHALL forward a ref to the underlying button element via React.forwardRef

### Requirement 5

**User Story:** As a developer, I want to replace all existing inline close button implementations with the new CloseButton component, so that the codebase has a single source of truth for close button styling.

#### Acceptance Criteria

1. WHEN the CloseButton component is available, THE Sheet component SHALL use CloseButton with asChild wrapping SheetPrimitive.Close instead of inline close button markup
2. WHEN the CloseButton component is available, THE codebase SHALL contain no inline X-icon close button implementations that duplicate CloseButton functionality for modal, panel, banner, or dialog dismiss actions

### Requirement 6

**User Story:** As a user, I want close buttons to be accessible, so that I can dismiss UI containers using assistive technology.

#### Acceptance Criteria

1. THE CloseButton SHALL include a visually hidden text element with the content "Close" as the accessible name
2. WHEN an aria-label prop is provided, THE CloseButton SHALL use the provided aria-label as the accessible name instead of the default
3. THE CloseButton SHALL be reachable via keyboard Tab navigation and activatable via Enter or Space keys
