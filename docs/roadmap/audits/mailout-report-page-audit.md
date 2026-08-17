# MailoutReportPage Component Library Audit

> **Audited:** 2026-06-23
> **Auditor:** TFC (Component Library Architect)
> **File:** `src/pages/MailoutReportPage.tsx`
> **Reference Pages:** AccountSyncPage, DashboardPage (Connectors)

---

## Executive Summary

The MailoutReportPage contains significant library compliance gaps. It defines 7 inline components that should either use existing library components or be promoted to the library. The page also deviates from the established page layout pattern (no breadcrumb navigation) and uses PageShell in a way that differs from reference pages.

**Total issues:** 23
- **Violations:** 11 (breaks documented rules)
- **Inconsistencies:** 8 (deviates from sibling patterns)
- **Missing:** 4 (expected elements absent)

---

## Section 1: Page Layout Pattern

### Violation: Missing Breadcrumb Navigation

**Reference pattern (AccountSyncPage, DashboardPage):**
```tsx
<div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] py-7 px-6 bg-background">
  <Breadcrumb className="mb-3">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/parent">Parent Section</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Current Page</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
  
  <div className="flex items-center justify-between mb-7">
    <div>
      <h1 className="text-2xl font-semibold text-foreground m-0">{title}</h1>
      <p className="text-sm text-tertiary-foreground mt-1 mb-0 font-normal">{subtitle}</p>
    </div>
    {action}
  </div>
  {/* content */}
</div>
```

**Current (MailoutReportPage):**
- Uses `PageShell` wrapper which lacks breadcrumb support
- PageShell's title is `text-xl` vs reference pages' `text-2xl`
- No breadcrumb trail showing Campaigns → Mailouts → Report hierarchy

**Fix:** Replace PageShell with the standard page layout pattern, adding:
```tsx
<Breadcrumb className="mb-3">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/automations/campaigns">Campaigns</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/channels/mailouts">Mailouts</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>{mailout.name}</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Inconsistency: Page Title Styling

**Reference pages:** `text-2xl font-semibold`
**MailoutReportPage (via PageShell):** `text-xl font-semibold`

**Fix:** Either update PageShell to match reference pages, or stop using PageShell for this pattern.

---

## Section 2: Inline Components Should Use Library

### Violation: Hand-Rolled MetricCard

**Current inline component:**
```tsx
function MetricCard({
  label,
  value,
  icon,
  variant = 'default',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'muted';
})
```

**Library has:** `src/components/composed/metric-card.tsx`

**Gap Analysis:**
| Feature | Inline Version | Library Version | Action |
|---------|----------------|-----------------|--------|
| Icon support | Yes (React node) | No | Add to library |
| Variant colours | 4 variants | Trend direction | Extend variants |
| Value position | Centred | Header + content | Decide canonical |
| Layout | Centred vertical | Left-aligned | Add layout variant |

**Fix:** Extend library `MetricCard` with:
- `icon` prop (optional React node)
- `layout` prop: `'horizontal' | 'centered'`
- `variant` prop: `'default' | 'success' | 'warning' | 'muted'`

Then refactor page to use library component.

### Violation: Hand-Rolled LinksTable

**Current inline component:** Custom table with manual styling

**Library has:** 
- `src/components/ui/table.tsx` (Table primitives)
- `src/components/composed/data-table.tsx` (DataTable with sorting/density)

**Current table styling issues:**
- Uses `bg-muted/50` for header vs library's transparent header
- Manual `py-2.5 px-4` padding vs DataTable's density system
- Inconsistent hover: `hover:bg-muted/30` vs library's `hover:bg-secondary`
- Hand-rolled uppercase header styling

**Fix:** Replace with DataTable:
```tsx
const linkColumns: DataTableColumn<MailoutLink>[] = [
  {
    key: 'label',
    label: 'Link Name',
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <Link size={14} className="text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground">{value}</span>
      </div>
    ),
  },
  { key: 'uniqueClicks', label: 'Unique', align: 'right' },
  { key: 'totalClicks', label: 'Total', align: 'right' },
];

<DataTable
  columns={linkColumns}
  data={mailout.links}
  container="bordered"
  density="default"
  hover={true}
/>
```

### Violation: Hand-Rolled Back Button

**Current:**
```tsx
<button
  className="inline-flex items-center gap-2 px-3 py-2 bg-secondary text-foreground border border-border rounded font-medium text-sm cursor-pointer transition-colors duration-150 hover:bg-muted"
  onClick={() => navigate('/channels/mailouts')}
>
  <ArrowLeft size={16} />
  Back to Mailouts
</button>
```

**Library has:** `Button` component with `variant="secondaryOutline"`

**Fix:**
```tsx
<Button variant="secondaryOutline" onClick={() => navigate('/channels/mailouts')}>
  <ArrowLeft size={16} />
  Back to Mailouts
</Button>
```

---

## Section 3: Components to Promote to Library

The following inline components are reusable patterns that should be added to the component library:

### 1. SecondaryStatItem → `StatRow` or extend `MetricCard`

**Current:**
```tsx
function SecondaryStatItem({ label, value }: { label: string; value: string })
```

**Recommendation:** Create `StatBar` composed component:
```tsx
// src/components/composed/stat-bar.tsx
interface StatBarItem { label: string; value: string; }
interface StatBarProps { items: StatBarItem[]; }

