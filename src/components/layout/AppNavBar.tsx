import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, CaretDown } from '@phosphor-icons/react';
import { AccountSwitcher } from './AccountSwitcher';
import { RootAccountSelector } from './RootAccountSelector';
import { RoleSimulator } from './RoleSimulator';
import { WhatsNewPanel } from './WhatsNewPanel';
import { ResetAccountButton } from '../shared/ResetAccountButton';
import { ChangePasswordModal } from './ChangePasswordModal';
import { FeatureFlagsModal } from './FeatureFlagsModal';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import styles from './AppNavBar.module.css';

interface SubItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path?: string;
  subItems?: SubItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/dashboard' },
  {
    label: 'Campaigns',
    path: '/automations/campaigns',
    subItems: [
      { label: 'All Campaigns', path: '/automations/campaigns' },
      { label: 'All Journeys', path: '/automations/journeys' },
    ],
  },
  {
    label: 'Audience',
    subItems: [
      { label: 'Databases', path: '/audiences/databases' },
      { label: 'Segments', path: '/audiences/segments' },
      { label: 'Integrations', path: '/' },
      { label: 'Fields & Config', path: '/audiences/attributes' },
    ],
  },
  {
    label: 'Assets',
    subItems: [
      { label: 'Email Templates', path: '/content/templates' },
      { label: 'Brand', path: '/content/assets' },
      { label: 'Forms & Surveys', path: '/content/forms' },
      { label: 'Media Library', path: '/content/emails' },
      { label: 'SMS & Push Templates', path: '/content/sms' },
    ],
  },
  {
    label: 'Reporting',
    subItems: [
      { label: 'Overview', path: '/analytics/dashboards' },
      { label: 'Campaign Results', path: '/analytics/reports' },
      { label: 'Audience Growth', path: '/analytics/activity' },
    ],
  },
  {
    label: 'Admin',
    subItems: [
      { label: 'Brand Configuration', path: '/admin/brand' },
      { label: 'Business Rules', path: '/admin/rules' },
      { label: 'Integrations Config', path: '/admin/integrations' },
      { label: 'Users & Permissions', path: '/settings/permissions' },
      { label: 'Sending Domains', path: '/admin/domains' },
      { label: 'API & Webhooks', path: '/admin/api' },
      { label: 'Billing', path: '/admin/billing' },
    ],
  },
];

function isRouteInSection(pathname: string, item: NavItem): boolean {
  if (item.subItems) {
    return item.subItems.some(
      (sub) => pathname === sub.path || pathname.startsWith(sub.path + '/')
    );
  }
  if (item.path) {
    return pathname === item.path || pathname.startsWith(item.path + '/');
  }
  return false;
}

