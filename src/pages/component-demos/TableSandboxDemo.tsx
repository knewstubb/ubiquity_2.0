import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { NumberStepper } from '@/components/composed/number-stepper'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Sample data — larger set for pagination demo
const CONTACTS = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@acme.com', status: 'active', lastActive: '2 hours ago', score: 92 },
  { id: '2', name: 'James Wilson', email: 'james@corp.io', status: 'active', lastActive: '1 day ago', score: 78 },
  { id: '3', name: 'Maria Lopez', email: 'maria@startup.co', status: 'invited', lastActive: '—', score: null },
  { id: '4', name: 'David Kim', email: 'david@tech.dev', status: 'inactive', lastActive: '30 days ago', score: 45 },
  { id: '5', name: 'Emma Thompson', email: 'emma@design.io', status: 'active', lastActive: '5 min ago', score: 88 },
  { id: '6', name: 'Liam O\'Brien', email: 'liam@agency.nz', status: 'active', lastActive: '3 hours ago', score: 71 },
  { id: '7', name: 'Aroha Mitchell', email: 'aroha@council.govt.nz', status: 'invited', lastActive: '—', score: null },
  { id: '8', name: 'Ben Upton', email: 'ben@spark.co.nz', status: 'active', lastActive: '1 hour ago', score: 95 },
  { id: '9', name: 'Tāne Williams', email: 'tane@maori.nz', status: 'active', lastActive: '4 hours ago', score: 67 },
  { id: '10', name: 'Pippa McKenzie', email: 'pippa@retail.co.nz', status: 'active', lastActive: '2 days ago', score: 54 },
  { id: '11', name: 'Matt Dale', email: 'matt@logistics.nz', status: 'inactive', lastActive: '60 days ago', score: 32 },
  { id: '12', name: 'Isla Thompson', email: 'isla@health.co.nz', status: 'active', lastActive: '30 min ago', score: 81 },
  { id: '13', name: 'Deborah Hall', email: 'deborah@edu.nz', status: 'invited', lastActive: '—', score: null },
  { id: '14', name: 'Pippa Taylor', email: 'pippa.t@finance.nz', status: 'active', lastActive: '6 hours ago', score: 73 },
  { id: '15', name: 'David Tui', email: 'david.t@creative.nz', status: 'active', lastActive: '1 hour ago', score: 89 },
]

type Density = 'compact' | 'default' | 'relaxed'
type BorderStyle = 'rows' | 'grid' | 'none'
type HoverStyle = 'row' | 'none'
type ContainerStyle = 'bordered' | 'borderless' | 'card'
type PaginationStyle = 'none' | 'numbered' | 'load-more'
type TabFilter = 'all' | 'active' | 'invited' | 'inactive'

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

const PAGINATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'numbered', label: 'Numbered' },
  { value: 'load-more', label: 'Load More' },
]

const ALL_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'lastActive', label: 'Last Active' },
  { key: 'score', label: 'Score', align: 'right' as const },
  { key: 'id', label: 'ID', align: 'right' as const },
]

const TAB_COUNTS: Record<TabFilter, number> = {
  all: CONTACTS.length,
  active: CONTACTS.filter((c) => c.status === 'active').length,
  invited: CONTACTS.filter((c) => c.status === 'invited').length,
  inactive: CONTACTS.filter((c) => c.status === 'inactive').length,
}

const STATUS_VARIANTS: Record<string, string> = {
  active: 'success-subtle',
  invited: 'info-subtle',
  inactive: 'neutral-subtle',
}

