import { useState, useMemo } from 'react'
import { DataTable, type DataTableColumn, type DataTableDensity, type DataTableContainer } from '@/components/composed/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { NumberStepper } from '@/components/composed/number-stepper'

interface Contact {
  name: string
  email: string
  status: string
  lastActive: string
  score: string
  id: string
}

const ALL_COLUMNS: DataTableColumn<Contact>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const variant = value === 'Active' ? 'success-subtle' : value === 'Invited' ? 'info-subtle' : 'neutral-subtle'
      return <Badge variant={variant as any}>{value as string}</Badge>
    },
  },
  { key: 'lastActive', label: 'Last Active', sortable: true },
  { key: 'score', label: 'Score', sortable: true, align: 'right' },
  { key: 'id', label: 'ID', sortable: true, align: 'right' },
]

const ALL_DATA: Contact[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@acme.com', status: 'Active', lastActive: '2 hours ago', score: '92' },
  { id: '2', name: 'James Wilson', email: 'james@corp.io', status: 'Active', lastActive: '1 day ago', score: '78' },
  { id: '3', name: 'Maria Lopez', email: 'maria@startup.co', status: 'Invited', lastActive: '—', score: '—' },
  { id: '4', name: 'David Kim', email: 'david@tech.dev', status: 'Inactive', lastActive: '30 days ago', score: '45' },
  { id: '5', name: 'Emma Thompson', email: 'emma@design.io', status: 'Active', lastActive: '5 min ago', score: '88' },
  { id: '6', name: 'Liam O\'Brien', email: 'liam@agency.nz', status: 'Active', lastActive: '3 hours ago', score: '71' },
  { id: '7', name: 'Aroha Mitchell', email: 'aroha@council.govt.nz', status: 'Invited', lastActive: '—', score: '—' },
  { id: '8', name: 'Ben Upton', email: 'ben@spark.co.nz', status: 'Active', lastActive: '1 hour ago', score: '95' },
  { id: '9', name: 'Tāne Williams', email: 'tane@maori.nz', status: 'Active', lastActive: '4 hours ago', score: '67' },
  { id: '10', name: 'Pippa McKenzie', email: 'pippa@retail.co.nz', status: 'Active', lastActive: '2 days ago', score: '54' },
  { id: '11', name: 'Matt Dale', email: 'matt@logistics.nz', status: 'Inactive', lastActive: '60 days ago', score: '32' },
  { id: '12', name: 'Isla Thompson', email: 'isla@health.co.nz', status: 'Active', lastActive: '30 min ago', score: '81' },
]

const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'relaxed', label: 'Relaxed' },
]

const CONTAINER_OPTIONS = [
  { value: 'borderless', label: 'Borderless' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'card', label: 'Card' },
]

export default function DataTableDemo() {
  const [density, setDensity] = useState<DataTableDensity>('default')
  const [container, setContainer] = useState<DataTableContainer>('borderless')
  const [hover, setHover] = useState(true)
  const [striped, setStriped] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)
  const [restrictHeight, setRestrictHeight] = useState(false)
  const [columnCount, setColumnCount] = useState(5)
  const [rowCount, setRowCount] = useState(8)

  const DEFAULTS = { density: 'default' as DataTableDensity, container: 'borderless' as DataTableContainer, hover: true, striped: false, selectable: false, stickyHeader: false, showEmpty: false, restrictHeight: false, columnCount: 5, rowCount: 8 }

  const isDirty = density !== DEFAULTS.density || container !== DEFAULTS.container || !hover || striped || selectable || stickyHeader || showEmpty || restrictHeight || columnCount !== DEFAULTS.columnCount || rowCount !== DEFAULTS.rowCount

  function handleReset() {
    setDensity(DEFAULTS.density)
    setContainer(DEFAULTS.container)
    setHover(DEFAULTS.hover)
    setStriped(DEFAULTS.striped)
    setSelectable(DEFAULTS.selectable)
    setStickyHeader(DEFAULTS.stickyHeader)
    setShowEmpty(DEFAULTS.showEmpty)
    setRestrictHeight(DEFAULTS.restrictHeight)
    setColumnCount(DEFAULTS.columnCount)
    setRowCount(DEFAULTS.rowCount)
  }

  const columns = useMemo(() => ALL_COLUMNS.slice(0, columnCount), [columnCount])
  const data = useMemo(() => {
    if (showEmpty) return []
    return ALL_DATA.slice(0, rowCount)
  }, [showEmpty, rowCount])

  return (
    <div className="flex gap-4 items-stretch">
      {/* Table preview */}
      <div className="flex-1 min-w-0">
        <div className={stickyHeader && restrictHeight ? 'max-h-[300px] overflow-y-auto' : ''}>
          <DataTable
            columns={columns}
            data={data}
            density={density}
            container={container}
            hover={hover}
            striped={striped}
            selectable={selectable}
            stickyHeader={stickyHeader}
            emptyMessage="No contacts found for the selected filters."
          />
        </div>
      </div>

      {/* Controls panel */}
      <div className="w-56 shrink-0 bg-secondary rounded-lg p-4 flex flex-col">
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Density</h4>
            <Select value={density} onValueChange={(v) => setDensity(v as DataTableDensity)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DENSITY_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Container</h4>
            <Select value={container} onValueChange={(v) => setContainer(v as DataTableContainer)}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTAINER_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">Columns</Label>
            <NumberStepper value={columnCount} onValueChange={setColumnCount} min={2} max={6} size="sm" variant="plain" />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">Rows</Label>
            <NumberStepper value={rowCount} onValueChange={setRowCount} min={2} max={12} size="sm" variant="plain" />
          </div>

          <div className="flex flex-col gap-2.5 pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="dt-hover" className="text-sm font-medium text-muted-foreground">Row Hover</Label>
              <Switch size="sm" id="dt-hover" checked={hover} onCheckedChange={setHover} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dt-striped" className="text-sm font-medium text-muted-foreground">Striped</Label>
              <Switch size="sm" id="dt-striped" checked={striped} onCheckedChange={setStriped} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dt-selectable" className="text-sm font-medium text-muted-foreground">Selectable</Label>
              <Switch size="sm" id="dt-selectable" checked={selectable} onCheckedChange={setSelectable} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dt-sticky" className="text-sm font-medium text-muted-foreground">Sticky Header</Label>
              <Switch size="sm" id="dt-sticky" checked={stickyHeader} onCheckedChange={setStickyHeader} />
            </div>
            {stickyHeader && (
              <div className="flex items-center justify-between">
                <Label htmlFor="dt-height" className="text-sm font-medium text-muted-foreground">Restrict Height</Label>
                <Switch size="sm" id="dt-height" checked={restrictHeight} onCheckedChange={setRestrictHeight} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="dt-empty" className="text-sm font-medium text-muted-foreground">Empty State</Label>
              <Switch size="sm" id="dt-empty" checked={showEmpty} onCheckedChange={setShowEmpty} />
            </div>
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
