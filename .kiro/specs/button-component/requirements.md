# Requirements Document

## Introduction

A reusable Button component for the UbiQuity Design System (UDS) prototype. The component replaces inline-styled button examples on the Component Library page with a shared, token-driven implementation that matches the Figma UDS specification. It supports multiple variants (Solid/Ghost), sizes (Regular/Medium/Small), interaction states (Default/Hover/Focus/Active/Disabled), optional leading/trailing icons, and dark mode via CSS custom properties.

## Glossary

- **Button_Component**: The shared React component located at `src/components/shared/Button.tsx` that renders an interactive `<button>` element styled via CSS Modules.
- **Solid_Type**: A button variant with a filled accent background (`--color-accent-default`) and inverse text (`--color-text-on-accent`).
- **Ghost_Type**: A button variant with no background fill and secondary text colour (`--color-text-secondary`), used for low-emphasis actions.
- **Design_Token**: A CSS custom property defined in `src/styles/tokens.css` that maps to a semantic colour, spacing, or typography value from the Figma UDS.
- **Component_Library_Page**: The admin page at `/admin/components` that showcases all UDS components with live interactive examples.
- **Leading_Icon**: An optional Phosphor icon rendered before the button label text.
- **Trailing_Icon**: An optional Phosphor icon rendered after the button label text.

## Requirements

### Requirement 1: Render Button Variants

**User Story:** As a prototype developer, I want a Button component that supports Solid and Ghost variants, so that I can use the correct visual emphasis for primary and secondary actions.

#### Acceptance Criteria

1. WHEN the `variant` prop is set to `"solid"`, THE Button_Component SHALL render with background colour `--color-accent-default` and text colour `--color-text-on-accent`.
2. WHEN the `variant` prop is set to `"ghost"`, THE Button_Component SHALL render with a transparent background and text colour `--color-text-secondary`.
3. WHEN no `variant` prop is provided, THE Button_Component SHALL default to the `"solid"` variant.

### Requirement 2: Render Button Sizes

**User Story:** As a prototype developer, I want the Button component to support Regular, Medium, and Small sizes, so that I can use appropriately sized buttons in different UI contexts.

#### Acceptance Criteria

1. WHEN the `size` prop is set to `"regular"`, THE Button_Component SHALL render with padding `6px 16px`, font-size `14px`, and font-weight `600`.
2. WHEN the `size` prop is set to `"medium"`, THE Button_Component SHALL render with padding `7px 12px`, font-size `12px`, and font-weight `600`.
3. WHEN the `size` prop is set to `"small"`, THE Button_Component SHALL render with padding `4px 10px`, font-size `12px`, and font-weight `700`.
4. WHEN no `size` prop is provided, THE Button_Component SHALL default to the `"regular"` size.

### Requirement 3: Interactive States

**User Story:** As a user, I want buttons to provide visual feedback on hover, focus, and click, so that I can perceive that the element is interactive.

#### Acceptance Criteria

1. WHEN the user hovers over the Button_Component, THE Button_Component SHALL reduce opacity to `0.8` with a `150ms ease` transition.
2. WHEN the Button_Component receives keyboard focus, THE Button_Component SHALL display a `2px` outline using `--color-border-focus` with a `2px` offset.
3. WHEN the user presses (active state) the Button_Component, THE Button_Component SHALL apply a `scale(0.95)` transform with a `100ms ease` transition.
4. WHEN the `disabled` prop is `true`, THE Button_Component SHALL apply background `--color-state-disabled-bg`, text colour `--color-state-disabled-text`, and prevent pointer events.
5. WHILE the Button_Component is disabled, THE Button_Component SHALL set `cursor: not-allowed` and `opacity: 0.6`.

### Requirement 4: Icon Support

**User Story:** As a prototype developer, I want to optionally include leading and trailing icons in the Button, so that I can match the Figma designs that pair icons with labels.

#### Acceptance Criteria

1. WHEN a `leadingIcon` prop is provided, THE Button_Component SHALL render the Phosphor icon element before the label text with a `6px` gap.
2. WHEN a `trailingIcon` prop is provided, THE Button_Component SHALL render the Phosphor icon element after the label text with a `6px` gap.
3. WHEN both `leadingIcon` and `trailingIcon` props are provided, THE Button_Component SHALL render both icons in their respective positions.
4. WHEN neither icon prop is provided, THE Button_Component SHALL render only the label text without additional spacing.

### Requirement 5: Design Token Integration

**User Story:** As a prototype developer, I want the Button component to use semantic design tokens exclusively, so that dark mode and theme changes propagate automatically.

#### Acceptance Criteria

1. THE Button_Component SHALL reference only CSS custom properties from `src/styles/tokens.css` for all colour values.
2. THE Button_Component SHALL use `--radius-md` (8px) for border-radius.
3. THE Button_Component SHALL use `--font-family-primary` for font-family.
4. WHILE the application is in dark mode (`[data-theme="dark"]`), THE Button_Component SHALL automatically reflect the dark mode token overrides without additional props or logic.

### Requirement 6: Accessibility

**User Story:** As a user relying on assistive technology, I want the Button component to be fully accessible, so that I can interact with it using a keyboard or screen reader.

#### Acceptance Criteria

1. THE Button_Component SHALL render as a native `<button>` HTML element.
2. WHEN the `disabled` prop is `true`, THE Button_Component SHALL set the `disabled` attribute on the `<button>` element.
3. THE Button_Component SHALL support an optional `aria-label` prop for cases where the visible label is insufficient.
4. THE Button_Component SHALL be focusable via keyboard Tab navigation in the default state.
5. WHEN the `disabled` prop is `true`, THE Button_Component SHALL be excluded from the tab order.

### Requirement 7: Component Library Integration

**User Story:** As a prototype reviewer, I want the Component Library page to showcase the real Button component with all variants and states, so that I can verify the implementation matches the Figma spec.

#### Acceptance Criteria

1. WHEN the Component_Library_Page renders the Buttons section, THE Component_Library_Page SHALL import and display the shared Button_Component instead of inline-styled elements.
2. THE Component_Library_Page SHALL display examples of Solid and Ghost variants in all three sizes.
3. THE Component_Library_Page SHALL display examples with leading icons, trailing icons, and disabled states.

### Requirement 8: CSS Module Implementation

**User Story:** As a prototype developer, I want the Button styles to be co-located in a CSS Module, so that styles are scoped and follow the project conventions.

#### Acceptance Criteria

1. THE Button_Component SHALL import styles from `Button.module.css` located in the same directory.
2. THE Button_Component SHALL not use inline styles, Tailwind classes, or CSS-in-JS.
3. THE Button_Component SHALL use camelCase class names in the CSS Module (e.g., `.button`, `.solid`, `.ghost`, `.regular`, `.small`).
