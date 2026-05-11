# Requirements Document

## Introduction

Integrate Tailwind CSS and shadcn/ui into the existing UbiQuity React + Vite prototype to gain access to a full set of accessible UI primitives (Dialog, Select, Dropdown, Tabs, Tooltip, Popover, Combobox, DatePicker, Sheet, Accordion, etc.) while preserving all existing CSS Modules components unchanged. Tailwind is configured to map directly to the existing Figma design tokens so that shadcn components render with the Ubiquity Design System (UDS) look and feel. The Component Library page is upgraded to handle the expanded component set with tabbed/routed navigation.

## Glossary

- **Tailwind_Config**: The `tailwind.config.ts` file that maps CSS custom properties from `tokens.css` to Tailwind utility classes
- **shadcn_Registry**: The local `src/components/ui/` directory where shadcn/ui component source files are installed and customised
- **CSS_Modules_Component**: Any existing component styled with a co-located `.module.css` file (Button, TextField, CardSelector, Modal, Toggle, etc.)
- **Design_Token**: A CSS custom property defined in `src/styles/tokens.css` representing a colour, spacing, radius, or typography value from the Figma UDS
- **Component_Library**: The admin page at `/admin/components` that showcases all shared UI components for reference
- **Dark_Mode**: The theme state activated by the `data-theme="dark"` attribute on the document root
- **Vite_Build**: The Vite-based build pipeline that compiles TypeScript, CSS Modules, and now Tailwind CSS into production bundles

## Requirements

### Requirement 1: Install and Configure Tailwind CSS

**User Story:** As a developer, I want Tailwind CSS installed and configured with the project's existing design tokens, so that I can use utility classes that produce visually consistent output with the Figma UDS.

#### Acceptance Criteria

1. WHEN the Vite_Build runs, THE Tailwind_Config SHALL process Tailwind utility classes in source files and emit corresponding CSS
2. THE Tailwind_Config SHALL map the `--space-*` Design_Tokens to Tailwind spacing utilities (e.g., `space-sm` → 8px, `space-md` → 16px)
3. THE Tailwind_Config SHALL map the `--radius-*` Design_Tokens to Tailwind border-radius utilities (e.g., `rounded-lg` → 8px)
4. THE Tailwind_Config SHALL map the `--color-*` semantic Design_Tokens to Tailwind colour utilities (e.g., `bg-accent-default` → var(--color-accent-default))
5. THE Tailwind_Config SHALL map the `--font-size-*` and `--font-weight-*` Design_Tokens to Tailwind typography utilities
6. THE Tailwind_Config SHALL configure dark mode to use the `[data-theme="dark"]` selector strategy
7. WHEN the `data-theme="dark"` attribute is set, THE Tailwind_Config SHALL cause `dark:` variant utilities to apply the dark mode Design_Token overrides
8. THE Tailwind_Config SHALL include the `tailwindcss-animate` plugin required by shadcn/ui (note: `@tailwindcss/forms` is NOT required — shadcn uses Radix primitives for form elements)

### Requirement 2: Preserve Existing CSS Modules Components

**User Story:** As a developer, I want existing CSS Modules components to continue working without modification, so that the integration is non-breaking and progressive.

#### Acceptance Criteria

1. WHEN Tailwind CSS is active, THE Vite_Build SHALL continue to process `.module.css` files with CSS Modules scoping unchanged
2. THE Vite_Build SHALL produce no class name collisions between Tailwind utility classes and CSS Modules scoped class names
3. WHILE Tailwind CSS is installed, THE CSS_Modules_Components (Button, TextField, CardSelector, Modal, Toggle, Dropdown, DataTable, Checkbox, RadioCard, StatusBadge, Toast, MetricCard) SHALL render identically to their pre-integration appearance
4. THE Tailwind_Config SHALL disable Tailwind's `preflight` (base reset) entirely to prevent global element resets from affecting existing CSS_Modules_Components which already manage their own styling

### Requirement 3: Install and Configure shadcn/ui

**User Story:** As a developer, I want shadcn/ui installed with its dependencies, so that I can add accessible UI primitives to the prototype without building them from scratch.

#### Acceptance Criteria

1. WHEN `npx shadcn@latest init` completes, THE shadcn_Registry SHALL be configured to output components to `src/components/ui/`
2. THE shadcn_Registry SHALL be configured to use the project's existing Design_Tokens via CSS variables (not hardcoded hex values)
3. THE shadcn_Registry SHALL include the `cn()` utility function for conditional class merging (using `clsx` + `tailwind-merge`)
4. WHEN a shadcn component is added via `npx shadcn@latest add <component>`, THE component source SHALL be placed in `src/components/ui/` and be editable
5. THE shadcn_Registry SHALL be configured with the TypeScript path alias `@/` pointing to `src/`, requiring both a `tsconfig.json` paths entry AND a Vite resolve alias in `vite.config.ts`

