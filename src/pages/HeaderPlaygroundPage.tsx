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

      {/* ── Sample Content Area ── */}
      <div className={styles.contentArea}>
        <div className={styles.contentPlaceholder}>
          <p>Page content goes here</p>
        </div>
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