export default function TableSandboxDemo() {
  const [density, setDensity] = useState<Density>('default')
  const [borders, setBorders] = useState<BorderStyle>('rows')
  const [hover, setHover] = useState<HoverStyle>('row')
  const [container, setContainer] = useState<ContainerStyle>('borderless')
  const [showHeader, setShowHeader] = useState(true)
  const [striped, setStriped] = useState(false)
  const [selectable, setSelectable] = useState(false)
  const [stickyHeader, setStickyHeader] = useState(false)
  const [pagination, setPagination] = useState<PaginationStyle>('none')
  const [showTabs, setShowTabs] = useState(false)
  const [restrictHeight, setRestrictHeight] = useState(false)
  const [columnCount, setColumnCount] = useState(5)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedCount, setLoadedCount] = useState(5)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')

  const DEFAULTS = { density: 'default' as Density, borders: 'rows' as BorderStyle, hover: 'row' as HoverStyle, container: 'borderless' as ContainerStyle, showHeader: true, striped: false, selectable: false, stickyHeader: false, pagination: 'none' as PaginationStyle, showTabs: false, restrictHeight: false, columnCount: 5 }

  const isDirty = density !== DEFAULTS.density || borders !== DEFAULTS.borders || hover !== DEFAULTS.hover || container !== DEFAULTS.container || !showHeader || striped || selectable || stickyHeader || pagination !== DEFAULTS.pagination || showTabs || restrictHeight || columnCount !== DEFAULTS.columnCount

  function handleReset() {
    setDensity(DEFAULTS.density)
    setBorders(DEFAULTS.borders)
    setHover(DEFAULTS.hover)
    setContainer(DEFAULTS.container)
    setShowHeader(DEFAULTS.showHeader)
    setStriped(DEFAULTS.striped)
    setSelectable(DEFAULTS.selectable)
    setStickyHeader(DEFAULTS.stickyHeader)
    setPagination(DEFAULTS.pagination)
    setShowTabs(DEFAULTS.showTabs)
    setRestrictHeight(DEFAULTS.restrictHeight)
    setColumnCount(DEFAULTS.columnCount)
    setSelectedRows(new Set())
    setCurrentPage(1)
    setLoadedCount(5)
    setActiveTab('all')
  }

  const PAGE_SIZE = 5
  const visibleColumns = ALL_COLUMNS.slice(0, columnCount)

  // Filter by tab
  const filteredContacts = useMemo(() => {
    if (activeTab === 'all') return CONTACTS
    return CONTACTS.filter((c) => c.status === activeTab)
  }, [activeTab])

  // Paginate
  const displayedContacts = useMemo(() => {
    if (pagination === 'none') return filteredContacts
    if (pagination === 'numbered') {
      const start = (currentPage - 1) * PAGE_SIZE
      return filteredContacts.slice(start, start + PAGE_SIZE)
    }
    if (pagination === 'load-more') {
      return filteredContacts.slice(0, loadedCount)
    }
    return filteredContacts
  }, [filteredContacts, pagination, currentPage, loadedCount])

  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE)

  const densityClasses: Record<Density, string> = {
    compact: 'py-1.5 px-3 text-xs',
    default: 'py-3 px-4 text-sm',
    relaxed: 'py-4 px-4 text-sm',
  }

  const headerDensityClasses: Record<Density, string> = {
    compact: 'py-1.5 px-3 text-xs',
    default: 'py-2.5 px-4 text-sm',
    relaxed: 'py-3 px-4 text-sm',
  }

  const containerClasses: Record<ContainerStyle, string> = {
    bordered: 'border border-border rounded-md overflow-hidden',
    borderless: '',
    card: 'border border-border rounded-lg shadow-sm overflow-hidden',
  }

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedRows.size === displayedContacts.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(displayedContacts.map((c) => c.id)))
    }
  }

  const allSelected = selectedRows.size === displayedContacts.length && displayedContacts.length > 0
  const someSelected = selectedRows.size > 0 && selectedRows.size < displayedContacts.length

  function getCellValue(contact: typeof CONTACTS[0], key: string) {
    switch (key) {
      case 'name': return <span className="font-medium text-foreground">{contact.name}</span>
      case 'email': return <span className="text-muted-foreground">{contact.email}</span>
      case 'status': return (
        <Badge variant={STATUS_VARIANTS[contact.status] as any}>
          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
        </Badge>
      )
      case 'lastActive': return <span className="text-muted-foreground">{contact.lastActive}</span>
      case 'score': return <span className="text-muted-foreground">{contact.score ?? '—'}</span>
      case 'id': return <span className="text-muted-foreground">{contact.id}</span>
      default: return null
    }
  }

  return (
    <div className="flex gap-4 items-stretch">
      {/* Table preview */}
      <div className="flex-1 min-w-0">
        {/* Tabs */}
        {showTabs && (
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TabFilter); setCurrentPage(1); setLoadedCount(5); }}>
            <TabsList variant="underline">
              {(['all', 'active', 'invited', 'inactive'] as TabFilter[]).map((tab) => (
                <TabsTrigger key={tab} value={tab} badge={TAB_COUNTS[tab]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <div className={cn(
          containerClasses[container],
          stickyHeader && restrictHeight && 'max-h-[300px] overflow-y-auto',
        )}>
          <Table>
            {showHeader && (
              <TableHeader>
                <TableRow className={cn(
                  'hover:bg-transparent',
                  stickyHeader && 'sticky top-0 z-10 bg-background',
                )}>
                  {selectable && (
                    <TableHead className={cn(headerDensityClasses[density], 'w-10')}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  {visibleColumns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        headerDensityClasses[density],
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
              {displayedContacts.map((contact, index) => (
                <TableRow
                  key={contact.id}
                  className={cn(
                    hover === 'row' && 'hover:bg-secondary cursor-pointer',
                    borders === 'rows' && 'border-b border-border/50 last:border-b-0',
                    borders === 'grid' && 'border-b border-border/50',
                    borders === 'none' && 'border-0',
                    striped && index % 2 === 1 && 'bg-muted/30',
                    selectable && selectedRows.has(contact.id) && 'bg-accent/30',
                  )}
                >
                  {selectable && (
                    <TableCell className={cn(densityClasses[density], 'w-10')}>
                      <Checkbox
                        checked={selectedRows.has(contact.id)}
                        onCheckedChange={() => toggleRow(contact.id)}
                        aria-label={`Select ${contact.name}`}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        densityClasses[density],
                        col.align === 'right' && 'text-right tabular-nums',
                      )}
                    >
                      {getCellValue(contact, col.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination — numbered (using Pagination component) */}
        {pagination === 'numbered' && totalPages > 1 && (
          <Pagination className="mt-3 justify-between">
            <span className="text-xs text-muted-foreground">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredContacts.length)} of {filteredContacts.length}
            </span>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Pagination — load more */}
        {pagination === 'load-more' && loadedCount < filteredContacts.length && (
          <div className="flex justify-center mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoadedCount((c) => Math.min(c + 5, filteredContacts.length))}
            >
              Load more ({filteredContacts.length - loadedCount} remaining)
            </Button>
          </div>
        )}

        {/* Selection bar */}
        {selectable && selectedRows.size > 0 && (
          <div className="mt-3 flex items-center gap-3 px-4 py-2 bg-accent rounded-md">
            <span className="text-sm font-medium text-primary">{selectedRows.size} selected</span>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-primary font-medium h-auto p-0"
              onClick={() => setSelectedRows(new Set())}
            >
              Clear selection
            </Button>
          </div>
        )}
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
            <NumberStepper value={columnCount} onValueChange={setColumnCount} min={2} max={6} size="sm" variant="plain" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground m-0 mb-1.5">Pagination</h4>
            <Select value={pagination} onValueChange={(v) => { setPagination(v as PaginationStyle); setCurrentPage(1); setLoadedCount(5); }}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGINATION_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2.5 pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-tabs" className="text-sm font-medium text-muted-foreground">Tabs</Label>
              <Switch size="sm" id="show-tabs" checked={showTabs} onCheckedChange={setShowTabs} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-header" className="text-sm font-medium text-muted-foreground">Show Header</Label>
              <Switch size="sm" id="show-header" checked={showHeader} onCheckedChange={setShowHeader} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sticky-header" className="text-sm font-medium text-muted-foreground">Sticky Header</Label>
              <Switch size="sm" id="sticky-header" checked={stickyHeader} onCheckedChange={setStickyHeader} />
            </div>
            {stickyHeader && (
              <div className="flex items-center justify-between">
                <Label htmlFor="restrict-height" className="text-sm font-medium text-muted-foreground">Restrict Height</Label>
                <Switch size="sm" id="restrict-height" checked={restrictHeight} onCheckedChange={setRestrictHeight} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="hover-row" className="text-sm font-medium text-muted-foreground">Row Hover</Label>
              <Switch size="sm" id="hover-row" checked={hover === 'row'} onCheckedChange={(v) => setHover(v ? 'row' : 'none')} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="striped" className="text-sm font-medium text-muted-foreground">Striped</Label>
              <Switch size="sm" id="striped" checked={striped} onCheckedChange={setStriped} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="selectable" className="text-sm font-medium text-muted-foreground">Selectable</Label>
              <Switch size="sm" id="selectable" checked={selectable} onCheckedChange={setSelectable} />
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
