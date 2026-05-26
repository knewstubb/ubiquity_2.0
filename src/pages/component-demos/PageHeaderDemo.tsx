import { useState } from 'react'
import { Plus, DownloadSimple, MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const SAMPLE_TABS = ['Overview', 'Contacts', 'Transactional', 'Activity', 'Settings']
const SAMPLE_BREADCRUMBS = [
  { label: 'Campaigns', path: '/automations/campaigns' },
  { label: 'Summer Glow Campaign', path: '/automations/campaigns/cmp-summer-glow' },
  { label: 'Journey Detail', path: '' },
]
const SAMPLE_FILTERS = ['Status', 'Type', 'Date Range', 'Account']

const statusVariantMap: Record<string, string> = {
  Active: 'success-subtle',
  Draft: 'neutral-subtle',
  Invited: 'info-subtle',
  Paused: 'neutral-subtle',
  Completed: 'info-subtle',
  Error: 'error-subtle',
}

interface PageHeaderDemoProps {
  'breadcrumb-count'?: number
  'show-subtitle'?: boolean
  'show-status'?: boolean
  status?: string
  'show-primary-action'?: boolean
  'show-secondary-action'?: boolean
  'tab-count'?: number
  'filter-count'?: number
  'show-search'?: boolean
  'bulk-count'?: number
  'body-layout'?: string
}

export default function PageHeaderDemo(props: PageHeaderDemoProps) {
  const [activeTab, setActiveTab] = useState(SAMPLE_TABS[0])
  const hasControls = props['breadcrumb-count'] !== undefined

  if (!hasControls) {
    return <PageHeaderPreview
      breadcrumbCount={3}
      showSubtitle={true}
      showStatus={true}
      status="Active"
      showPrimaryAction={true}
      showSecondaryAction={true}
      tabCount={3}
      filterCount={3}
      showSearch={true}
      bulkCount={0}
      bodyLayout="none"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  }

  return <PageHeaderPreview
    breadcrumbCount={props['breadcrumb-count'] ?? 3}
    showSubtitle={props['show-subtitle'] ?? true}
    showStatus={props['show-status'] ?? true}
    status={props.status ?? 'Active'}
    showPrimaryAction={props['show-primary-action'] ?? true}
    showSecondaryAction={props['show-secondary-action'] ?? true}
    tabCount={props['tab-count'] ?? 3}
    filterCount={props['filter-count'] ?? 3}
    showSearch={props['show-search'] ?? true}
    bulkCount={props['bulk-count'] ?? 0}
    bodyLayout={props['body-layout'] ?? 'none'}
    activeTab={activeTab}
    onTabChange={setActiveTab}
  />
}

function PageHeaderPreview({
  breadcrumbCount,
  showSubtitle,
  showStatus,
  status,
  showPrimaryAction,
  showSecondaryAction,
  tabCount,
  filterCount,
  showSearch,
  bulkCount,
  bodyLayout,
  activeTab,
  onTabChange,
}: {
  breadcrumbCount: number
  showSubtitle: boolean
  showStatus: boolean
  status: string
  showPrimaryAction: boolean
  showSecondaryAction: boolean
  tabCount: number
  filterCount: number
  showSearch: boolean
  bulkCount: number
  bodyLayout: string
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const visibleTabs = SAMPLE_TABS.slice(0, tabCount)
  const visibleBreadcrumbs = SAMPLE_BREADCRUMBS.slice(0, breadcrumbCount)
  const visibleFilters = SAMPLE_FILTERS.slice(0, filterCount)
  const showBulkActions = bulkCount > 0

  return (
    <div className="border border-border rounded-lg overflow-hidden w-full">
      <div className="bg-background border-b border-border px-8 pt-4">
        {/* Row 1: Breadcrumbs */}
        {breadcrumbCount > 0 && (
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
              {showStatus && (
                <Badge variant={(statusVariantMap[status] || 'success-subtle') as any}>
                  {status}
                </Badge>
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
        {tabCount > 0 && (
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList variant="underline" className="-mx-8 px-8 w-[calc(100%+4rem)]">
              {visibleTabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Row 4: Filters */}
        {(filterCount > 0 || showSearch) && (
          <div className="flex items-center gap-2 py-3 flex-wrap">
            {showSearch && (
              <div className="relative inline-flex items-center">
                <MagnifyingGlass size={14} weight="regular" className="absolute left-2.5 text-tertiary-foreground pointer-events-none" />
                <Input type="text" className="pl-8 h-8 w-[180px] text-sm" placeholder="Search..." />
              </div>
            )}
            {filterCount > 0 && visibleFilters.map((filter) => (
              <Button key={filter} variant="outline" size="sm">
                <FunnelSimple size={14} weight="regular" />
                {filter}
              </Button>
            ))}
            {filterCount > 0 && (
              <Button variant="ghost" size="sm">Reset</Button>
            )}
          </div>
        )}

        {/* Row 5: Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-2.5 py-2.5 border-t border-border">
            <span className="text-[13px] font-semibold text-foreground mr-2">{bulkCount} items selected</span>
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
  )
}

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
