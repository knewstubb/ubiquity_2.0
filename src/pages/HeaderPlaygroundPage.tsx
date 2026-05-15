import { useState } from 'react';
import { Plus, DownloadSimple, MagnifyingGlass, FunnelSimple, CaretLeft } from '@phosphor-icons/react';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_TABS = ['Overview', 'Contacts', 'Transactional', 'Activity', 'Settings'];
const SAMPLE_BREADCRUMBS = [
  { label: 'Campaigns', path: '/automations/campaigns' },
  { label: 'Summer Glow Campaign', path: '/automations/campaigns/cmp-summer-glow' },
  { label: 'Journey Detail', path: '' },
];
const SAMPLE_FILTERS = ['Status', 'Type', 'Date Range', 'Account'];
const SAMPLE_STATUS_OPTIONS = ['Active', 'Draft', 'Paused', 'Completed', 'Error'];

// ---------------------------------------------------------------------------
// Badge class map
// ---------------------------------------------------------------------------

const badgeClasses: Record<string, string> = {
  Active: 'bg-accent text-primary',
  Draft: 'bg-secondary text-muted-foreground',
  Paused: 'bg-warning-subtle text-warning',
  Completed: 'bg-info-subtle text-info',
  Error: 'bg-destructive-subtle text-destructive',
};

