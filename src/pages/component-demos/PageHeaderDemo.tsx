import { useState } from 'react'
import { Plus, DownloadSimple, MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge, type StatusBadgeVariant } from '@/components/composed/status-badge'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NumberStepper } from '@/components/composed/number-stepper'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_TABS = ['Overview', 'Contacts', 'Transactional', 'Activity', 'Settings']
const SAMPLE_BREADCRUMBS = [
  { label: 'Campaigns', path: '/automations/campaigns' },
  { label: 'Summer Glow Campaign', path: '/automations/campaigns/cmp-summer-glow' },
  { label: 'Journey Detail', path: '' },
]
const SAMPLE_FILTERS = ['Status', 'Type', 'Date Range', 'Account']
const SAMPLE_STATUS_OPTIONS = ['Active', 'Draft', 'Paused', 'Completed', 'Error']

// ---------------------------------------------------------------------------
// Status → StatusBadge variant mapping
// ---------------------------------------------------------------------------

const statusVariantMap: Record<string, StatusBadgeVariant> = {
  Active: 'active',
  Draft: 'inactive',
  Paused: 'inactive',
  Completed: 'invited',
  Error: 'error',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PageHeaderDemo() {
  // Toggle states
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true)
  const [showSubtitle, setShowSubtitle] = useState(true)
  const [showStatusBadge, setShowStatusBadge] = useState(true)
  const [showPrimaryAction, setShowPrimaryAction] = useState(true)
  const [showSecondaryAction, setShowSecondaryAction] = useState(true)
  const [showTabs, setShowTabs] = useState(true)
  const [showFilters, setShowFilters] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Variable counts
  const [tabCount, setTabCount] = useState(3)
  const [breadcrumbCount, setBreadcrumbCount] = useState(3)
  const [filterCount, setFilterCount] = useState(3)
  const [selectedCount, setSelectedCount] = useState(5)
  const [statusBadge, setStatusBadge] = useState('Active')

  // Active tab
  const [activeTab, setActiveTab] = useState(SAMPLE_TABS[0])

  // Body layout
  type BodyLayout = 'none' | 'dashboard' | 'table' | 'cards' | 'empty'
  const [bodyLayout, setBodyLayout] = useState<BodyLayout>('none')

  const visibleTabs = SAMPLE_TABS.slice(0, tabCount)
  const visibleBreadcrumbs = SAMPLE_BREADCRUMBS.slice(0, breadcrumbCount)
  const visibleFilters = SAMPLE_FILTERS.slice(0, filterCount)

  return (
    <div className="flex gap-4 items-stretch">
      {/* Preview frame */}
      <div className="flex-1 min-w-0 border border-border rounded-lg p-0 overflow-hidden">
        <div className="bg-background border-b border-border px-8 pt-4">
          {/* Row 1: Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="mb-2">
              <Breadcrumb>
                <BreadcrumbList className="text-[13px]">
                  {visibleBreadcrumbs.map((crumb, i) => (
                    <BreadcrumbItem key={i}>
                      {i > 0 && <BreadcrumbSeparator />}
                      {i === visibleBreadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          {/* Row 2: Title + Actions */}
          <div className="flex items-start justify-between gap-6 pb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-semibold text-foreground m-0">Page Title</h1>
                {showStatusBadge && (
                  <StatusBadge variant={statusVariantMap[statusBadge] || 'active'}>
                    {statusBadge}
                  </StatusBadge>
                )}
              </div>
              {showSubtitle && (
                <p className="text-sm text-tertiary-foreground m-0">A brief description of what this page does and why it exists.</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {showSecondaryAction && (
                <Button variant="outline">
                  <DownloadSimple size={16} weight="bold" />
                  Export
                </Button>
              )}
              {showPrimaryAction && (
                <Button>
                  <Plus size={16} weight="bold" />
                  Create New
                </Button>
              )}
            </div>
          </div>

          {/* Row 3: Tabs */}
          {showTabs && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent rounded-none h-auto p-0 gap-0 border-b-2 border-border -mx-8 px-8 w-[calc(100%+4rem)]">
                {visibleTabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={cn(
                      'rounded-none px-4 py-2.5 text-sm font-medium text-muted-foreground bg-transparent shadow-none border-b-2 border-transparent -mb-[2px] transition-colors duration-150 hover:text-foreground',
                      'data-[state=active]:text-primary data-[state=active]:border-b-primary data-[state=active]:font-semibold data-[state=active]:shadow-none data-[state=active]:bg-transparent'
                    )}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Row 4: Filters */}
          {(showFilters || showSearch) && (
            <div className="flex items-center gap-2 py-3 flex-wrap">
              {showSearch && (
                <div className="relative inline-flex items-center">
                  <MagnifyingGlass size={14} weight="regular" className="absolute left-2.5 text-tertiary-foreground pointer-events-none" />
                  <Input
                    type="text"
                    className="pl-8 h-8 w-[180px] text-sm"
                    placeholder="Search..."
                  />
                </div>
              )}
              {showFilters && visibleFilters.map((filter) => (
                <Button key={filter} variant="outline" size="sm">
                  <FunnelSimple size={14} weight="regular" />
                  {filter}
                </Button>
              ))}
              {showFilters && (
                <Button variant="ghost" size="sm">Reset</Button>
              )}
            </div>
          )}

          {/* Row 5: Bulk Actions */}
          {showBulkActions && (
            <div className="flex items-center gap-2.5 py-2.5 border-t border-border">
              <span className="text-[13px] font-semibold text-foreground mr-2">{selectedCount} items selected</span>
              <Button variant="outline" size="sm">Move</Button>
              <Button variant="outline" size="sm">Tag</Button>
              <Button variant="outline" size="sm" className="text-destructive border-destructive">Delete</Button>
              <Button variant="ghost" size="sm" className="ml-auto">Clear selection</Button>
            </div>
          )}
        </div>

        {/* Body content */}
        {bodyLayout !== 'none' && (
          <div className="p-6">
            {bodyLayout === 'dashboard' && <DashboardBody />}
            {bodyLayout === 'table' && <TableBody />}
            {bodyLayout === 'cards' && <CardListBody />}
            {bodyLayout === 'empty' && <EmptyBody />}
          </div>
        )}
      </div>

      {/* Controls panel */}
      <div className="w-64 shrink-0 ml-auto p-4 bg-secondary rounded-lg space-y-4">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Breadcrumbs</span>
          <NumberStepper value={breadcrumbCount} onValueChange={(v) => { setBreadcrumbCount(v); setShowBreadcrumbs(v > 0); }} min={0} max={3} size="sm" />
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subtitle</span>
          <Switch checked={showSubtitle} onCheckedChange={setShowSubtitle} />
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status Badge</span>
          <Switch checked={showStatusBadge} onCheckedChange={setShowStatusBadge} />
        </div>

        {/* Primary Action */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Primary Action</span>
          <Switch checked={showPrimaryAction} onCheckedChange={setShowPrimaryAction} />
        </div>

        {/* Secondary Action */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Secondary Action</span>
          <Switch checked={showSecondaryAction} onCheckedChange={setShowSecondaryAction} />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tabs</span>
          <NumberStepper value={tabCount} onValueChange={(v) => { setTabCount(v); setShowTabs(v > 0); }} min={0} max={5} size="sm" />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filters</span>
          <NumberStepper value={filterCount} onValueChange={(v) => { setFilterCount(v); setShowFilters(v > 0); }} min={0} max={4} size="sm" />
        </div>

        {/* Search */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Search</span>
          <Switch checked={showSearch} onCheckedChange={setShowSearch} />
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bulk Actions</span>
          <NumberStepper value={showBulkActions ? selectedCount : 0} onValueChange={(v) => { setSelectedCount(v); setShowBulkActions(v > 0); }} min={0} max={50} size="sm" />
        </div>

        {/* Status Badge */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Status Badge</span>
          <Select value={statusBadge} onValueChange={setStatusBadge}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Layout */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Body Layout</span>
          <Select value={bodyLayout} onValueChange={(v) => setBodyLayout(v as BodyLayout)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="dashboard">Dashboard (Metrics)</SelectItem>
              <SelectItem value="table">Data Table</SelectItem>
              <SelectItem value="cards">Card List</SelectItem>
              <SelectItem value="empty">Empty State</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function CountRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          className="w-6 h-6 inline-flex items-center justify-center text-sm font-semibold text-foreground bg-background border border-border rounded cursor-pointer hover:not-disabled:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <span className={`text-sm font-semibold min-w-4 text-center ${value > 0 ? 'text-primary' : 'text-foreground'}`}>{value}</span>
        <button
          type="button"
          className="w-6 h-6 inline-flex items-center justify-center text-sm font-semibold text-foreground bg-background border border-border rounded cursor-pointer hover:not-disabled:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Body Layout Components
// ---------------------------------------------------------------------------

function DashboardBody() {
  const metrics = [
    { label: 'Total Contacts', value: '45,280', change: '+12%' },
    { label: 'Active Journeys', value: '8', change: '+2' },
    { label: 'Emails Sent (MTD)', value: '12,450', change: '+8%' },
    { label: 'Open Rate', value: '34.2%', change: '-1.2%' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="bg-background border border-border rounded-lg p-4 flex flex-col gap-1">
          <span className="text-xs text-tertiary-foreground font-medium">{m.label}</span>
          <span className="text-2xl font-bold text-foreground tabular-nums">{m.value}</span>
          <span className="text-xs font-medium text-primary">{m.change}</span>
        </div>
      ))}
    </div>
  )
}

function TableBody() {
  const rows = [
    { name: 'Daily Contact Import', status: 'Active', lastRun: '2 min ago', records: '1,240' },
    { name: 'Treatment History Sync', status: 'Active', lastRun: '15 min ago', records: '890' },
    { name: 'Product Catalogue Import', status: 'Paused', lastRun: '3 days ago', records: '450' },
    { name: 'Loyalty Members Sync', status: 'Active', lastRun: '1 hour ago', records: '2,100' },
  ]

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary">
            <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Name</th>
            <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Status</th>
            <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Last Run</th>
            <th className="text-right p-3 text-xs font-semibold text-muted-foreground">Records</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-border">
              <td className="p-3 text-sm font-medium text-foreground">{row.name}</td>
              <td className="p-3 text-sm text-muted-foreground">{row.status}</td>
              <td className="p-3 text-sm text-tertiary-foreground">{row.lastRun}</td>
              <td className="p-3 text-sm text-foreground text-right tabular-nums">{row.records}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CardListBody() {
  const items = [
    { name: 'Summer Glow Campaign', status: 'Active', sent: '4,200' },
    { name: 'New Member Welcome Series', status: 'Active', sent: '1,800' },
    { name: 'Win-Back Campaign', status: 'Completed', sent: '3,100' },
    { name: 'Loyalty Programme Launch', status: 'Draft', sent: '0' },
  ]

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.name} className="bg-background border border-border rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{item.name}</span>
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">{item.status}</span>
          </div>
          <span className="text-xs text-tertiary-foreground">{item.sent} sent</span>
        </div>
      ))}
    </div>
  )
}

function EmptyBody() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-tertiary-foreground mb-4">No items to display</p>
      <Button>
        <Plus size={16} weight="bold" />
        Create First Item
      </Button>
    </div>
  )
}
