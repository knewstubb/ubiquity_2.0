import { useState } from 'react';
import { Plus, DownloadSimple, MagnifyingGlass, FunnelSimple, CaretLeft } from '@phosphor-icons/react';
import styles from './HeaderPlaygroundPage.module.css';

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
    <div className={styles.page}>
      {/* ── The Header Preview ── */}
      <div className={styles.headerPreview}>
        {/* Row 1: Breadcrumbs */}
        {showBreadcrumbs && (
          <div className={styles.breadcrumbRow}>
            <CaretLeft size={14} weight="bold" className={styles.breadcrumbBack} />
            {visibleBreadcrumbs.map((crumb, i) => (
              <span key={i} className={styles.breadcrumbItem}>
                {i > 0 && <span className={styles.breadcrumbSep}>/</span>}
                <span className={i === visibleBreadcrumbs.length - 1 ? styles.breadcrumbCurrent : styles.breadcrumbLink}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Row 2: Title + Actions */}
        <div className={styles.titleRow}>
          <div className={styles.titleGroup}>
            <div className={styles.titleWithBadge}>
              <h1 className={styles.title}>Page Title</h1>
              {showStatusBadge && (
                <span className={`${styles.badge} ${styles[`badge${statusBadge}`] || styles.badgeActive}`}>
                  {statusBadge}
                </span>
              )}
            </div>
            {showSubtitle && (
              <p className={styles.subtitle}>A brief description of what this page does and why it exists.</p>
            )}
          </div>
          <div className={styles.actions}>
            {showSecondaryAction && (
              <button type="button" className={styles.secondaryBtn}>
                <DownloadSimple size={16} weight="bold" />
                Export
              </button>
            )}
            {showPrimaryAction && (
              <button type="button" className={styles.primaryBtn}>
                <Plus size={16} weight="bold" />
                Create New
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Tabs */}
        {showTabs && (
          <div className={styles.tabRow}>
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Row 4: Filters */}
        {(showFilters || showSearch) && (
          <div className={styles.filterRow}>
            {showSearch && (
              <div className={styles.searchWrap}>
                <MagnifyingGlass size={14} weight="regular" className={styles.searchIcon} />
                <input type="text" className={styles.searchInput} placeholder="Search..." />
              </div>
            )}
            {showFilters && visibleFilters.map((filter) => (
              <button key={filter} type="button" className={styles.filterBtn}>
                <FunnelSimple size={14} weight="regular" />
                {filter}
              </button>
            ))}
            {showFilters && (
              <button type="button" className={styles.resetBtn}>Reset</button>
            )}
          </div>
        )}

        {/* Row 5: Bulk Actions */}
        {showBulkActions && (
          <div className={styles.bulkRow}>
            <span className={styles.bulkCount}>{selectedCount} items selected</span>
            <button type="button" className={styles.bulkBtn}>Move</button>
            <button type="button" className={styles.bulkBtn}>Tag</button>
            <button type="button" className={styles.bulkBtnDanger}>Delete</button>
            <button type="button" className={styles.bulkCancel}>Clear selection</button>
          </div>
        )}
      </div>

      {/* ── Body Content ── */}
      <div className={styles.contentArea}>
        {bodyLayout === 'dashboard' && <DashboardBody />}
        {bodyLayout === 'table' && <TableBody />}
        {bodyLayout === 'cards' && <CardListBody />}
        {bodyLayout === 'files' && <FileGridBody />}
        {bodyLayout === 'detail' && <DetailBody />}
        {bodyLayout === 'split' && <SplitPanelBody />}
        {bodyLayout === 'empty' && <EmptyStateBody />}
      </div>

      {/* ── Control Panel (bottom-right) ── */}
      <div className={styles.controlPanel}>
        <h3 className={styles.controlTitle}>Header Controls</h3>

        <div className={styles.controlSection}>
          <h4 className={styles.controlSectionTitle}>Toggle Elements</h4>
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

        <div className={styles.controlSection}>
          <h4 className={styles.controlSectionTitle}>Counts</h4>
          <CountRow label="Tabs" value={tabCount} min={1} max={5} onChange={setTabCount} />
          <CountRow label="Breadcrumbs" value={breadcrumbCount} min={1} max={3} onChange={setBreadcrumbCount} />
          <CountRow label="Filters" value={filterCount} min={1} max={4} onChange={setFilterCount} />
          <CountRow label="Selected Items" value={selectedCount} min={1} max={50} onChange={setSelectedCount} />
        </div>

        <div className={styles.controlSection}>
          <h4 className={styles.controlSectionTitle}>Status Badge</h4>
          <select
            className={styles.controlSelect}
            value={statusBadge}
            onChange={(e) => setStatusBadge(e.target.value)}
          >
            {SAMPLE_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.controlSection}>
          <h4 className={styles.controlSectionTitle}>Body Layout</h4>
          <select
            className={styles.controlSelect}
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
    <label className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className={styles.toggleCheckbox} />
    </label>
  );
}

function CountRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.countRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <div className={styles.countControls}>
        <button type="button" className={styles.countBtn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
        <span className={styles.countValue}>{value}</span>
        <button type="button" className={styles.countBtn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
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
    <div className={styles.dashboardGrid}>
      {metrics.map((m) => (
        <div key={m.label} className={styles.metricCard}>
          <span className={styles.metricLabel}>{m.label}</span>
          <span className={styles.metricValue}>{m.value}</span>
          <span className={styles.metricChange}>{m.change}</span>
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
    <table className={styles.dataTable}>
      <thead>
        <tr>
          <th className={styles.tableCheckCol}><input type="checkbox" /></th>
          <th className={styles.tableHeader}>Name</th>
          <th className={styles.tableHeader}>Type</th>
          <th className={styles.tableHeader}>Status</th>
          <th className={styles.tableHeader}>Last Run</th>
          <th className={styles.tableHeaderRight}>Records</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className={styles.tableRow}>
            <td className={styles.tableCheckCol}><input type="checkbox" /></td>
            <td className={styles.tableCell}><strong>{row.name}</strong></td>
            <td className={styles.tableCell}>{row.type}</td>
            <td className={styles.tableCell}>
              <span className={`${styles.tableBadge} ${styles[`tableBadge${row.status}`]}`}>{row.status}</span>
            </td>
            <td className={styles.tableCell}>{row.lastRun}</td>
            <td className={styles.tableCellRight}>{row.records}</td>
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
    <div className={styles.cardList}>
      {items.map((item) => (
        <div key={item.name} className={styles.listCard}>
          <div className={styles.listCardMain}>
            <span className={styles.listCardName}>{item.name}</span>
            <span className={`${styles.tableBadge} ${styles[`tableBadge${item.status}`]}`}>{item.status}</span>
          </div>
          <div className={styles.listCardMeta}>
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
    <div className={styles.fileGrid}>
      {files.map((file) => (
        <div key={file.name} className={styles.fileCard}>
          <div className={styles.fileThumb}>
            <span className={styles.fileExt}>{file.name.split('.').pop()?.toUpperCase()}</span>
          </div>
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileMeta}>{file.type} · {file.size}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailBody() {
  return (
    <div className={styles.detailLayout}>
      <div className={styles.detailSection}>
        <h3 className={styles.detailSectionTitle}>General Information</h3>
        <div className={styles.detailField}>
          <label className={styles.detailLabel}>Name</label>
          <input type="text" className={styles.detailInput} defaultValue="Summer Glow Campaign" />
        </div>
        <div className={styles.detailField}>
          <label className={styles.detailLabel}>Description</label>
          <textarea className={styles.detailTextarea} defaultValue="Drive summer bookings and product sales across all locations" rows={3} />
        </div>
        <div className={styles.detailRow}>
          <div className={styles.detailField}>
            <label className={styles.detailLabel}>Start Date</label>
            <input type="date" className={styles.detailInput} defaultValue="2025-11-15" />
          </div>
          <div className={styles.detailField}>
            <label className={styles.detailLabel}>End Date</label>
            <input type="date" className={styles.detailInput} defaultValue="2026-02-28" />
          </div>
        </div>
      </div>
      <div className={styles.detailSection}>
        <h3 className={styles.detailSectionTitle}>Tags</h3>
        <div className={styles.detailTags}>
          <span className={styles.detailTag}>seasonal</span>
          <span className={styles.detailTag}>summer</span>
          <span className={styles.detailTag}>national</span>
        </div>
      </div>
    </div>
  );
}

function SplitPanelBody() {
  return (
    <div className={styles.splitLayout}>
      <div className={styles.splitSidebar}>
        <h4 className={styles.splitSidebarTitle}>Navigation</h4>
        {['General', 'Permissions', 'Notifications', 'Integrations', 'Advanced'].map((item, i) => (
          <button key={item} type="button" className={`${styles.splitNavItem} ${i === 0 ? styles.splitNavItemActive : ''}`}>
            {item}
          </button>
        ))}
      </div>
      <div className={styles.splitContent}>
        <h3 className={styles.detailSectionTitle}>General Settings</h3>
        <p className={styles.splitText}>This is the main content area of a split-panel layout. The sidebar provides navigation between sections while the content area shows the active section's details.</p>
        <div className={styles.detailField}>
          <label className={styles.detailLabel}>Workspace Name</label>
          <input type="text" className={styles.detailInput} defaultValue="Serenity Spa Group" />
        </div>
        <div className={styles.detailField}>
          <label className={styles.detailLabel}>Default Timezone</label>
          <select className={styles.detailInput}><option>Pacific/Auckland</option></select>
        </div>
      </div>
    </div>
  );
}

function EmptyStateBody() {
  return (
    <div className={styles.emptyBody}>
      <div className={styles.emptyIcon}>📭</div>
      <h3 className={styles.emptyTitle}>No items yet</h3>
      <p className={styles.emptyText}>Get started by creating your first item. It only takes a moment.</p>
      <button type="button" className={styles.primaryBtn}>
        <Plus size={16} weight="bold" />
        Create First Item
      </button>
    </div>
  );
}
