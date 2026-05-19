# Design Document

## Architecture

The CloseButton component follows the same architectural pattern as the existing `Button` component in `src/components/ui/button.tsx`:

1. **CVA variant definition** — a `closeButtonVariants` function defining base styles and size variants
2. **forwardRef component** — a `CloseButton` component using `React.forwardRef` with `asChild` support via `@radix-ui/react-slot`
3. **Named exports** — both `CloseButton` and `closeButtonVariants` exported for direct use and composition

The component lives in the `src/components/ui/` directory alongside other primitive UI components and integrates with the existing Tailwind + `cn()` styling system.

## Components

### CloseButton (`src/components/ui/close-button.tsx`)

A single-file component containing:

| Export | Type | Purpose |
|---|---|---|
| `closeButtonVariants` | CVA function | Generates class strings for size variants; usable standalone for custom compositions |
| `CloseButton` | React component | The rendered button with X icon, sr-only label, and full prop forwarding |
| `CloseButtonProps` | TypeScript interface | Props type extending `ButtonHTMLAttributes` + CVA `VariantProps` + `asChild` |

### Rendering Modes

| `asChild` | Rendered Element | Use Case |
|---|---|---|
| `false` (default) | `<button>` | Standalone close buttons (e.g. modal-header, banners) |
| `true` | Child element via `<Slot>` | Wrapping Radix primitives like `DialogClose`, `SheetPrimitive.Close` |

## Interfaces

```typescript
import { type VariantProps } from "class-variance-authority"

export interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeButtonVariants> {
  asChild?: boolean
}
```

### Size Variant Map

| Size | Container Classes | Icon Size (px) |
|---|---|---|
| `xs` | `h-5 w-5` | 12 |
| `sm` | `h-6 w-6` | 14 |
| `default` | `h-7 w-7` | 16 |
| `lg` | `h-8 w-8` | 20 |

## Data Model

No data model required — this is a stateless presentational component with no persistence or state management.

## Implementation Details

### CVA Definition

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const closeButtonVariants = cva(
  "inline-flex items-center justify-center rounded-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        xs: "h-5 w-5",
        sm: "h-6 w-6",
        default: "h-7 w-7",
        lg: "h-8 w-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)
```

### Icon Size Resolution

A lookup map inside the component maps the size variant to the Phosphor icon's `size` prop:

```typescript
const iconSizeMap: Record<NonNullable<CloseButtonProps["size"]>, number> = {
  xs: 12,
  sm: 14,
  default: 16,
  lg: 20,
}
```

### Component Body

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const iconSize = iconSizeMap[size ?? "default"]

    return (
      <Comp
        className={cn(closeButtonVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        <X size={iconSize} />
        <span className="sr-only">Close</span>
      </Comp>
    )
  }
)
CloseButton.displayName = "CloseButton"
```

### Migration Pattern

Existing inline close buttons follow two patterns:

**Pattern A — standalone button (modal-header, alert-dialog-composed):**
```tsx
// Before
<button onClick={onClose} className="shrink-0 h-6 w-6 flex items-center justify-center rounded-sm ...">
  <X size={16} />
</button>

// After
<CloseButton size="sm" onClick={onClose} />
```

**Pattern B — Radix primitive wrapper (sheet, dialog):**
```tsx
// Before
<SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm ...">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</SheetPrimitive.Close>

// After
<CloseButton asChild size="default" className="absolute right-4 top-4">
  <SheetPrimitive.Close />
</CloseButton>
```

## Error Handling

- **Missing size prop**: Falls back to `"default"` via CVA `defaultVariants`
- **Invalid children with asChild**: Follows Radix Slot behaviour — logs a warning if multiple children are provided
- **Disabled state**: Applies `disabled:pointer-events-none disabled:opacity-50` via base classes; no additional logic needed

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Base classes are always present

For any valid combination of `size` prop value (xs, sm, default, lg, or undefined), the output of `closeButtonVariants` SHALL always contain the base classes: `inline-flex`, `items-center`, `justify-center`, `rounded-sm`, `transition-colors`, `hover:bg-secondary`, and the focus-visible ring pattern.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Size variant omission equals default

For any call to `closeButtonVariants` with no `size` argument, the output SHALL be identical to calling `closeButtonVariants({ size: "default" })`.

**Validates: Requirements 2.5**

### Property 3: Custom className merges without overriding base styles

For any arbitrary className string passed to `closeButtonVariants({ size, className })`, the resulting class string SHALL contain both the base/variant classes AND the custom className (as resolved by `cn()`).

**Validates: Requirements 4.1**

### Property 4: HTML attributes are forwarded to the rendered element

For any set of standard HTML button attributes (onClick, disabled, aria-label, data-* attributes), the CloseButton SHALL forward all provided attributes to the rendered DOM element.

**Validates: Requirements 4.2**

### Property 5: Accessible name is always present

For any CloseButton rendered without an explicit `aria-label` prop, the component SHALL contain a visually hidden element with text content "Close". For any CloseButton rendered with an explicit `aria-label` prop, that label SHALL appear as an attribute on the rendered element.

**Validates: Requirements 6.1, 6.2**
