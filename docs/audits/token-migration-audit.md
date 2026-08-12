# Token Migration Audit: UDS → shadcn/Tailwind

## Summary

This audit maps every UDS token from `tokens.css` to its shadcn/Tailwind equivalent. shadcn uses a semantic `background/foreground` pair convention with CSS variables exposed via `@theme inline`.

**Legend:**
- ✅ Direct mapping exists
- ⚠️ Partial match (needs adjustment)
- ❌ No shadcn equivalent (UDS-specific, needs custom token)
- 🆕 shadcn token with no UDS equivalent (gap to fill)

---

## 1. Colour Tokens — Semantic

### Core Surface Tokens

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-background-default` | #FAFAFA | `--background` | ✅ Direct |
| `--color-text-primary` | #27272A | `--foreground` | ✅ Direct |
| `--color-background-elevated` | #D4D4D8 | `--card` | ⚠️ UDS elevated = zinc-300, shadcn card is typically white. **Gap: UDS elevated is darker than expected for cards** |
| `--color-text-primary` | #27272A | `--card-foreground` | ✅ Direct |
| `--color-background-elevated` | #D4D4D8 | `--popover` | ⚠️ Same issue — popovers should be white (#FFFFFF), not zinc-300 |
| `--color-text-primary` | #27272A | `--popover-foreground` | ✅ Direct |

### Primary (Brand/Accent)

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-accent-default` | #14B88A | `--primary` | ✅ Direct |
| `--color-text-on-accent` | #FFFFFF | `--primary-foreground` | ✅ Direct |
| `--color-accent-hover` | #10A078 | — | ❌ No shadcn equivalent. Hover states handled via Tailwind `hover:` utilities |
| `--color-accent-subtle` | #E6F9F5 | `--accent` | ✅ Maps to accent (hover/highlight surface) |
| `--color-accent-text` | #0D8866 | `--accent-foreground` | ✅ Direct |
| `--color-accent-border` | #14B88A | — | ❌ No shadcn equivalent. Use `border-primary` utility |

### Secondary

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-background-subtle` | #F4F4F5 | `--secondary` | ✅ Direct |
| `--color-text-primary` | #27272A | `--secondary-foreground` | ✅ Direct |

### Muted

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-background-subtle` | #F4F4F5 | `--muted` | ✅ Direct (same as secondary) |
| `--color-text-secondary` | #71717A | `--muted-foreground` | ✅ Direct |

### Destructive

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-danger-default` | #EF4444 | `--destructive` | ✅ Direct |
| `--color-text-inverse` | #FFFFFF | `--destructive-foreground` | ✅ Direct |
| `--color-danger-hover` | #DC2626 | — | ❌ No shadcn equivalent |
| `--color-danger-subtle` | #FEF2F2 | — | ❌ No shadcn equivalent (light danger bg) |
| `--color-danger-text` | #B91C1C | — | ❌ No shadcn equivalent (danger text on light bg) |
| `--color-danger-border` | #EF4444 | — | ❌ No shadcn equivalent |

### Border & Input

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-border-default` | #E4E4E7 | `--border` | ✅ Direct |
| `--color-border-default` | #E4E4E7 | `--input` | ✅ Direct |
| `--color-border-focus` | #14B88A | `--ring` | ✅ Direct |
| `--color-border-strong` | #D4D4D8 | — | ❌ No shadcn equivalent |

### Disabled States

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-state-disabled-bg` | #E4E4E7 | — | ❌ No shadcn equivalent. Handled via `disabled:opacity-50` utility |
| `--color-state-disabled-text` | #A1A1AA | — | ❌ No shadcn equivalent |
| `--color-text-disabled` | #D4D4D8 | — | ❌ No shadcn equivalent |

### Status Colours (Warning, Success, Info, Neutral)

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-warning-default` | #F59E0B | `--warning` 🆕 | ⚠️ Not in shadcn by default — must add as custom token |
| `--color-warning-subtle` | #FFFBEB | `--warning-foreground` won't work | ❌ Need `--warning` + `--warning-foreground` pair |
| `--color-warning-text` | #92400E | `--warning-foreground` 🆕 | ⚠️ Custom addition needed |
| `--color-warning-border` | #F59E0B | — | ❌ No equivalent |
| `--color-success-default` | #14B88A | `--success` 🆕 | ⚠️ Custom addition (same as primary in UDS) |
| `--color-success-subtle` | #E6F9F5 | — | ❌ No equivalent |
| `--color-success-text` | #0D8866 | `--success-foreground` 🆕 | ⚠️ Custom addition |
| `--color-info-default` | #0EA5E9 | `--info` 🆕 | ⚠️ Custom addition |
| `--color-info-subtle` | #F0F9FF | — | ❌ No equivalent |
| `--color-info-text` | #0369A1 | `--info-foreground` 🆕 | ⚠️ Custom addition |
| `--color-neutral-default` | #71717A | — | ❌ No direct equivalent |
| `--color-neutral-subtle` | #FAFAFA | — | ❌ No direct equivalent |

