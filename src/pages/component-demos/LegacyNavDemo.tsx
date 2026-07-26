import { useState } from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavVariant = 'current' | 'rebrand-v1' | 'rebrand-v2'

interface NavTheme {
  headerBg: string
  navBg: string
  logoPrimary: string
  logoSecondary: string
  linkActive: string
  linkInactive: string
  linkHover: string
  fontFamily: string
  fontSize: string
  headerHeight: string
  navHeight: string
  sidebarBg: string
  footerBg: string
  footerText: string
  accentColor: string
}

// ---------------------------------------------------------------------------
// Theme variants — captured from staging + proposed rebrands
// ---------------------------------------------------------------------------

const themes: Record<NavVariant, NavTheme> = {
  current: {
    headerBg: 'rgb(9, 0, 42)',
    navBg: 'rgb(9, 0, 42)',
    logoPrimary: 'rgb(0, 149, 218)',
    logoSecondary: 'rgb(255, 255, 255)',
    linkActive: 'rgb(255, 255, 255)',
    linkInactive: 'rgb(153, 153, 153)',
    linkHover: 'rgb(200, 200, 200)',
    fontFamily: "'Montserrat', Arial, Helvetica, sans-serif",
    fontSize: '14px',
    headerHeight: '60px',
    navHeight: '50px',
    sidebarBg: 'rgb(245, 245, 245)',
    footerBg: 'rgb(245, 245, 245)',
    footerText: 'rgb(128, 128, 128)',
    accentColor: 'rgb(0, 149, 218)',
  },
  'rebrand-v1': {
    headerBg: 'rgb(24, 24, 27)',
    navBg: 'rgb(24, 24, 27)',
    logoPrimary: 'rgb(20, 184, 138)',
    logoSecondary: 'rgb(255, 255, 255)',
    linkActive: 'rgb(255, 255, 255)',
    linkInactive: 'rgb(161, 161, 170)',
    linkHover: 'rgb(228, 228, 231)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    headerHeight: '56px',
    navHeight: '44px',
    sidebarBg: 'rgb(250, 250, 250)',
    footerBg: 'rgb(250, 250, 250)',
    footerText: 'rgb(161, 161, 170)',
    accentColor: 'rgb(20, 184, 138)',
  },
  'rebrand-v2': {
    headerBg: 'rgb(250, 250, 250)',
    navBg: 'rgb(255, 255, 255)',
    logoPrimary: 'rgb(20, 184, 138)',
    logoSecondary: 'rgb(24, 24, 27)',
    linkActive: 'rgb(24, 24, 27)',
    linkInactive: 'rgb(113, 113, 122)',
    linkHover: 'rgb(39, 39, 42)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    headerHeight: '56px',
    navHeight: '44px',
    sidebarBg: 'rgb(255, 255, 255)',
    footerBg: 'rgb(255, 255, 255)',
    footerText: 'rgb(161, 161, 170)',
    accentColor: 'rgb(20, 184, 138)',
  },
}

const variantLabels: Record<NavVariant, string> = {
  current: 'Current (Staging)',
  'rebrand-v1': 'Rebrand v1 (Dark + Teal)',
  'rebrand-v2': 'Rebrand v2 (Light + Teal)',
}

// ---------------------------------------------------------------------------
// Nav items (matching staging exactly)
// ---------------------------------------------------------------------------

const primaryNavItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'database', label: 'Database', href: '/list' },
  { id: 'forms', label: 'Forms', href: '/forms' },
  { id: 'email', label: 'Email', href: '/email' },
  { id: 'surveys', label: 'Surveys', href: '/surveys' },
  { id: 'events', label: 'Events', href: '/events' },
  { id: 'txt', label: 'TXT', href: '/txt' },
  { id: 'push', label: 'Push', href: '/push' },
  { id: 'campaigns', label: 'Campaigns', href: '/campaigns' },
  { id: 'social', label: 'Social', href: '/social' },
]

const secondaryNavItems = [
  { id: 'media', label: 'Media Manager', href: '/media' },
  { id: 'contact', label: 'Contact', href: '/contact' },
  { id: 'help', label: 'Help Centre', href: '/help' },
]