### Requirement 4: Restyle shadcn Components to Match UDS

**User Story:** As a developer, I want shadcn components to use the Ubiquity design tokens by default, so that they visually match the existing Figma UDS without per-instance overrides.

#### Acceptance Criteria

1. THE shadcn_Registry components SHALL use `--color-accent-default` (#14B88A) as the primary/brand colour
2. THE shadcn_Registry components SHALL use `--font-family-primary` (Inter) as the base font family
3. THE shadcn_Registry components SHALL use `--radius-lg` (8px) as the default border radius for interactive elements
4. THE shadcn_Registry components SHALL use `--space-sm` (8px) and `--space-md` (16px) for internal padding consistent with UDS button and input sizing
5. WHEN Dark_Mode is active, THE shadcn_Registry components SHALL reflect the dark mode Design_Token overrides (dark backgrounds, light text, adjusted accent colours)
6. THE shadcn_Registry components SHALL use `--shadow-s` through `--shadow-xl` for elevation consistent with UDS shadow tokens
7. THE initial shadcn component set SHALL include: Dialog, Tabs, Tooltip, Popover, Select, Sheet, Accordion, DropdownMenu, Command (combobox), and Separator — additional components added on demand

### Requirement 5: Upgrade Component Library Navigation

**User Story:** As a developer, I want the Component Library page to support tabbed or routed navigation, so that it can scale to display 30+ components without becoming unwieldy.

#### Acceptance Criteria

1. WHEN a user navigates to `/admin/components`, THE Component_Library SHALL display a tabbed or sidebar navigation listing component categories
2. THE Component_Library SHALL organise components into categories: Custom (existing CSS Modules components), Primitives (shadcn base components), and Composed (shadcn compound components)
3. WHEN a user selects a category or specific component, THE Component_Library SHALL display only that section's content without a full page reload
4. THE Component_Library SHALL display each component with a live rendered example showing its variants and states
5. THE Component_Library SHALL support deep-linking to specific component sections via URL (e.g., `/admin/components/dialog`)

### Requirement 6: Coexistence Strategy

**User Story:** As a developer, I want clear boundaries between CSS Modules and Tailwind styling approaches, so that the codebase remains consistent and predictable.

#### Acceptance Criteria

1. THE project SHALL use CSS Modules for all existing custom components in `src/components/shared/` and feature-scoped component directories
2. THE project SHALL use Tailwind utility classes exclusively for components in the `src/components/ui/` shadcn_Registry directory
3. WHEN building new UI that requires a primitive not available in `src/components/shared/`, THE developer SHALL use the corresponding shadcn_Registry component
4. IF a CSS_Modules_Component is explicitly migrated to Tailwind, THEN THE new Tailwind version SHALL be created in `src/components/ui/` and a re-export SHALL be added at the original path to avoid breaking existing imports. The original CSS Module file may be removed once all consumers are updated.

### Requirement 7: Build and Tooling Integration

**User Story:** As a developer, I want the build pipeline to handle both CSS Modules and Tailwind without performance degradation or configuration conflicts, so that the development experience remains fast.

#### Acceptance Criteria

1. THE Vite_Build SHALL process Tailwind CSS via PostCSS without requiring changes to existing Vite configuration for CSS Modules
2. WHEN running `npm run dev`, THE Vite_Build SHALL hot-reload changes to both CSS Modules files and Tailwind utility classes
3. WHEN running `npm run build`, THE Vite_Build SHALL produce a single optimised CSS bundle containing both CSS Modules output and Tailwind utilities
4. THE Vite_Build SHALL tree-shake unused Tailwind utilities in production builds to minimise bundle size
5. THE project SHALL include a `components.json` configuration file for the shadcn CLI at the project root

### Requirement 8: Update Tech Stack Steering File

**User Story:** As a developer, I want the project's steering documentation updated to reflect the new dual-styling approach, so that contributors understand when to use CSS Modules versus Tailwind.

#### Acceptance Criteria

1. WHEN the integration is complete, THE `tech-stack.md` steering file SHALL be updated to document the coexistence of CSS Modules and Tailwind CSS
2. THE `tech-stack.md` steering file SHALL specify that CSS Modules remain the default for existing components and Tailwind is used for shadcn/ui components
3. THE `project-structure.md` steering file SHALL document the `src/components/ui/` directory as the shadcn_Registry location
