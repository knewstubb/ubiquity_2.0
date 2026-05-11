# Design: Rebuild ConnectionRow & AutomationCard with shadcn

## Overview

Rebuild `ConnectionRow` and `AutomationCard` using shadcn primitives (Collapsible, DropdownMenu, Switch) and Tailwind utility classes, replacing CSS Modules. This follows the same migration pattern established by the connection-modal-shadcn spec. Both components remain feature-scoped in `src/components/dashboard/` — they consume shadcn primitives internally but are not generic design system components.

The migration preserves all existing functionality, prop interfaces, and visual appearance while gaining:
- Accessible keyboard navigation via Radix primitives (DropdownMenu handles focus, Escape, arrow keys)
- Consistent styling with the shadcn component library
- Elimination of manual click-outside listeners and portal-based menus
- Reduced CSS surface area (delete 2 CSS Module files + 2 shared component files)

## Architecture

### Component Mapping

| Old Pattern | Replacement |
|---|---|
| Manual expand/collapse with `useState` + CSS grid-rows | `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` from `@/components/ui/collapsible` |
| Custom context menu (absolute/fixed positioned div + click-outside listener) | `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` from `@/components/ui/dropdown-menu` |
| `Toggle` from `../shared/Toggle` (CSS Module checkbox hack) | `Switch` from `@/components/ui/switch` |
| Custom `.lastRunBadge` pill styling | `StatusBadge` from `@/components/composed/status-badge` |
| CSS Module classes | Tailwind utility classes via `cn()` |

### Component Hierarchy

```
ConnectionRow (Collapsible root)
├── CollapsibleTrigger (header row — flex layout)
│   ├── Chevron icon (rotate on expand)
│   ├── ProtocolIcon + protocol label + connection name
│   ├── Status summary (centred, absolute positioned)
│   └── DropdownMenu (actions — DotsThree trigger)
│       ├── Add Automation (conditional)
│       ├── Edit Connection
│       ├── Separator
│       └── Delete Connection (destructive, conditional disabled)
└── CollapsibleContent (animated child area)
    └── AutomationCard[] (grid layout per card)
        ├── Group 1: Direction icon + name
        ├── Group 2: Data type icon + label
        ├── Group 3: StatusBadge + last run time
        └── Group 4: Switch + DropdownMenu
            ├── Automation Settings
            ├── Edit Automation
            ├── Activity Log
            ├── History
            ├── Separator
            └── Delete Automation (destructive)
```

## Components and Interfaces

### ConnectionRow

```tsx
interface ConnectionRowProps {
  connection: Connection;
  connectors: Automation[];
  onAddConnector: (connectionId: string) => void;
  onEditConnection?: (connectionId: string) => void;
  onDeleteConnection?: (connectionId: string) => void;
  children?: ReactNode;
}
```

**Preserved exactly** — no changes to the public API.

**Internal changes:**
- Remove `useState` for `expanded` — use Collapsible's `open` / `onOpenChange` (still needs local state since Collapsible is controlled)
- Remove `useState` for `menuOpen` — DropdownMenu manages its own open state internally
- Remove `useRef` + `useEffect` click-outside listener — DropdownMenu handles dismissal via Radix
- Remove manual `role="button"` / `tabIndex` / `onKeyDown` on header — CollapsibleTrigger provides this

**Render structure:**

```tsx
<Collapsible open={expanded} onOpenChange={setExpanded}>
  <div className={cn("border border-border rounded-lg p-4 mb-6", isError && "...")}>
    <CollapsibleTrigger asChild>
      <div className="flex items-center justify-between gap-3 min-h-8 cursor-pointer select-none relative">
        {/* header content */}
      </div>
    </CollapsibleTrigger>

    <CollapsibleContent className="overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
      {/* children */}
    </CollapsibleContent>
  </div>
</Collapsible>
```

### AutomationCard

```tsx
interface AutomationCardProps {
  connector: Automation;
  connectionError?: boolean;
  onToggleStatus: () => void;
  onViewSettings: () => void;
  onEditWizard: () => void;
  onDelete: () => void;
  onActivityLog?: () => void;
  onHistory?: () => void;
}
```

**Preserved exactly** — no changes to the public API.

**Internal changes:**
- Remove `useState` for `menuOpen` + `menuPos` — DropdownMenu manages positioning via Radix Portal
- Remove `useRef` for `buttonRef` + `menuRef` — no manual positioning needed
- Remove `useEffect` click-outside listener — DropdownMenu handles dismissal
- Remove `createPortal` usage — DropdownMenuContent uses its own portal
- Replace `Toggle` import with `Switch` from `@/components/ui/switch`
- Replace custom `.lastRunBadge` with `StatusBadge` from `@/components/composed/status-badge`

**Render structure:**