export function StatBar({ items }: StatBarProps) {
  return (
    <Card className="flex items-center justify-between p-2 overflow-x-auto">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <Separator orientation="vertical" className="h-8" />}
          <div className="flex flex-col items-center px-4 py-2">
            <span className="text-lg font-semibold text-foreground tabular-nums">{item.value}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.label}</span>
          </div>
        </Fragment>
      ))}
    </Card>
  );
}
```

### 2. EngagementDonut → `DonutChart`

**Current:** 100-line inline SVG donut chart with legend

**Recommendation:** Create `DonutChart` component with:
- `segments` prop: `Array<{ value: number; color: string; label: string }>`
- `centerLabel` prop: optional label/value for center
- `showLegend` prop: boolean
- `size` prop: 'sm' | 'md' | 'lg'

Location: `src/components/composed/donut-chart.tsx`

### 3. MailoutActivityChart → `LineChart`

**Current:** 180-line inline SVG line chart

**Recommendation:** This is a charting concern. Two options:
1. Add lightweight chart library (e.g., recharts) as a project dependency
2. Create minimal `LineChart` composed component for prototype purposes

For prototype, create: `src/components/composed/line-chart.tsx`
- `data` prop: `Array<{ x: number | string; y: number; series?: string }>`
- `series` prop: `Array<{ key: string; color: string; label: string }>`
- `showGrid` prop: boolean
- `showDots` prop: boolean

### 4. DeviceBreakdown → `DeviceSplit` or use `DonutChart`

This is a specialized donut variant. Consider making it a usage example of `DonutChart` rather than a separate component.

---

## Section 4: Card Container Pattern

### Inconsistency: Mixed Card Patterns

**Reference pages use:**
```tsx
// Card with border (from card.tsx)
<Card className="border border-border rounded-lg bg-card">
  ...
</Card>

// Or direct div with documented classes
<div className="border border-border rounded-lg bg-card overflow-hidden">
  ...
</div>
```

**MailoutReportPage uses:**
```tsx
// Header metadata block
<div className="p-4 bg-muted/30 border border-border rounded-lg">

// Content cards
<div className="p-5 bg-background border border-border rounded-lg">
```

**Issues:**
1. Header uses `bg-muted/30` — this is not a documented token
2. Content cards use `bg-background` instead of `bg-card` token
3. Inconsistent padding (`p-4` vs `p-5`)

**Fix:** Use `Card` component with consistent patterns:
```tsx
// For metadata/info blocks (muted background)
<Card className="bg-secondary">
  <CardContent className="p-4">
    ...
  </CardContent>
</Card>

// For content sections
<Card>
  <CardHeader className="pb-0">
    <CardTitle className="text-sm font-semibold">{title}</CardTitle>
  </CardHeader>
  <CardContent>
    ...
  </CardContent>
</Card>
```

---

## Section 5: Typography & Spacing

### Violation: Inconsistent Section Headings

**Current:**
```tsx
<h3 className="text-sm font-semibold text-foreground mb-4">Engagement</h3>
```

**Reference pattern (from spacing-rhythm.md):**
```tsx
<h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
  Section Title
</h3>
```

**Fix:** Section headings in cards should either:
- Use uppercase + tracking-wide + muted-foreground for section headers
- Or use the CardTitle component pattern which is sentence case + foreground

Decide on canonical pattern and apply consistently.

### Inconsistency: Grid Gap Values

**Current:** `gap-3`, `gap-4`, `gap-6` used inconsistently
**Reference (from spacing-rhythm.md):** 
- Card grid gap: 16px (`gap-4`)
- Between page sections: 32px (`gap-8`)

**Fix:** Standardize:
- Cards in a row: `gap-4`
- Between major sections: `gap-8`

---

## Section 6: Missing Accessibility

### Missing: ARIA Labels on Interactive Charts

The SVG charts have title attributes on data points but lack:
- `role="img"` on SVG containers
- `aria-label` describing the chart
- `<title>` element within SVG for screen readers

### Missing: Table Semantics

The LinksTable has semantic `<table>` elements but lacks:
- `aria-sort` on sortable columns (if sorting is added)
- Proper `scope="col"` on header cells

---

## Section 7: Recommended Component Library Additions

### Priority 1 (Required for this page):

| Component | Location | Props |
|-----------|----------|-------|
| `StatBar` | `composed/stat-bar.tsx` | `items: Array<{label, value}>` |
| `DonutChart` | `composed/donut-chart.tsx` | `segments, centerLabel?, showLegend?, size?` |
| Extend `MetricCard` | `composed/metric-card.tsx` | Add `icon`, `layout`, `variant` |

### Priority 2 (Nice to have):

| Component | Location | Notes |
|-----------|----------|-------|
| `LineChart` | `composed/line-chart.tsx` | Or adopt a charting library |
| `DeviceSplit` | — | May just be a DonutChart usage example |
| `LinkHeatmap` | — | Probably page-specific, keep inline |

---

## Section 8: Refactoring Checklist

- [ ] Remove PageShell, use standard page layout with Breadcrumb
- [ ] Replace inline MetricCard with extended library MetricCard
- [ ] Replace inline LinksTable with DataTable
- [ ] Replace hand-rolled button with Button component
- [ ] Create StatBar component, use for secondary stats row
- [ ] Create DonutChart component, use for engagement visualization
- [ ] Standardize card containers to use Card component
- [ ] Fix section heading typography
- [ ] Standardize spacing (gap-4 for card grids, gap-8 for sections)
- [ ] Add ARIA labels to chart SVGs
- [ ] Add controller panel demo for any new composed components

---

## Appendix: Files to Modify

1. **src/components/composed/metric-card.tsx** — extend with icon, layout, variant
2. **src/components/composed/stat-bar.tsx** — create new
3. **src/components/composed/donut-chart.tsx** — create new
4. **src/pages/MailoutReportPage.tsx** — refactor to use library components
5. **src/components/layout/PageShell.tsx** — either deprecate or add breadcrumb support