const userMenuItems = [
  { label: 'My Settings', href: '/settings' },
  { label: 'Users', href: '/members' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'API', href: '/api' },
  { label: 'Admin', href: '/admin' },
  { label: 'Logout', href: '/logout' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LegacyNavDemo() {
  const [variant, setVariant] = useState<NavVariant>('current')
  const [activeItem, setActiveItem] = useState('database')
  const theme = themes[variant]

  return (
    <div className="flex flex-col h-full w-full">
      {/* Variant toggle */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-background">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variant:</span>
        {(Object.keys(themes) as NavVariant[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              variant === v
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {variantLabels[v]}
          </button>
        ))}
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-zinc-100">
        {/* ======= HEADER BAR ======= */}
        <div
          style={{
            background: theme.headerBg,
            height: theme.headerHeight,
            fontFamily: theme.fontFamily,
            fontSize: theme.fontSize,
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Logo + Account Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Logo */}
            <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {variant === 'current' ? (
                <span style={{ color: theme.logoPrimary, fontWeight: 700, fontSize: '18px' }}>
                  Ubiquity
                </span>
              ) : (
                <img
                  src="/Logotype.svg"
                  alt="Ubiquity"
                  style={{
                    height: '28px',
                    filter: theme.headerBg.includes('250') ? 'none' : 'brightness(0) invert(1)',
                  }}
                />
              )}
            </a>

            {/* Account Switcher */}
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: theme.linkInactive,
                fontFamily: theme.fontFamily,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <strong style={{ color: theme.linkActive }}>Account:</strong>
              <span>Serenity Spa Group</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>
          </div>

          {/* Right: User menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: theme.linkInactive, fontSize: '12px' }}>Brad Knewstubb</span>
            {userMenuItems.map((item) => (
              <a
                key={item.label}
                href="#"
                style={{
                  color: theme.linkInactive,
                  textDecoration: 'none',
                  fontSize: '12px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = theme.linkHover }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.linkInactive }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* ======= NAV BAR ======= */}
        <div
          style={{
            background: theme.navBg,
            height: theme.navHeight,
            fontFamily: theme.fontFamily,
            fontSize: theme.fontSize,
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: variant !== 'current' ? `1px solid ${theme.accentColor}20` : 'none',
          }}
        >
          {/* Left: Product nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {primaryNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeItem === item.id ? theme.linkActive : theme.linkInactive,
                  fontFamily: theme.fontFamily,
                  fontSize: theme.fontSize,
                  fontWeight: 500,
                  padding: '0 12px',
                  height: theme.navHeight,
                  cursor: 'pointer',
                  borderBottom: activeItem === item.id
                    ? `2px solid ${theme.accentColor}`
                    : '2px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (activeItem !== item.id) e.currentTarget.style.color = theme.linkHover
                }}
                onMouseLeave={(e) => {
                  if (activeItem !== item.id) e.currentTarget.style.color = theme.linkInactive
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right: Utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {secondaryNavItems.map((item) => (
              <a
                key={item.id}
                href="#"
                style={{
                  color: theme.linkInactive,
                  textDecoration: 'none',
                  fontSize: '12px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = theme.linkHover }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.linkInactive }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* ======= PAGE CONTENT SIMULATION ======= */}
        <div style={{ display: 'flex', minHeight: '400px' }}>
          {/* Left sidebar (legacy pages have this) */}
          <div
            style={{
              width: '200px',
              background: theme.sidebarBg,
              padding: '20px 16px',
              borderRight: '1px solid #e4e4e7',
              fontFamily: theme.fontFamily,
              fontSize: '12px',
            }}
          >
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', marginBottom: '12px', textTransform: 'uppercase' }}>
              Related Tasks
            </h4>
            <a href="#" style={{ display: 'block', color: '#3b82f6', marginBottom: '8px', textDecoration: 'none' }}>My Dashboard</a>
            <a href="#" style={{ display: 'block', color: '#3b82f6', marginBottom: '8px', textDecoration: 'none' }}>Manage Imports</a>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', marginBottom: '12px', marginTop: '24px', textTransform: 'uppercase' }}>
              Help
            </h4>
          </div>

          {/* Main content area */}
          <div style={{ flex: 1, padding: '32px 40px', fontFamily: theme.fontFamily }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#18181b', marginBottom: '8px' }}>
              {primaryNavItems.find(i => i.id === activeItem)?.label ?? 'Database'}
            </h1>
            <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
              Manage your {activeItem} using the options below.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {['Section A', 'Section B', 'Summary'].map((section) => (
                <div key={section} style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#18181b', marginBottom: '12px' }}>{section}</h3>
                  <div style={{ width: '100%', height: '60px', background: '#f4f4f5', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======= FOOTER ======= */}
        <div
          style={{
            background: theme.footerBg,
            padding: '12px 40px',
            borderTop: '1px solid #e4e4e7',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: theme.fontFamily,
            fontSize: '11px',
            color: theme.footerText,
          }}
        >
          <span>Powered by Ubiquity Software</span>
          <span>UbiQuity build 1.181.0.2688</span>
        </div>
      </div>

      {/* Theme inspector */}
      <div className="border-t border-border bg-background p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Theme Values ({variantLabels[variant]})
        </h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(theme).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              {value.startsWith('rgb') && (
                <div className="w-3 h-3 rounded-sm border border-border" style={{ background: value }} />
              )}
              <span className="text-muted-foreground">{key}:</span>
              <span className="font-mono text-foreground truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
