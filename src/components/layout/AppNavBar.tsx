import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { AccountSwitcher } from './AccountSwitcher';
import { RootAccountSelector } from './RootAccountSelector';
import { RoleSimulator } from './RoleSimulator';
import { WhatsNewPanel } from './WhatsNewPanel';
import { ResetAccountButton } from '../shared/ResetAccountButton';
import { ChangePasswordModal } from './ChangePasswordModal';
import { FeatureFlagsModal } from './FeatureFlagsModal';
import { Switch } from '../ui/switch';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformAdmin } from '../../contexts/PlatformAdminContext';
import { cn } from '../../lib/utils';

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
      { label: 'Connectors', path: '/' },
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
      { label: 'Account Sync', path: '/admin/account-sync' },
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
  const navRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { isRouteEnabled } = useFeatureFlags();
  const { user, signOut } = useAuth();
  const { isPlatformAdmin } = usePlatformAdmin();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFlagsModal, setShowFlagsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Filter nav items based on feature flags, and conditionally add admin-only items
  const filteredNavItems = useMemo(() => {
    const items = NAV_ITEMS.map((item) => {
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
        if (enabledSubItems.length === 0) return null;
        return { ...item, subItems: enabledSubItems };
      }
      if (item.path && !isRouteEnabled(item.path)) return null;
      return item;
    }).filter((item): item is NavItem => item !== null);
  }, [isRouteEnabled, isPlatformAdmin]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close avatar dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenDropdown(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // NavigationMenu controlled value — reset on route change
  const [navValue, setNavValue] = useState('');

  useEffect(() => {
    setNavValue('');
    setOpenDropdown(null);
  }, [location.pathname]);

  return (
    <nav className="relative top-0 z-50 bg-background border-b border-border h-14" aria-label="Main navigation" ref={navRef}>
      <div className="flex items-center pl-6 pr-4 h-full">
        {/* Logo — teal rounded square with white U */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg border-none cursor-pointer shrink-0 transition-opacity duration-150 hover:opacity-90"
          onClick={() => navigate('/dashboard')}
          aria-label="UbiQuity home"
        >
          <span className="font-sans text-lg font-bold leading-none text-primary-foreground">U</span>
        </button>

        <div className="w-px h-5 bg-border shrink-0 mx-3" aria-hidden="true" />

        {/* Account Selector */}
        <AccountSwitcher />

        <div className="w-px h-5 bg-border shrink-0 mx-3" aria-hidden="true" />

        {/* Primary Nav Items — shadcn NavigationMenu */}
        <NavigationMenu className="h-full" value={navValue} onValueChange={setNavValue}>
          <NavigationMenuList className="h-full space-x-0 gap-1">
            {filteredNavItems.map((item) => {
              const isActive = isRouteInSection(location.pathname, item);

              // Items without sub-items navigate directly
              if (!item.subItems) {
                return (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      active={isActive}
                      className={cn(navigationMenuTriggerStyle(), "relative cursor-pointer")}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.path) navigate(item.path);
                      }}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              }

              // Items with sub-items use trigger + content
              return (
                <NavigationMenuItem key={item.label} value={item.label}>
                  <NavigationMenuTrigger active={isActive}>
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-0.5 p-1.5 min-w-[180px]">
                      {item.subItems.map((sub) => {
                        const isSubActive =
                          location.pathname === sub.path ||
                          location.pathname.startsWith(sub.path + '/');
                        return (
                          <li key={sub.path}>
                            <NavigationMenuLink asChild>
                              <a
                                className={cn(
                                  "block select-none rounded-md px-2.5 py-2 no-underline outline-none transition-colors hover:bg-secondary hover:text-primary",
                                  "text-[13px] font-medium",
                                  isSubActive ? "text-primary" : "text-foreground"
                                )}
                                href={sub.path}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(sub.path);
                                }}
                              >
                                {sub.label}
                              </a>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1" />

        {/* Search Bar */}
        <button
          type="button"
          className="flex items-center gap-1.5 w-[200px] h-8 px-2.5 bg-secondary border border-border rounded-md cursor-pointer shrink-0 transition-colors duration-150 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
          aria-label="Search"
        >
          <MagnifyingGlass size={16} weight="regular" className="text-muted-foreground shrink-0" />
          <span className="font-sans text-[13px] text-tertiary-foreground flex-1 text-left">Search…</span>
          <span className="flex items-center justify-center px-[5px] py-0.5 bg-background-elevated border border-border rounded text-[11px] text-tertiary-foreground leading-none shrink-0">⌘K</span>
        </button>

        {/* What's New */}
        <WhatsNewPanel />

        {/* Role Simulator */}
        <RoleSimulator />

        {/* Right Actions — divider + avatar menu */}
        <div className="flex items-center gap-1 shrink-0 pl-2">
          <div className="w-px h-5 bg-border shrink-0 mx-3" aria-hidden="true" />
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-full border-none bg-accent cursor-pointer transition-opacity duration-150 shrink-0 hover:opacity-85"
              aria-label="User profile"
              title="User profile"
              onClick={() => setOpenDropdown((prev) => (prev === '_avatar' ? null : '_avatar'))}
              aria-haspopup="true"
              aria-expanded={openDropdown === '_avatar'}
            >
              <span className="font-sans text-[11px] font-semibold leading-none text-accent-foreground tracking-[0.02em]">{user?.avatarInitials ?? 'U'}</span>
            </button>
            {openDropdown === '_avatar' && (
              <div className="absolute top-full right-0 min-w-[180px] bg-background border border-border rounded-lg shadow-[0px_4px_12px_rgba(0,0,0,0.08)] p-1 z-[100]" role="menu">
                <RootAccountSelector onSelect={() => setOpenDropdown(null)} />
                <div className="h-px bg-border my-1" />
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => setOpenDropdown(null)}>Profile</button>
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => { setOpenDropdown(null); setShowPasswordModal(true); }}>Password</button>
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => { navigate('/admin/pricing'); setOpenDropdown(null); }}>Prices</button>
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => { navigate('/admin/components'); setOpenDropdown(null); }}>Component Library</button>
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => { navigate('/admin/filter-sandbox'); setOpenDropdown(null); }}>Filter Sandbox</button>
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => setOpenDropdown(null)}>Help</button>
                <div className="h-px bg-border my-1" />
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => { setOpenDropdown(null); setShowFlagsModal(true); }}>Feature Flags</button>
                <div className="flex items-center justify-between px-3 py-2 rounded">
                  <span className="font-sans text-[13px] font-medium text-foreground">Dark Mode</span>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="h-px bg-border my-1" />
                <ResetAccountButton />
                <div className="h-px bg-border my-1" />
                <button type="button" role="menuitem" className="block w-full px-3 py-2 font-sans text-[13px] font-medium text-foreground bg-none border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap hover:bg-secondary" onClick={() => { setOpenDropdown(null); signOut(); }}>Logout</button>
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
