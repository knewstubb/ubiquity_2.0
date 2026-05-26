import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { NumberStepper } from '@/components/composed/number-stepper'
import { CaretRight } from '@phosphor-icons/react'

type Density = 'compact' | 'default' | 'relaxed'
type BorderStyle = 'rows' | 'grid' | 'none'
type ContainerStyle = 'borderless' | 'bordered' | 'card'

const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'relaxed', label: 'Relaxed' },
]

const BORDER_OPTIONS = [
  { value: 'rows', label: 'Row borders' },
  { value: 'grid', label: 'Full grid' },
  { value: 'none', label: 'None' },
]

const CONTAINER_OPTIONS = [
  { value: 'borderless', label: 'Borderless' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'card', label: 'Card' },
]

const ALL_COLUMNS = [
  { key: 'name', label: 'Campaign' },
  { key: 'status', label: 'Status' },
  { key: 'opens', label: 'Open Rate', align: 'right' as const },
  { key: 'clicks', label: 'Click Rate', align: 'right' as const },
  { key: 'date', label: 'Date', align: 'right' as const },
]

interface CampaignRow {
  id: string
  name: string
  status: string
  opens: string
  clicks: string
  date: string
  parentId: string | null
}

// Tree data — parentId links children to parents
const campaigns: CampaignRow[] = [
  { id: 'summer', name: 'Summer Sale 2024', status: 'Sent', opens: '42.3%', clicks: '8.7%', date: '2024-06-15', parentId: null },
  { id: 'summer-a', name: 'Email Blast A', status: 'Sent', opens: '45.1%', clicks: '9.2%', date: '2024-06-15', parentId: 'summer' },
  { id: 'summer-b', name: 'Email Blast B', status: 'Sent', opens: '39.5%', clicks: '8.1%', date: '2024-06-16', parentId: 'summer' },
  { id: 'summer-b-sms', name: 'SMS Follow-up', status: 'Sent', opens: '—', clicks: '12.0%', date: '2024-06-17', parentId: 'summer-b' },
  { id: 'welcome', name: 'Welcome Series', status: 'Active', opens: '65.1%', clicks: '12.4%', date: '2024-05-01', parentId: null },
  { id: 'welcome-d1', name: 'Day 1 Email', status: 'Active', opens: '72.3%', clicks: '15.1%', date: '2024-05-01', parentId: 'welcome' },
  { id: 'welcome-d3', name: 'Day 3 Email', status: 'Active', opens: '58.0%', clicks: '9.8%', date: '2024-05-03', parentId: 'welcome' },
  { id: 'reengage', name: 'Re-engagement', status: 'Draft', opens: '—', clicks: '—', date: '2024-07-01', parentId: null },
  { id: 'launch', name: 'Product Launch', status: 'Scheduled', opens: '—', clicks: '—', date: '2024-07-10', parentId: null },
  { id: 'news42', name: 'Newsletter #42', status: 'Sent', opens: '38.9%', clicks: '5.2%', date: '2024-06-01', parentId: null },
  { id: 'flash', name: 'Flash Promo', status: 'Sent', opens: '51.2%', clicks: '11.0%', date: '2024-06-20', parentId: null },
  { id: 'loyalty', name: 'Loyalty Rewards', status: 'Active', opens: '47.8%', clicks: '9.3%', date: '2024-05-15', parentId: null },
]

const containerClasses: Record<ContainerStyle, string> = {
  borderless: '',
  bordered: 'border border-border rounded-md overflow-hidden',
  card: 'border border-border rounded-lg shadow-sm overflow-hidden',
}

const densityCell: Record<Density, string> = {
  compact: 'py-1.5 px-3 text-xs',
  default: 'py-3 px-4 text-sm',
  relaxed: 'py-4 px-4 text-sm',
}

const densityHeader: Record<Density, string> = {
  compact: 'py-1.5 px-3 text-xs',
  default: 'py-2.5 px-4 text-sm',
  relaxed: 'py-3 px-4 text-sm',
}

