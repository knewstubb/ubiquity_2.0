# Design: Rebuild Connection Modals with shadcn

## Overview

Rebuild `CreateConnectionModal` and `InitialModal` using the shadcn component library (Dialog, Button, Input, Label, Select, ToggleGroup, Textarea) and the new composed `CardSelector`. Replace CSS Modules with Tailwind utility classes. Preserve all existing functionality and visual appearance.

## Architecture

### Component Mapping

| Old Component | Replacement |
|---|---|
| Custom backdrop + dialog div | `Dialog` / `DialogContent` from `@/components/ui/dialog` |
| `Modal` (shared) | `Dialog` + `DialogHeader` + `DialogFooter` |
| `CardSelector` (shared, CSS Modules) | `CardSelector` from `@/components/composed/card-selector` |
| `TextField` (shared) | `Label` + `Input` from `@/components/ui/` |
| `<select>` with CSS Module class | `Select` from `@/components/ui/select` |
| `<textarea>` with CSS Module class | `Textarea` from `@/components/ui/textarea` |
| Auth toggle buttons | `ToggleGroup` from `@/components/ui/toggle-group` |
| Custom footer buttons | `Button` from `@/components/ui/button` |
| CSS Module styles | Tailwind utility classes via `cn()` |

### File Changes

**New files:**
- None — components are rebuilt in-place

**Modified files:**
- `src/components/dashboard/CreateConnectionModal.tsx` — full rewrite
- `src/components/dashboard/InitialModal.tsx` — full rewrite

**Deleted files:**
- `src/components/dashboard/CreateConnectionModal.module.css`
- `src/components/dashboard/InitialModal.module.css`

### Dialog Configuration

Both modals use shadcn `Dialog` in controlled mode (`open` + `onOpenChange`):

```tsx
<Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
  <DialogContent className="max-w-[520px]">
    ...
  </DialogContent>
</Dialog>
```

- `CreateConnectionModal`: `max-w-[560px]` (matches current `maxWidth`)
- `InitialModal`: `max-w-[520px]` (matches current `maxWidth`)

### Multi-step Pattern (CreateConnectionModal)

The CreateConnectionModal has a 2-step wizard. This is handled with internal state (`step`) — the Dialog stays open while content swaps between steps. The footer buttons change based on step:

- Step 1: Cancel + Next
- Step 2: Back + Cancel + Create/Update

### Form Fields

Replace the custom `TextField` with shadcn primitives:

```tsx
<div className="space-y-2">
  <Label htmlFor="conn-name">Connection Name</Label>
  <Input id="conn-name" placeholder="Enter connection name" value={name} onChange={...} />
</div>
```

For selects (AWS Region, Auth Method):

```tsx
<div className="space-y-2">
  <Label htmlFor="aws-region">AWS Region</Label>
  <Select value={awsRegion} onValueChange={setAwsRegion}>
    <SelectTrigger id="aws-region">
      <SelectValue placeholder="Select Region" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="us-east-1">us-east-1</SelectItem>
      ...
    </SelectContent>
  </Select>
</div>
```

### CardSelector Usage

The new composed `CardSelector` at `@/components/composed/card-selector` has the same props interface as the old shared one. Direct swap:

```tsx
import { CardSelector } from '@/components/composed/card-selector'
```

### Toggle Group (SFTP Auth Method)

Replace the custom auth toggle buttons with shadcn `ToggleGroup`:

```tsx
<ToggleGroup type="single" value={sftpAuthMethod} onValueChange={(v) => v && setSftpAuthMethod(v as SftpAuthMethod)}>
  <ToggleGroupItem value="password">Password</ToggleGroupItem>
  <ToggleGroupItem value="ssh-key">SSH Key</ToggleGroupItem>
</ToggleGroup>
```

### Test Connection Row

Stays as a custom layout using Tailwind utilities — no shadcn component needed. Uses `Button` variant="outline" for the test button and a success indicator.

## Styling Approach

- All layout via Tailwind utilities (`flex`, `gap-4`, `space-y-4`, etc.)
- Semantic colours via shadcn tokens (`text-foreground`, `bg-secondary`, `text-muted-foreground`)
- No CSS Modules — delete both `.module.css` files
- Use `cn()` for conditional classes

## Constraints

- Preserve all existing functionality (create, edit, test connection, multi-step)
- Preserve the same prop interfaces (`CreateConnectionModalProps`, `InitialModalProps`)
- No changes to parent components that consume these modals
- Accessibility: Dialog handles focus trap and Escape key via Radix primitives (remove manual `keydown` listener)
- The `InitialModal` no longer wraps the shared `Modal` component — it uses `Dialog` directly

## Dependencies

- `@radix-ui/react-dialog` (already installed via shadcn)
- `@radix-ui/react-select` (already installed via shadcn)
- `@/components/ui/dialog`
- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/select`
- `@/components/ui/textarea`
- `@/components/ui/toggle-group`
- `@/components/composed/card-selector`