const tableBadgeClasses: Record<string, string> = {
  Active: 'bg-accent text-primary',
  Paused: 'bg-secondary text-muted-foreground',
  Error: 'bg-destructive-subtle text-destructive',
  Completed: 'bg-info-subtle text-info',
  Draft: 'bg-secondary text-tertiary-foreground',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HeaderPlaygroundPage() {
  // Toggle states
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [showStatusBadge, setShowStatusBadge] = useState(true);
  const [showPrimaryAction, setShowPrimaryAction] = useState(true);
  const [showSecondaryAction, setShowSecondaryAction] = useState(true);
  const [showTabs, setShowTabs] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Body layout
  type BodyLayout = 'dashboard' | 'table' | 'cards' | 'files' | 'detail' | 'split' | 'empty';
  const [bodyLayout, setBodyLayout] = useState<BodyLayout>('dashboard');

  // Variable counts
  const [tabCount, setTabCount] = useState(3);
  const [breadcrumbCount, setBreadcrumbCount] = useState(3);
  const [filterCount, setFilterCount] = useState(3);
  const [selectedCount, setSelectedCount] = useState(5);
  const [statusBadge, setStatusBadge] = useState('Active');

  // Active tab
  const [activeTab, setActiveTab] = useState(SAMPLE_TABS[0]);

  const visibleTabs = SAMPLE_TABS.slice(0, tabCount);
  const visibleBreadcrumbs = SAMPLE_BREADCRUMBS.slice(0, breadcrumbCount);
  const visibleFilters = SAMPLE_FILTERS.slice(0, filterCount);

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] p-0 bg-background relative">
      {/* ── The Header Preview ── */}
      <div className="bg-background border-b border-border px-8 pt-4">
        {/* Row 1: Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="flex items-center gap-1 mb-2 text-[13px]">
            <CaretLeft size={14} weight="bold" className="text-tertiary-foreground mr-1" />
            {visibleBreadcrumbs.map((crumb, i) => (
              <span key={i} className="inline-flex items-center">
                {i > 0 && <span className="mx-1.5 text-border-strong">/</span>}
                <span className={i === visibleBreadcrumbs.length - 1 ? 'text-muted-foreground' : 'text-primary cursor-pointer hover:underline'}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Row 2: Title + Actions */}
        <div className="flex items-start justify-between gap-6 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-semibold text-foreground m-0">Page Title</h1>
              {showStatusBadge && (
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-[10px] whitespace-nowrap', badgeClasses[statusBadge] || badgeClasses.Active)}>
                  {statusBadge}
                </span>
              )}
            </div>
            {showSubtitle && (
              <p className="text-sm text-tertiary-foreground m-0">A brief description of what this page does and why it exists.</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {showSecondaryAction && (
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-medium text-foreground bg-background border border-border rounded cursor-pointer hover:bg-background">
                <DownloadSimple size={16} weight="bold" />
                Export
              </button>
            )}
            {showPrimaryAction && (
              <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-semibold text-primary-foreground bg-primary border-none rounded cursor-pointer hover:bg-accent-hover">
                <Plus size={16} weight="bold" />
                Create New
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Tabs */}
        {showTabs && (
          <div className="flex gap-0 border-b-2 border-border -mx-8 px-8">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={cn(
                  'px-4 py-2.5 text-sm font-sans font-medium text-muted-foreground bg-transparent border-none border-b-2 border-transparent -mb-[2px] cursor-pointer transition-colors duration-150 hover:text-foreground',
                  activeTab === tab && 'text-primary border-b-primary font-semibold'
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Row 4: Filters */}
        {(showFilters || showSearch) && (
          <div className="flex items-center gap-2 py-3 flex-wrap">
            {showSearch && (
              <div className="relative inline-flex items-center">
                <MagnifyingGlass size={14} weight="regular" className="absolute left-2.5 text-tertiary-foreground pointer-events-none" />
                <input type="text" className="py-[7px] pr-2.5 pl-[30px] text-[13px] font-sans border border-border rounded outline-none w-[180px] text-foreground focus:border-primary focus:shadow-[--ring-shadow]" placeholder="Search..." />
              </div>
            )}
            {showFilters && visibleFilters.map((filter) => (
              <button key={filter} type="button" className="inline-flex items-center gap-[5px] py-[7px] px-3 text-[13px] font-sans font-medium text-muted-foreground bg-background border border-border rounded cursor-pointer hover:border-border-strong">
                <FunnelSimple size={14} weight="regular" />
                {filter}
              </button>
            ))}
            {showFilters && (
              <button type="button" className="py-[7px] px-3 text-[13px] font-sans font-medium text-primary bg-transparent border-none cursor-pointer hover:underline">Reset</button>
            )}
          </div>
        )}

        {/* Row 5: Bulk Actions */}
        {showBulkActions && (
          <div className="flex items-center gap-2.5 py-2.5 border-t border-border">
            <span className="text-[13px] font-semibold text-foreground mr-2">{selectedCount} items selected</span>
            <button type="button" className="px-3 py-1.5 text-[13px] font-sans font-medium text-foreground bg-background border border-border rounded cursor-pointer">Move</button>
            <button type="button" className="px-3 py-1.5 text-[13px] font-sans font-medium text-foreground bg-background border border-border rounded cursor-pointer">Tag</button>
            <button type="button" className="px-3 py-1.5 text-[13px] font-sans font-medium text-destructive bg-background border border-destructive-border rounded cursor-pointer">Delete</button>
            <button type="button" className="px-3 py-1.5 text-[13px] font-sans font-medium text-tertiary-foreground bg-transparent border-none cursor-pointer ml-auto">Clear selection</button>
          </div>
        )}
      </div>

      {/* ── Body Content ── */}
      <div className="p-8">
        {bodyLayout === 'dashboard' && <DashboardBody />}
        {bodyLayout === 'table' && <TableBody />}
        {bodyLayout === 'cards' && <CardListBody />}
        {bodyLayout === 'files' && <FileGridBody />}
        {bodyLayout === 'detail' && <DetailBody />}
        {bodyLayout === 'split' && <SplitPanelBody />}
        {bodyLayout === 'empty' && <EmptyStateBody />}
      </div>

      {/* ── Control Panel (bottom-right) ── */}
      <div className="fixed bottom-4 right-4 w-[280px] max-h-[calc(100vh-120px)] overflow-y-auto bg-background border border-border rounded-lg shadow-lg p-4 z-50 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-thumb]:rounded-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3">Header Controls</h3>

        <div className="mb-4 pb-3 border-b border-secondary">
          <h4 className="text-[11px] font-semibold text-tertiary-foreground uppercase tracking-wide mb-2">Toggle Elements</h4>
          <ToggleRow label="Breadcrumbs" checked={showBreadcrumbs} onChange={setShowBreadcrumbs} />
          <ToggleRow label="Subtitle" checked={showSubtitle} onChange={setShowSubtitle} />
          <ToggleRow label="Status Badge" checked={showStatusBadge} onChange={setShowStatusBadge} />
          <ToggleRow label="Primary Action" checked={showPrimaryAction} onChange={setShowPrimaryAction} />
          <ToggleRow label="Secondary Action" checked={showSecondaryAction} onChange={setShowSecondaryAction} />
          <ToggleRow label="Tabs" checked={showTabs} onChange={setShowTabs} />
          <ToggleRow label="Filters" checked={showFilters} onChange={setShowFilters} />
          <ToggleRow label="Search" checked={showSearch} onChange={setShowSearch} />
          <ToggleRow label="Bulk Actions" checked={showBulkActions} onChange={setShowBulkActions} />
        </div>

        <div className="mb-4 pb-3 border-b border-secondary">
          <h4 className="text-[11px] font-semibold text-tertiary-foreground uppercase tracking-wide mb-2">Counts</h4>
          <CountRow label="Tabs" value={tabCount} min={1} max={5} onChange={setTabCount} />
          <CountRow label="Breadcrumbs" value={breadcrumbCount} min={1} max={3} onChange={setBreadcrumbCount} />
          <CountRow label="Filters" value={filterCount} min={1} max={4} onChange={setFilterCount} />
          <CountRow label="Selected Items" value={selectedCount} min={1} max={50} onChange={setSelectedCount} />
        </div>

        <div className="mb-4 pb-3 border-b border-secondary">
          <h4 className="text-[11px] font-semibold text-tertiary-foreground uppercase tracking-wide mb-2">Status Badge</h4>
          <select
            className="w-full py-1.5 px-2.5 text-[13px] font-sans border border-border rounded outline-none cursor-pointer bg-background text-foreground"
            value={statusBadge}
            onChange={(e) => setStatusBadge(e.target.value)}
          >
            {SAMPLE_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mb-0 pb-0 border-b-0">
          <h4 className="text-[11px] font-semibold text-tertiary-foreground uppercase tracking-wide mb-2">Body Layout</h4>
          <select
            className="w-full py-1.5 px-2.5 text-[13px] font-sans border border-border rounded outline-none cursor-pointer bg-background text-foreground"
            value={bodyLayout}
            onChange={(e) => setBodyLayout(e.target.value as BodyLayout)}
          >
            <option value="dashboard">Dashboard (Metric Cards)</option>
            <option value="table">Data Table (Bulk Actions)</option>
            <option value="cards">Card List</option>
            <option value="files">File Grid</option>
            <option value="detail">Detail / Form</option>
            <option value="split">Split Panel</option>
            <option value="empty">Empty State</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer">
      <span className="text-[13px] text-foreground">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
    </label>
  );
}

function CountRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <button type="button" className="w-6 h-6 inline-flex items-center justify-center text-sm font-semibold text-foreground bg-secondary border-none rounded cursor-pointer hover:not-disabled:bg-background-sunken disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <span className="text-[13px] font-semibold text-foreground min-w-4 text-center">{value}</span>
        <button type="button" className="w-6 h-6 inline-flex items-center justify-center text-sm font-semibold text-foreground bg-secondary border-none rounded cursor-pointer hover:not-disabled:bg-background-sunken disabled:opacity-30 disabled:cursor-not-allowed" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
      </div>
    </div>
  );
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
    { label: 'Automations', value: '20', change: '+3' },
    { label: 'Form Submissions', value: '892', change: '+15%' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="bg-background border border-border rounded-lg p-5 flex flex-col gap-1">
          <span className="text-[13px] text-tertiary-foreground font-medium">{m.label}</span>
          <span className="text-[28px] font-bold text-foreground">{m.value}</span>
          <span className="text-[13px] font-medium text-primary">{m.change}</span>
        </div>
      ))}
    </div>
  );
}

function TableBody() {
  const rows = [
    { id: 1, name: 'Daily Contact Import', type: 'Import', status: 'Active', lastRun: '2 min ago', records: '1,240' },
    { id: 2, name: 'Treatment History Sync', type: 'Import', status: 'Active', lastRun: '15 min ago', records: '890' },
    { id: 3, name: 'Product Catalogue Import', type: 'Import', status: 'Paused', lastRun: '3 days ago', records: '450' },
    { id: 4, name: 'Loyalty Members Sync', type: 'Import', status: 'Active', lastRun: '1 hour ago', records: '2,100' },
    { id: 5, name: 'Booking Data Import', type: 'Import', status: 'Error', lastRun: '5 min ago', records: '0' },
    { id: 6, name: 'Customer Feedback Import', type: 'Import', status: 'Active', lastRun: '30 min ago', records: '320' },
  ];

  return (
    <table className="w-full border-collapse bg-background border border-border rounded-lg overflow-hidden">
      <thead>
        <tr>
          <th className="w-10 p-2.5 text-center"><input type="checkbox" /></th>
          <th className="text-left p-2.5 text-[13px] font-semibold text-muted-foreground bg-background border-b border-border">Name</th>
          <th className="text-left p-2.5 text-[13px] font-semibold text-muted-foreground bg-background border-b border-border">Type</th>
          <th className="text-left p-2.5 text-[13px] font-semibold text-muted-foreground bg-background border-b border-border">Status</th>
          <th className="text-left p-2.5 text-[13px] font-semibold text-muted-foreground bg-background border-b border-border">Last Run</th>
          <th className="text-right p-2.5 text-[13px] font-semibold text-muted-foreground bg-background border-b border-border">Records</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-secondary hover:bg-background">
            <td className="w-10 p-2.5 text-center"><input type="checkbox" /></td>
            <td className="p-2.5 text-sm text-foreground"><strong>{row.name}</strong></td>
            <td className="p-2.5 text-sm text-foreground">{row.type}</td>
            <td className="p-2.5 text-sm text-foreground">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-[10px]', tableBadgeClasses[row.status] || '')}>{row.status}</span>
            </td>
            <td className="p-2.5 text-sm text-foreground">{row.lastRun}</td>
            <td className="p-2.5 text-sm text-foreground text-right tabular-nums">{row.records}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CardListBody() {
  const items = [
    { name: 'Summer Glow Campaign', status: 'Active', journeys: 3, sent: '4,200' },
    { name: 'New Member Welcome Series', status: 'Active', journeys: 4, sent: '1,800' },
    { name: 'Win-Back Campaign', status: 'Completed', journeys: 4, sent: '3,100' },
    { name: 'Loyalty Programme Launch', status: 'Draft', journeys: 2, sent: '0' },
    { name: 'End of Year Appeal', status: 'Active', journeys: 2, sent: '5,600' },
  ];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.name} className="bg-background border border-border rounded-lg px-5 py-4 flex items-center justify-between cursor-pointer transition-shadow duration-150 hover:shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-foreground">{item.name}</span>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-[10px]', tableBadgeClasses[item.status] || '')}>{item.status}</span>
          </div>
          <div className="flex gap-4 text-[13px] text-tertiary-foreground">
            <span>{item.journeys} journeys</span>
            <span>{item.sent} sent</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FileGridBody() {
  const files = [
    { name: 'hero-banner.png', type: 'Image', size: '2.4 MB' },
    { name: 'logo-dark.svg', type: 'Image', size: '12 KB' },
    { name: 'brand-guidelines.pdf', type: 'Document', size: '4.8 MB' },
    { name: 'email-footer.html', type: 'Template', size: '3 KB' },
    { name: 'promo-video.mp4', type: 'Video', size: '18 MB' },
    { name: 'social-icons.svg', type: 'Image', size: '8 KB' },
    { name: 'terms-conditions.pdf', type: 'Document', size: '1.2 MB' },
    { name: 'header-pattern.png', type: 'Image', size: '890 KB' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {files.map((file) => (
        <div key={file.name} className="bg-background border border-border rounded-lg overflow-hidden cursor-pointer transition-shadow duration-150 hover:shadow-md">
          <div className="h-[100px] bg-secondary flex items-center justify-center">
            <span className="text-base font-bold text-tertiary-foreground tracking-wide">{file.name.split('.').pop()?.toUpperCase()}</span>
          </div>
          <div className="px-3 py-2.5 flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</span>
            <span className="text-xs text-tertiary-foreground">{file.type} · {file.size}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailBody() {
  return (
    <div className="bg-background border border-border rounded-lg p-6 max-w-[640px] flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-[15px] font-semibold text-foreground m-0">General Information</h3>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[13px] font-medium text-muted-foreground">Name</label>
          <input type="text" className="px-3 py-2 text-sm font-sans border border-border rounded outline-none text-foreground focus:border-primary focus:shadow-[--ring-shadow]" defaultValue="Summer Glow Campaign" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[13px] font-medium text-muted-foreground">Description</label>
          <textarea className="px-3 py-2 text-sm font-sans border border-border rounded outline-none text-foreground resize-y min-h-[60px] focus:border-primary focus:shadow-[--ring-shadow]" defaultValue="Drive summer bookings and product sales across all locations" rows={3} />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[13px] font-medium text-muted-foreground">Start Date</label>
            <input type="date" className="px-3 py-2 text-sm font-sans border border-border rounded outline-none text-foreground focus:border-primary focus:shadow-[--ring-shadow]" defaultValue="2025-11-15" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[13px] font-medium text-muted-foreground">End Date</label>
            <input type="date" className="px-3 py-2 text-sm font-sans border border-border rounded outline-none text-foreground focus:border-primary focus:shadow-[--ring-shadow]" defaultValue="2026-02-28" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-[15px] font-semibold text-foreground m-0">Tags</h3>
        <div className="flex gap-1.5">
          <span className="text-xs font-medium px-2.5 py-[3px] rounded-xl bg-secondary text-muted-foreground">seasonal</span>
          <span className="text-xs font-medium px-2.5 py-[3px] rounded-xl bg-secondary text-muted-foreground">summer</span>
          <span className="text-xs font-medium px-2.5 py-[3px] rounded-xl bg-secondary text-muted-foreground">national</span>
        </div>
      </div>
    </div>
  );
}

function SplitPanelBody() {
  return (
    <div className="flex gap-0 bg-background border border-border rounded-lg overflow-hidden min-h-[400px]">
      <div className="w-[200px] border-r border-border py-4 bg-background">
        <h4 className="text-[11px] font-semibold text-tertiary-foreground uppercase tracking-wide px-4 mb-2">Navigation</h4>
        {['General', 'Permissions', 'Notifications', 'Integrations', 'Advanced'].map((item, i) => (
          <button key={item} type="button" className={cn(
            'block w-full text-left px-4 py-2 text-sm font-sans text-muted-foreground bg-transparent border-none cursor-pointer hover:bg-secondary',
            i === 0 && 'text-primary font-semibold bg-accent/60 border-l-2 border-l-primary'
          )}>
            {item}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4">
        <h3 className="text-[15px] font-semibold text-foreground m-0">General Settings</h3>
        <p className="text-sm text-muted-foreground leading-normal m-0">This is the main content area of a split-panel layout. The sidebar provides navigation between sections while the content area shows the active section's details.</p>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[13px] font-medium text-muted-foreground">Workspace Name</label>
          <input type="text" className="px-3 py-2 text-sm font-sans border border-border rounded outline-none text-foreground focus:border-primary focus:shadow-[--ring-shadow]" defaultValue="Serenity Spa Group" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[13px] font-medium text-muted-foreground">Default Timezone</label>
          <select className="px-3 py-2 text-sm font-sans border border-border rounded outline-none text-foreground"><option>Pacific/Auckland</option></select>
        </div>
      </div>
    </div>
  );
}

function EmptyStateBody() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No items yet</h3>
      <p className="text-sm text-tertiary-foreground mb-6 max-w-[320px]">Get started by creating your first item. It only takes a moment.</p>
      <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-semibold text-primary-foreground bg-primary border-none rounded cursor-pointer hover:bg-accent-hover">
        <Plus size={16} weight="bold" />
        Create First Item
      </button>
    </div>
  );
}
