---
inclusion: always
---

# Project Structure

## Directory Map

```
src/
├── App.tsx                          # Route definitions — all routes live here
├── main.tsx                         # Entry point
├── components/
│   ├── layout/
│   │   ├── AppNavBar.tsx            # Primary nav bar — top-level only, no sub-nav
│   │   ├── AccountSwitcher.tsx      # Account context switcher in nav
│   │   └── PageShell.tsx            # Standard page wrapper (title + subtitle + action)
│   ├── ui/                          # shadcn/ui component registry (Tailwind-styled)
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── ...                      # Added via `npx shadcn@latest add <component>`
│   └── {feature}/                   # Feature-scoped components
│       └── ComponentName.tsx
├── pages/                           # One file per route (flat, not nested)
│   └── PageName.tsx
├── contexts/                        # React context providers
│   ├── AccountContext.tsx           # Currently selected account
│   ├── PlatformAdminContext.tsx     # Role resolution
│   ├── FeatureFlagContext.tsx       # Feature flag state
│   └── PricingContext.tsx           # Editable unit prices
├── models/                          # TypeScript interfaces (one file per entity)
│   ├── account.ts
│   ├── connection.ts
│   ├── connector.ts
│   └── billing.ts
├── data/                            # Static seed data files
│   └── {entity}.ts
├── lib/                             # Utility functions and adapters
│   ├── utils.ts                     # cn() utility — conditional class merging (clsx + tailwind-merge)
│   ├── supabase.ts                  # Supabase client
│   └── adapters/                    # Data layer adapters
├── providers/                       # Composite providers (DataLayerProvider)
│   └── DataLayerProvider.tsx
├── styles/
│   └── globals.css                  # Tailwind CSS entry point — single source of truth for design tokens
└── utils/                           # Pure utility functions

scripts/
└── seed.ts                          # Pushes data/ to Supabase — run after data changes

.kiro/
├── steering/                        # These files
├── agents/                          # Custom agent definitions (.md files)
├── specs/                           # One subdirectory per feature spec
│   └── {feature-name}/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── hooks/                           # Event-triggered automations
```

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `ContactCard.tsx` |
| Pages | PascalCase | `SegmentsPage.tsx` |
| Contexts | PascalCase + Context suffix | `AccountContext.tsx` |
| Data files | camelCase plural | `contacts.ts`, `campaigns.ts` |
| Model interfaces | PascalCase singular | `Contact`, `Campaign` |
| IDs in data | prefixed kebab-case | `acc-master`, `seg-gold-members` |
| Routes | kebab-case | `/audiences/segments` |

## Styling Approach

All components use Tailwind utility classes applied directly in JSX. There are no CSS Module files in the project.

- Use Tailwind utilities for all styling (layout, colour, spacing, typography, borders, shadows)
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class composition (e.g. active states, variants, dynamic styling)
- Design tokens are defined as CSS custom properties in `src/styles/globals.css` and exposed to Tailwind via `@theme inline`
- Use semantic token utilities (`bg-primary`, `text-muted-foreground`, `border-border`) rather than raw colour values
- Use Tailwind state variants for interactivity (`hover:`, `focus-visible:`, `active:`, `disabled:`)
- Use `dark:` variant for dark-mode-specific overrides when the token system doesn't handle it automatically

```tsx
// ✅ Correct — Tailwind utilities with cn() for conditional styling
<button className={cn(
  "px-3 py-2 text-sm font-semibold rounded-md transition-colors",
  "hover:bg-muted",
  isActive && "text-primary"
)}>

// ❌ Wrong — no CSS Modules, no inline styles
<button className={styles.primaryButton}>
<button style={{ color: 'var(--primary)' }}>
```

## Component Anatomy

Every component follows this structure — in this order:

```tsx
// 1. Imports
import { useState } from 'react'
import { PhosphorIcon } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'

// 2. Types
interface ComponentNameProps {
  // ...
}

// 3. Component
export function ComponentName({ prop }: ComponentNameProps) {
  // 3a. State
  const [value, setValue] = useState(...)

  // 3b. Derived values / computed
  const derived = ...

  // 3c. Handlers (named handleX)
  function handleClick() { ... }

  // 3d. Render
  return (...)
}
```

## Route Definitions

All routes are explicit in `src/App.tsx` — no wildcard catch-alls. When adding a new page:

1. Create the page file in `src/pages/`
2. Add the import to `App.tsx`
3. Add the `<Route>` element
4. Update `navigation-structure.md` if the nav changes

## Model Imports

Each model file exports its own interfaces. Import directly from the model file:

```tsx
import type { Connection } from '../../models/connection'
import type { Connector } from '../../models/connector'
```

## Specs

Feature specs live in `.kiro/specs/{feature-name}/`. Always three files:

- `requirements.md` — what and why
- `design.md` — how it fits the architecture
- `tasks.md` — sequenced implementation steps

Commit spec files alongside the code they describe.