```tsx
<div
  className={cn(
    "grid grid-cols-[1fr_1fr_1fr_auto] items-center px-4 py-2 min-h-11",
    "bg-background border border-border rounded-md shadow-sm",
    "cursor-pointer select-none",
    "transition-[box-shadow,border-color] duration-200",
    "hover:shadow-md hover:border-primary",
    "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
    isPaused && "bg-secondary border-border shadow-none opacity-60"
  )}
  role="button"
  tabIndex={0}
  aria-label={`Automation: ${connector.name}`}
  onClick={() => onViewSettings()}
  onKeyDown={...}
>
  {/* Group 1: Direction + Name */}
  <div className="flex items-center gap-2.5">
    <span className={cn("inline-flex items-center justify-center shrink-0 text-primary", isPaused && "text-tertiary-foreground", connectionError && "text-destructive")}>
      <DirectionIcon />
    </span>
    <span className="text-sm font-semibold text-foreground truncate">{connector.name}</span>
  </div>

  {/* Group 2: Data type */}
  <span className="inline-flex items-center gap-1.5 text-base text-muted-foreground truncate max-w-[200px]">
    {/* icon + label */}
  </span>

  {/* Group 3: Status + Time */}
  <div className="flex items-center gap-2">
    <StatusBadge variant={lastRunStatus === 'Failed' ? 'error' : 'active'}>
      {lastRunStatus}
    </StatusBadge>
    <span className="text-sm text-tertiary-foreground whitespace-nowrap">{lastRunTime}</span>
  </div>

  {/* Group 4: Switch + DropdownMenu */}
  <div className="flex items-center gap-4">
    <div onClick={(e) => e.stopPropagation()}>
      <Switch checked={connector.status === 'active'} onCheckedChange={() => onToggleStatus()} />
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button onClick={(e) => e.stopPropagation()} ...>
          <DotsThree size={20} weight="bold" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        {/* menu items */}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>
```

## Data Models

No new data models. The components consume existing `Connection` and `Automation` interfaces from `src/models/`.

## Styling Approach

### Tailwind Layout Patterns

**ConnectionRow header** — Flexbox:
```
flex items-center justify-between gap-3 min-h-8 cursor-pointer select-none relative
```

The `relative` positioning allows the centred status text to use `absolute left-1/2 -translate-x-1/2` — matching the current CSS approach.

**AutomationCard** — CSS Grid:
```
grid grid-cols-[1fr_1fr_1fr_auto] items-center px-4 py-2 min-h-11
```

This preserves the current 4-column layout: name, data type, status, actions.

### Colour Token Usage

| Element | Tailwind Class |
|---|---|
| Card border | `border-border` |
| Card background | `bg-background` |
| Primary text | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Tertiary text | `text-tertiary-foreground` |
| Active icon | `text-primary` |
| Error text | `text-destructive` |
| Paused background | `bg-secondary` |
| Hover border | `hover:border-primary` |
| Hover shadow | `hover:shadow-md` |

### DropdownMenu Styling Overrides

The shadcn DropdownMenu defaults are close but need minor overrides to match the current context menu appearance:

```tsx
<DropdownMenuContent align="end" className="min-w-[220px] p-1.5">
  <DropdownMenuItem className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md">
    ...
  </DropdownMenuItem>
</DropdownMenuContent>
```

Destructive items use a custom className:
```tsx
<DropdownMenuItem className="gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md text-destructive focus:text-destructive focus:bg-destructive/5">
```

### Animation Approach

The current implementation uses a CSS `grid-template-rows: 0fr → 1fr` transition for smooth height animation. The shadcn Collapsible primitive uses Radix's `data-[state=open]` / `data-[state=closed]` attributes but does NOT provide built-in animation.

**Solution:** Wrap the CollapsibleContent children in a grid-rows animation div, identical to the current pattern but using Tailwind utilities:

```tsx
<CollapsibleContent forceMount className="overflow-hidden">
  <div className={cn(
    "grid transition-[grid-template-rows] duration-300",
    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
  )}>
    <div className="min-h-0 overflow-hidden px-1 pb-2 -mx-1">
      {children && (
        <div className="pt-4 flex flex-col gap-3 overflow-visible">
          {children}
        </div>
      )}
    </div>
  </div>
</CollapsibleContent>
```

**Why `forceMount`?** Radix Collapsible unmounts content when closed by default, which prevents CSS transitions. Using `forceMount` keeps the DOM present and lets the grid-rows trick handle the visual collapse with a smooth 300ms animation.

**Alternative considered:** Using `@keyframes` with `animate-accordion-down` / `animate-accordion-up` (as shadcn Accordion does). Rejected because the grid-rows approach is already proven in this codebase and provides smoother height transitions without needing to know content height upfront.

### Chevron Rotation

```tsx
<span className={cn(
  "inline-flex items-center justify-center text-tertiary-foreground shrink-0 transition-transform duration-200",
  expanded && "rotate-90"
)}>
  <CaretRight size={16} weight="bold" />
</span>
```