function getLevel(row: CampaignRow, allRows: CampaignRow[]): number {
  let level = 0
  let current = row
  while (current.parentId) {
    level++
    const parent = allRows.find((r) => r.id === current.parentId)
    if (!parent) break
    current = parent
  }
  return level
}

function getChildren(parentId: string, allRows: CampaignRow[]): CampaignRow[] {
  return allRows.filter((r) => r.parentId === parentId)
}

export default function TableDemo() {
  const [density, setDensity] = useState<Density>('default')
  const [borders, setBorders] = useState<BorderStyle>('rows')
  const [container, setContainer] = useState<ContainerStyle>('borderless')
  const [showHeader, setShowHeader] = useState(true)
  const [striped, setStriped] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(false)
  const [restrictHeight, setRestrictHeight] = useState(false)
  const [columnCount, setColumnCount] = useState(5)
  const [rowCount, setRowCount] = useState(8)
  const [nestingDepth, setNestingDepth] = useState(0)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const DEFAULTS = { density: 'default' as Density, borders: 'rows' as BorderStyle, container: 'borderless' as ContainerStyle, showHeader: true, striped: false, stickyHeader: false, restrictHeight: false, columnCount: 5, rowCount: 8, nestingDepth: 0 }

  const isDirty = density !== DEFAULTS.density || borders !== DEFAULTS.borders || container !== DEFAULTS.container || !showHeader || striped || stickyHeader || restrictHeight || columnCount !== DEFAULTS.columnCount || rowCount !== DEFAULTS.rowCount || nestingDepth !== DEFAULTS.nestingDepth

  function handleReset() {
    setDensity(DEFAULTS.density)
    setBorders(DEFAULTS.borders)
    setContainer(DEFAULTS.container)
    setShowHeader(DEFAULTS.showHeader)
    setStriped(DEFAULTS.striped)
    setStickyHeader(DEFAULTS.stickyHeader)
    setRestrictHeight(DEFAULTS.restrictHeight)
    setColumnCount(DEFAULTS.columnCount)
    setRowCount(DEFAULTS.rowCount)
    setNestingDepth(DEFAULTS.nestingDepth)
    setExpanded(new Set())
  }

  const visibleColumns = ALL_COLUMNS.slice(0, columnCount)

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Build visible rows based on nesting depth and expanded state
  const visibleRows = useMemo(() => {
    if (nestingDepth === 0) {
      // Flat — only root rows
      return campaigns.filter((r) => r.parentId === null).slice(0, rowCount)
    }

    const result: CampaignRow[] = []

    function addRow(row: CampaignRow, currentDepth: number) {
      result.push(row)
      if (currentDepth < nestingDepth && expanded.has(row.id)) {
        const children = getChildren(row.id, campaigns)
        for (const child of children) {
          addRow(child, currentDepth + 1)
        }
      }
    }

    const roots = campaigns.filter((r) => r.parentId === null)
    for (const root of roots) {
      addRow(root, 0)
      if (result.length >= rowCount) break
    }

    return result.slice(0, rowCount)
  }, [nestingDepth, expanded, rowCount])

  return (
    <div className="flex gap-4 items-stretch">
      {/* Table preview */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          containerClasses[container],
          stickyHeader && restrictHeight && 'max-h-[300px] overflow-y-auto',
        )}>
          <Table className={cn(borders === 'grid' && 'border-collapse')}>
            {showHeader && (
              <TableHeader>
                <TableRow className={cn(
                  'hover:bg-transparent',
                  stickyHeader && 'sticky top-0 z-10 bg-background',
                  borders === 'grid' && '[&>th]:border-r [&>th]:border-border/50 [&>th:last-child]:border-r-0',
                )}>
                  {visibleColumns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        densityHeader[density],
                        'font-semibold text-muted-foreground',
                        col.align === 'right' && 'text-right',
                      )}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {visibleRows.map((campaign, i) => {
                const level = getLevel(campaign, campaigns)
                const hasChildren = nestingDepth > 0 && getChildren(campaign.id, campaigns).length > 0 && level < nestingDepth
                const isExpanded = expanded.has(campaign.id)

                return (
                  <TableRow
                    key={campaign.id}
                    className={cn(
                      hasChildren ? 'hover:bg-secondary cursor-pointer' : 'hover:bg-secondary',
                      borders === 'rows' && 'border-b border-border/50 last:border-b-0',
                      borders === 'grid' && 'border-b border-border/50 [&>td]:border-r [&>td]:border-border/50 [&>td:last-child]:border-r-0',
                      borders === 'none' && 'border-0',
                      striped && i % 2 === 1 && 'bg-muted/30',
                      level === 0 && nestingDepth > 0 && 'font-semibold',
                    )}
                    onClick={hasChildren ? () => toggleExpand(campaign.id) : undefined}
                    aria-expanded={hasChildren ? isExpanded : undefined}
                  >
                    {visibleColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(
                          densityCell[density],
                          col.align === 'right' && 'text-right tabular-nums',
                          col.key === 'name' && level === 0 && 'font-medium',
                        )}
                      >
                        {col.key === 'name' ? (
                          <div className="flex items-center gap-1.5" style={{ paddingLeft: level * 24 }}>
                            {hasChildren ? (
                              <CaretRight
                                size={14}
                                weight="bold"
                                className={cn(
                                  "text-muted-foreground shrink-0 transition-transform duration-150",
                                  isExpanded && "rotate-90",
                                )}
                              />
                            ) : (
                              <span className="w-3.5 shrink-0" />
                            )}
                            <span>{campaign.name}</span>
                          </div>
                        ) : (
                          (campaign as any)[col.key]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Controls panel */}
      <div className="w-56 shrink-0 bg-secondary rounded-lg p-4 flex flex-col">
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Density</h4>
            <Select value={density} onValueChange={(v) => setDensity(v as Density)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DENSITY_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Container</h4>
            <Select value={container} onValueChange={(v) => setContainer(v as ContainerStyle)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTAINER_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Borders</h4>
            <Select value={borders} onValueChange={(v) => setBorders(v as BorderStyle)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BORDER_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">Columns</Label>
            <NumberStepper value={columnCount} onValueChange={setColumnCount} min={2} max={5} size="sm" variant="plain" />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">Rows</Label>
            <NumberStepper value={rowCount} onValueChange={setRowCount} min={2} max={12} size="sm" variant="plain" />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">Nesting Depth</Label>
            <NumberStepper value={nestingDepth} onValueChange={setNestingDepth} min={0} max={2} size="sm" variant="toggle" />
          </div>

          <div className="flex flex-col gap-2.5 pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="tbl-header" className="text-sm font-medium text-muted-foreground">Show Header</Label>
              <Switch size="sm" id="tbl-header" checked={showHeader} onCheckedChange={setShowHeader} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tbl-striped" className="text-sm font-medium text-muted-foreground">Striped</Label>
              <Switch size="sm" id="tbl-striped" checked={striped} onCheckedChange={setStriped} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tbl-sticky" className="text-sm font-medium text-muted-foreground">Sticky Header</Label>
              <Switch size="sm" id="tbl-sticky" checked={stickyHeader} onCheckedChange={setStickyHeader} />
            </div>
            {stickyHeader && (
              <div className="flex items-center justify-between">
                <Label htmlFor="tbl-restrict" className="text-sm font-medium text-muted-foreground">Restrict Height</Label>
                <Switch size="sm" id="tbl-restrict" checked={restrictHeight} onCheckedChange={setRestrictHeight} />
              </div>
            )}
          </div>
        </div>

        {/* Reset — pinned at bottom */}
        <div className="mt-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full h-7 text-xs" disabled={!isDirty} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