export function AppNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { isRouteEnabled } = useFeatureFlags();
  const { user, signOut } = useAuth();
  const { isPlatformAdmin } = usePlatformAdmin();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFlagsModal, setShowFlagsModal] = useState(false);

  // Filter nav items based on feature flags, and conditionally add admin-only items
  const filteredNavItems = useMemo(() => {
    // Build nav items with admin-only additions
    const items = NAV_ITEMS.map((item) => {
      // For the Admin dropdown, conditionally add "User Management" for platform admins
      if (item.label === 'Admin' && isPlatformAdmin && item.subItems) {
        const adminSubItems = [
          ...item.subItems,
          { label: 'User Management', path: '/admin/users' },
        ];
        return { ...item, subItems: adminSubItems };
      }
      return item;
    });

    return items.map((item) => {
      if (item.subItems) {
        const enabledSubItems = item.subItems.filter((sub) => isRouteEnabled(sub.path));
        // If all sub-items are disabled, hide the entire dropdown
        if (enabledSubItems.length === 0) return null;
        return { ...item, subItems: enabledSubItems };
      }
      // Direct nav item (like Home) — check if its path is disabled
      if (item.path && !isRouteEnabled(item.path)) return null;
      return item;
    }).filter((item): item is NavItem => item !== null);
  }, [isRouteEnabled, isPlatformAdmin]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenDropdown(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  const handleNavClick = useCallback(
    (item: NavItem) => {
      if (item.subItems) {
        setOpenDropdown((prev) => (prev === item.label ? null : item.label));
      } else if (item.path) {
        navigate(item.path);
        setOpenDropdown(null);
      }
    },
    [navigate]
  );

  const handleSubItemClick = useCallback(
    (path: string) => {
      navigate(path);
      setOpenDropdown(null);
    },
    [navigate]
  );

  return (
    <nav className={styles.nav} aria-label="Main navigation" ref={navRef}>
      <div className={styles.primaryBar}>
        {/* Logo — teal rounded square with white U */}
        <button
          type="button"
          className={styles.logoIcon}
          onClick={() => navigate('/dashboard')}
          aria-label="UbiQuity home"
        >
          <span className={styles.logoLetter}>U</span>
        </button>

        <div className={styles.verticalDivider} aria-hidden="true" />

        {/* Account Selector */}
        <AccountSwitcher />

        <div className={styles.verticalDivider} aria-hidden="true" />

        {/* Primary Nav Items */}
        <div className={styles.primaryItems}>
          {filteredNavItems.map((item) => {
            const isActive = isRouteInSection(location.pathname, item);
            const isOpen = openDropdown === item.label;

            return (
              <div key={item.label} className={styles.navItemWrapper}>
                <button
                  type="button"
                  className={`${styles.primaryItem} ${isActive ? styles.primaryItemActive : ''}`}
                  onClick={() => handleNavClick(item)}
                  aria-haspopup={item.subItems ? 'true' : undefined}
                  aria-expanded={item.subItems ? isOpen : undefined}
                >
                  {item.label}
                  {item.subItems && (
                    <span className={`${styles.caretIcon} ${isOpen ? styles.caretIconOpen : ''}`}>
                      <CaretDown size={12} weight="bold" />
                    </span>
                  )}
                </button>

                {item.subItems && isOpen && (
                  <div className={styles.dropdown} role="menu">
                    {item.subItems.map((sub) => {
                      const isSubActive =
                        location.pathname === sub.path ||
                        location.pathname.startsWith(sub.path + '/');
                      return (
                        <button
                          key={sub.path}
                          type="button"
                          role="menuitem"
                          className={`${styles.dropdownItem} ${isSubActive ? styles.dropdownItemActive : ''}`}
                          onClick={() => handleSubItemClick(sub.path)}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.spacer} />

        {/* Search Bar */}
        <button type="button" className={styles.searchBar} aria-label="Search">
          <MagnifyingGlass size={16} weight="regular" className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>Search…</span>
          <span className={styles.searchShortcut}>⌘K</span>
        </button>

        {/* What's New */}
        <WhatsNewPanel />

        {/* Role Simulator */}
        <RoleSimulator />

        {/* Right Actions — divider + avatar menu */}
        <div className={styles.rightActions}>
          <div className={styles.verticalDivider} aria-hidden="true" />
          <div className={styles.avatarWrapper}>
            <button
              type="button"
              className={styles.avatar}
              aria-label="User profile"
              title="User profile"
              onClick={() => setOpenDropdown((prev) => (prev === '_avatar' ? null : '_avatar'))}
              aria-haspopup="true"
              aria-expanded={openDropdown === '_avatar'}
            >
              <span className={styles.avatarInitials}>{user?.avatarInitials ?? 'U'}</span>
            </button>
            {openDropdown === '_avatar' && (
              <div className={`${styles.dropdown} ${styles.dropdownRight}`} role="menu">
                <RootAccountSelector onSelect={() => setOpenDropdown(null)} />
                <div className={styles.dropdownDivider} />
                <button type="button" role="menuitem" className={styles.dropdownItem} onClick={() => setOpenDropdown(null)}>Profile</button>
                <button type="button" role="menuitem" className={styles.dropdownItem} onClick={() => { setOpenDropdown(null); setShowPasswordModal(true); }}>Password</button>
                <button type="button" role="menuitem" className={styles.dropdownItem} onClick={() => { navigate('/admin/pricing'); setOpenDropdown(null); }}>Prices</button>
                <button type="button" role="menuitem" className={styles.dropdownItem} onClick={() => { navigate('/admin/header-playground'); setOpenDropdown(null); }}>Header Playground</button>
                <button type="button" role="menuitem" className={styles.dropdownItem} onClick={() => setOpenDropdown(null)}>Help</button>
                <div className={styles.dropdownDivider} />
                <button type="button" role="menuitem" className={styles.dropdownItem} onClick={() => { setOpenDropdown(null); setShowFlagsModal(true); }}>Feature Flags</button>
                <div className={styles.dropdownDivider} />
                <ResetAccountButton />
                <div className={styles.dropdownDivider} />
                <button type="button" role="menuitem" className={styles.dropdownItem} onClick={() => { setOpenDropdown(null); signOut(); }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
      {showFlagsModal && (
        <FeatureFlagsModal onClose={() => setShowFlagsModal(false)} />
      )}
    </nav>
  );
}