Replace the inline SVG with Phosphor's `CaretRight` icon for consistency.

## File Changes

### Modified Files

| File | Change |
|---|---|
| `src/components/dashboard/ConnectionRow.tsx` | Full rewrite — shadcn Collapsible + DropdownMenu + Tailwind |
| `src/components/dashboard/AutomationCard.tsx` | Full rewrite — shadcn Switch + DropdownMenu + StatusBadge + Tailwind |

### Deleted Files

| File | Reason |
|---|---|
| `src/components/dashboard/ConnectionRow.module.css` | Replaced by Tailwind utilities |
| `src/components/dashboard/AutomationCard.module.css` | Replaced by Tailwind utilities |
| `src/components/dashboard/StatusToggle.tsx` | No longer imported (AutomationCard was its only consumer) |
| `src/components/dashboard/StatusToggle.module.css` | Co-located styles for deleted component |
| `src/components/dashboard/StatusToggle.test.tsx` | Test for deleted component |

### Files NOT Deleted

| File | Reason |
|---|---|
| `src/components/dashboard/OverflowMenu.tsx` | Still imported by `CampaignFolderCard` and `JourneyCard` |
| `src/components/dashboard/OverflowMenu.module.css` | Still needed by OverflowMenu |
| `src/components/shared/Toggle.tsx` | May be used elsewhere — verify before deleting |

### New Files

None — components are rebuilt in-place.

## Event Propagation Strategy

Both components have nested interactive elements (DropdownMenu trigger, Switch) inside clickable parent containers. The strategy:

1. **DropdownMenu trigger** — Use `onClick={(e) => e.stopPropagation()}` on the trigger button. Radix DropdownMenuTrigger with `asChild` passes through to our button, so stopPropagation prevents the click from reaching the parent CollapsibleTrigger or row onClick.

2. **Switch** — Wrap in a `<div onClick={(e) => e.stopPropagation()}>` container, same as the current implementation.

3. **DropdownMenuItem callbacks** — No stopPropagation needed on menu items because DropdownMenuContent renders in a Portal (outside the DOM tree of the parent row).

## Dependencies

All already installed:
- `@radix-ui/react-collapsible` (via `src/components/ui/collapsible.tsx`)
- `@radix-ui/react-dropdown-menu` (via `src/components/ui/dropdown-menu.tsx`)
- `@radix-ui/react-switch` (via `src/components/ui/switch.tsx`)
- `@/components/composed/status-badge`
- `@/components/shared/ProtocolIcon`
- `@phosphor-icons/react`

## Error Handling

- **Connection in error state:** ConnectionRow displays error message, hides "Add Automation" menu item, applies destructive colour to ProtocolIcon. No functional change from current behaviour.
- **Delete disabled state:** When `connectors.length > 0`, the Delete Connection menu item uses `disabled` prop on `DropdownMenuItem` (Radix handles `aria-disabled` and prevents click). A `title` attribute provides the constraint explanation.
- **Missing optional callbacks:** `onEditConnection`, `onDeleteConnection`, `onActivityLog`, `onHistory` are all optional. Menu items that invoke optional callbacks use optional chaining (`onEditConnection?.(id)`).

## Testing Strategy

### Why Property-Based Testing Does Not Apply

This migration is a UI component rebuild — replacing CSS Modules with Tailwind utilities and custom shared components with shadcn primitives. The components are rendering-focused with minimal business logic:
- Conditional class application based on 2-3 status values
- Event handler delegation to parent callbacks
- No data transformation, parsing, or serialization

The input space is small and well-defined (Connection and Automation model types with a handful of status values). Example-based tests with representative data provide full coverage without the overhead of property generators.

### Unit Tests (Vitest + Testing Library)

**ConnectionRow tests:**
- Renders protocol icon, label, and connection name
- Toggles expanded state on header click
- Toggles expanded state on Enter/Space keypress
- Chevron rotates when expanded
- Displays automation count when status is "connected"
- Displays error message when status is "error"
- DropdownMenu shows correct items (connected vs error state)
- Delete Connection disabled when automations exist
- Menu item clicks invoke correct callbacks
- Menu trigger click does not toggle expand/collapse

**AutomationCard tests:**
- Renders direction icon, name, data type, and status badge
- Grid layout has 4 column groups
- Switch reflects active/paused status
- Switch click invokes onToggleStatus without triggering onViewSettings
- Paused state applies reduced opacity
- DropdownMenu shows all 5 items with correct labels
- Delete item has destructive styling and separator
- Menu item clicks invoke correct callbacks
- Row click invokes onViewSettings

### Visual Regression

Compare screenshots before/after migration to verify visual parity. Key checkpoints:
- ConnectionRow border, radius, padding
- AutomationCard grid proportions and hover state
- DropdownMenu item sizing and spacing
- Switch alignment and colour