### Text Hierarchy

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-text-primary` | #27272A | `--foreground` | ✅ Direct |
| `--color-text-secondary` | #71717A | `--muted-foreground` | ✅ Direct |
| `--color-text-tertiary` | #A1A1AA | — | ❌ No shadcn equivalent. Use `text-muted-foreground/60` or add custom |
| `--color-text-inverse` | #FFFFFF | — | ❌ Handled contextually (e.g. `text-primary-foreground`) |
| `--color-text-on-accent` | #FFFFFF | `--primary-foreground` | ✅ Direct |

### Background Variants

| UDS Token | Value (Light) | shadcn Token | Notes |
|---|---|---|---|
| `--color-background-default` | #FAFAFA | `--background` | ✅ Direct |
| `--color-background-subtle` | #F4F4F5 | `--muted` / `--secondary` | ✅ Direct |
| `--color-background-elevated` | #D4D4D8 | `--card` / `--popover` | ⚠️ Value mismatch — shadcn expects white for cards |
| `--color-background-sunken` | #E4E4E7 | — | ❌ No shadcn equivalent |
| `--color-background-outline` | #FAFAFA | — | ❌ No shadcn equivalent |
| `--color-background-overlay` | rgba(0,0,0,0.40) | — | ❌ No shadcn equivalent (handled inline) |

---

## 2. Colour Tokens — Primitive Palettes

shadcn doesn't use primitive palette tokens directly. Tailwind v4 provides colour utilities out of the box (`bg-zinc-100`, `text-red-500`, etc.) so these map naturally:

| UDS Palette | Tailwind Equivalent | Status |
|---|---|---|
| `--color-zinc-*` | `zinc-*` utilities | ✅ Identical values |
| `--color-mint-*` | No built-in equivalent | ❌ Custom palette needed (or use `primary-*` scale) |
| `--color-red-*` | `red-*` utilities | ✅ Identical values |
| `--color-orange-*` | `orange-*` utilities | ✅ Identical values |
| `--color-amber-*` | `amber-*` utilities | ✅ Identical values |
| `--color-purple-*` | `purple-*` utilities | ✅ Identical values |
| `--color-blue-*` | `blue-*` utilities | ✅ Identical values |
| `--color-sky-*` | `sky-*` utilities | ✅ Identical values |

**Note:** The `mint` palette is UDS-specific (your teal brand colour). You'll need to register it as a custom colour scale in the Tailwind theme.

---

## 3. Spacing

| UDS Token | Value | Tailwind Equivalent | Status |
|---|---|---|---|
| `--space-xxs` | 2px | `spacing-0.5` (2px) | ✅ |
| `--space-xs` | 4px | `spacing-1` (4px) | ✅ |
| `--space-sm` | 8px | `spacing-2` (8px) | ✅ |
| `--space-ms` | 12px | `spacing-3` (12px) | ✅ |
| `--space-md` | 16px | `spacing-4` (16px) | ✅ |
| `--space-lg` | 24px | `spacing-6` (24px) | ✅ |
| `--space-xl` | 32px | `spacing-8` (32px) | ✅ |
| `--space-xxl` | 40px | `spacing-10` (40px) | ✅ |

**Verdict:** All spacing maps perfectly to Tailwind's default scale. No custom tokens needed.

---

## 4. Border Radius

| UDS Token | Value | shadcn Token | Tailwind Utility | Status |
|---|---|---|---|---|
| `--radius-none` | 0px | — | `rounded-none` | ✅ |
| `--radius-sm` | 4px | `--radius-sm` | `rounded-sm` | ⚠️ shadcn derives sm from base: `calc(var(--radius) * 0.6)`. With base=8px → 4.8px. Close but not exact. |
| `--radius-md` | 6px | `--radius-md` | `rounded-md` | ⚠️ shadcn: `calc(var(--radius) * 0.8)` → 6.4px. Close. |
| `--radius-lg` | 8px | `--radius-lg` = `--radius` | `rounded-lg` | ✅ This IS the base radius in shadcn |
| `--radius-xl` | 12px | `--radius-xl` | `rounded-xl` | ⚠️ shadcn: `calc(var(--radius) * 1.4)` → 11.2px. Close. |
| `--radius-full` | 9999px | — | `rounded-full` | ✅ |

**Verdict:** Set `--radius: 8px` as the base. The derived scale is close enough. Or override each explicitly.

---

## 5. Typography

### Font Family

| UDS Token | Value | Tailwind Equivalent | Status |
|---|---|---|---|
| `--font-family-primary` | Inter | `--font-sans` | ✅ Direct |
| `--font-family-mono` | JetBrains Mono | `--font-mono` | ✅ Direct |

### Font Size

| UDS Token | Value | Tailwind Utility | Status |
|---|---|---|---|
| `--font-size-xxs` | 8px | — | ❌ No default Tailwind equivalent (smallest is `text-xs` = 12px) |
| `--font-size-xs` | 10px | — | ❌ No default (Tailwind `text-xs` = 12px) |
| `--font-size-sm` | 12px | `text-xs` (12px) | ⚠️ Name mismatch: UDS "sm" = Tailwind "xs" |
| `--font-size-base` | 14px | `text-sm` (14px) | ⚠️ Name mismatch: UDS "base" = Tailwind "sm" |
| `--font-size-lg` | 16px | `text-base` (16px) | ⚠️ Name mismatch: UDS "lg" = Tailwind "base" |
| `--font-size-xl` | 18px | `text-lg` (18px) | ⚠️ Name mismatch |
| `--font-size-2xl` | 24px | `text-2xl` (24px) | ✅ Direct |
| `--font-size-3xl` | 30px | `text-3xl` (30px) | ✅ Direct |
| `--font-size-4xl` | 36px | `text-4xl` (36px) | ✅ Direct |
| `--font-size-5xl` | 48px | `text-5xl` (48px) | ✅ Direct |

**Key issue:** UDS font sizes are shifted down by one step compared to Tailwind defaults. UDS "base" is 14px but Tailwind "base" is 16px. This means either:
1. Override Tailwind's font size scale to match UDS, or
2. Accept the naming mismatch and document the mapping

### Font Weight

| UDS Token | Value | Tailwind Utility | Status |
|---|---|---|---|
| `--font-weight-light` | 300 | `font-light` | ✅ |
| `--font-weight-normal` | 400 | `font-normal` | ✅ |
| `--font-weight-medium` | 500 | `font-medium` | ✅ |
| `--font-weight-semibold` | 600 | `font-semibold` | ✅ |
| `--font-weight-bold` | 700 | `font-bold` | ✅ |

**Verdict:** All weights map perfectly.

---

## 6. Shadows

| UDS Token | Value | Tailwind Utility | Status |
|---|---|---|---|
| `--shadow-s` | 2px blur + border ring | `shadow-sm` | ⚠️ Different value — UDS includes a 1px border ring, Tailwind doesn't |
| `--shadow-m` | 4px blur + border ring | `shadow-md` | ⚠️ Same issue |
| `--shadow-l` | 10px blur + border ring | `shadow-lg` | ⚠️ Same issue |
| `--shadow-xl` | 20px blur + border ring | `shadow-xl` | ⚠️ Same issue |
| `--shadow-focus` | 2px teal ring | `ring-2 ring-ring` | ✅ Handled by ring utilities |

**Key issue:** UDS shadows include a `0 0 0 1px border` as part of the shadow. Tailwind shadows don't. Options:
1. Override Tailwind shadow scale with UDS values in `@theme`
2. Use `shadow-sm ring-1 ring-border` pattern (combines shadow + border)

---

## 7. Transitions

| UDS Token | Value | Tailwind Equivalent | Status |
|---|---|---|---|
| `--transition-fast` | 150ms ease | `duration-150 ease-out` | ⚠️ Close (different easing) |
| `--transition-base` | 200ms ease-in-out | `duration-200 ease-in-out` | ✅ Direct |
| `--transition-slow` | 300ms ease | `duration-300 ease-out` | ⚠️ Close |

**Verdict:** Tailwind handles transitions via utility classes. No CSS variable needed.

---

## 8. Tokens shadcn Expects That UDS Doesn't Have

| shadcn Token | Purpose | Recommended UDS Value |
|---|---|---|
| `--chart-1` through `--chart-5` | Chart colour palette | Use mint-500, blue-500, amber-500, purple-500, sky-500 |
| `--sidebar` | Sidebar background | Use `--color-background-subtle` (#F4F4F5) |
| `--sidebar-foreground` | Sidebar text | Use `--color-text-primary` (#27272A) |
| `--sidebar-primary` | Active sidebar item | Use `--color-accent-default` (#14B88A) |
| `--sidebar-primary-foreground` | Active sidebar item text | Use `--color-text-on-accent` (#FFFFFF) |
| `--sidebar-accent` | Sidebar hover state | Use `--color-accent-subtle` (#E6F9F5) |
| `--sidebar-accent-foreground` | Sidebar hover text | Use `--color-accent-text` (#0D8866) |
| `--sidebar-border` | Sidebar dividers | Use `--color-border-default` (#E4E4E7) |
| `--sidebar-ring` | Sidebar focus ring | Use `--color-border-focus` (#14B88A) |

---

## 9. Gaps & Decisions Needed

### Critical Gaps (UDS tokens with no shadcn home)

1. **Status colour system** — UDS has warning/success/info/neutral each with default/subtle/text/border variants. shadcn only has `destructive`. You need to add `--warning`, `--success`, `--info` as custom tokens.

2. **Disabled states** — UDS has explicit `--color-state-disabled-bg` and `--color-state-disabled-text`. shadcn uses `disabled:opacity-50`. Decision: keep custom tokens or adopt opacity approach?

3. **Text hierarchy (3 levels)** — UDS has primary/secondary/tertiary. shadcn has foreground/muted-foreground (2 levels). Need a custom `--tertiary-foreground` or use opacity.

4. **Background-elevated** — UDS value (#D4D4D8 / zinc-300) is unusually dark for cards/popovers. shadcn expects white. This looks like a Figma token issue — cards and popovers in your screenshots are white, not grey.

5. **Hover variants** — UDS has explicit `--color-accent-hover`, `--color-danger-hover`. shadcn handles hover via Tailwind utilities (`hover:bg-primary/90`). No CSS variable needed.

6. **Border variants** — UDS has `--color-*-border` for each status colour. shadcn uses `border-destructive` etc. Need custom tokens for warning/success/info borders.

7. **Subtle backgrounds** — UDS has `--color-danger-subtle`, `--color-warning-subtle`, etc. (light tinted backgrounds for alerts). No shadcn equivalent — need custom tokens.

8. **Font size scale mismatch** — UDS base is 14px, Tailwind base is 16px. Need to decide: override Tailwind's scale or accept the shift.

### Recommended Custom Tokens to Add

```css
/* Status colours (not in shadcn by default) */
--warning: #F59E0B;
--warning-foreground: #92400E;
--success: #14B88A;
--success-foreground: #0D8866;
--info: #0EA5E9;
--info-foreground: #0369A1;

/* Subtle backgrounds for status alerts */
--warning-subtle: #FFFBEB;
--success-subtle: #E6F9F5;
--info-subtle: #F0F9FF;
--destructive-subtle: #FEF2F2;

/* Text hierarchy */
--tertiary-foreground: #A1A1AA;

/* Disabled (if keeping explicit tokens) */
--disabled: #E4E4E7;
--disabled-foreground: #A1A1AA;

/* Charts */
--chart-1: #14B88A;
--chart-2: #3B82F6;
--chart-3: #F59E0B;
--chart-4: #A855F7;
--chart-5: #0EA5E9;
```

---

## 10. Migration Strategy

### Phase 1: Fix `globals.css` theme block
Replace the current `@theme` with shadcn's standard token names, using UDS hex values. This is what makes shadcn components work.

### Phase 2: Keep `tokens.css` as-is
Existing CSS Modules components still reference `var(--color-accent-default)` etc. Don't break them.

### Phase 3: Add backward-compatible aliases
In `tokens.css`, add aliases from old names → new shadcn names so both systems work:
```css
--color-accent-default: var(--primary);
```

### Phase 4: Migrate CSS Modules to Tailwind (per-component)
As each component is migrated, switch from `var(--color-accent-default)` to `bg-primary` utilities.

### Phase 5: Remove `tokens.css` aliases
Once all components are migrated, remove the old token names.
