import { Suspense, useState } from 'react'
import { NavLink, Outlet, useParams, useLocation, Link } from 'react-router-dom'
import { CaretRight, CaretDown, MagnifyingGlass } from '@phosphor-icons/react'
import { componentRegistry } from '../data/componentRegistry'
import type { ComponentCategory, ComponentEntry, PropDefinition } from '../data/componentRegistry'
import { cn } from '../lib/utils'
import { Badge } from '../components/ui/badge'
import { useControlValues } from '../lib/useControlValues'
import { ControlsPanel } from '../components/component-library/ControlsPanel'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../components/ui/sidebar'

interface CategoryDef {
  id: ComponentCategory
  label: string
}

const CATEGORIES: CategoryDef[] = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'atoms', label: 'Atoms' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'display', label: 'Display' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'compositions', label: 'Compositions' },
  { id: 'sandboxes', label: 'Sandboxes' },
]

function ComponentBreadcrumbs() {
  const location = useLocation()
  const path = location.pathname.replace('/admin/components', '').replace(/^\//, '')
  const segments = path.split('/').filter(Boolean)

  // No breadcrumbs on the root
  if (segments.length === 0) return null

  const category = segments[0]
  const slug = segments[1]

  // Find category label
  const categoryMeta = CATEGORIES.find((c) => c.id === category)
  const categoryLabel = categoryMeta?.label ?? category.charAt(0).toUpperCase() + category.slice(1)

  // Find component name from slug
  let componentName: string | undefined
  if (slug) {
    const entry = componentRegistry.find((c) => c.slug === slug)
    componentName = entry?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/admin/components">Components</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {slug ? (
            <BreadcrumbLink asChild>
              <Link to={`/admin/components/${category}`}>{categoryLabel}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{categoryLabel}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {componentName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{componentName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function matchesSearch(entry: ComponentEntry, query: string): boolean {
  const q = query.toLowerCase()
  if (entry.name.toLowerCase().includes(q)) return true
  if (entry.description.toLowerCase().includes(q)) return true
  if (entry.searchTerms?.some(term => term.toLowerCase().includes(q))) return true
  return false
}

function SidebarNav() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CATEGORIES.map((cat) => [cat.id, true]))
  )
  const [search, setSearch] = useState('')

  function toggleGroup(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredComponents = search
    ? componentRegistry
        .filter((entry) => matchesSearch(entry, search))
        .sort((a, b) => a.name.localeCompare(b.name))
    : []

  return (
    <>
      <div className="px-2 pb-2 pt-2">
        <div className="relative">
          <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full h-8 rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:shadow-ring"
          />
        </div>
      </div>
      {search ? (
        <div className="flex-1 overflow-y-auto px-1 py-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Results ({filteredComponents.length})
          </p>
          {filteredComponents.length === 0 ? (
            <p className="px-4 py-2 text-xs text-muted-foreground">No results</p>
          ) : (
            <ul className="list-none p-0 m-0">
              {filteredComponents.map((item) => {
                const to =
                  item.category === 'tokens'
                    ? `/admin/components/tokens/${item.slug}`
                    : `/admin/components/${item.category}/${item.slug}`

                return (
                  <li key={`${item.category}-${item.slug}`}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          "block py-1 px-4 pl-6 text-xs text-muted-foreground transition-all duration-150 no-underline",
                          "hover:text-primary",
                          isActive && "text-primary font-medium"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : (
        <SidebarContent>
          {CATEGORIES.map((cat) => {
            const items = componentRegistry.filter((c) => c.category === cat.id).sort((a, b) => a.name.localeCompare(b.name))
            if (items.length === 0) return null
            const isExpanded = expanded[cat.id] ?? true

            return (
              <SidebarGroup key={cat.id} className="p-1">
                <SidebarGroupLabel
                  className="cursor-pointer select-none gap-1 uppercase tracking-wide text-[11px] h-6"
                  onClick={() => toggleGroup(cat.id)}
                >
                  {isExpanded ? (
                    <CaretDown size={12} weight="bold" />
                  ) : (
                    <CaretRight size={12} weight="bold" />
                  )}
                  {cat.label}
                </SidebarGroupLabel>
                {isExpanded && (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => {
                        const to =
                          cat.id === 'tokens'
                            ? `/admin/components/tokens/${item.slug}`
                            : `/admin/components/${cat.id}/${item.slug}`

                        return (
                          <SidebarMenuItem key={item.slug}>
                            <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent data-[active=true]:bg-transparent">
                              <NavLink
                                to={to}
                                className={({ isActive }) =>
                                  cn(
                                    "block py-1 px-4 pl-6 text-xs text-muted-foreground transition-all duration-150",
                                    "hover:text-primary",
                                    isActive && "text-primary font-medium"
                                  )
                                }
                              >
                                {item.name}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            )
          })}
        </SidebarContent>
      )}
    </>
  )
}

export default function ComponentLibraryPage() {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width": "220px" } as React.CSSProperties}
    >
      <div className="flex min-h-[calc(100vh-56px)] w-full bg-background">
        <Sidebar collapsible="none" className="fixed top-[56px] left-0 h-[calc(100vh-56px)] border-r border-border bg-secondary z-10">
          <SidebarNav />
        </Sidebar>

        <main className="ml-[220px] flex-1 flex justify-center">
          <div className="w-full max-w-[1440px] py-8 px-10">
            <ComponentBreadcrumbs />
            <Suspense fallback={<div className="p-10 text-sm text-tertiary-foreground">Loading…</div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

/** Renders the demo for a specific component based on URL params */
const EMPTY_CONTROLS: PropDefinition[] = []

export function ComponentDemoView() {
  const { category, slug } = useParams<{ category: string; slug: string }>()
  const entry = componentRegistry.find(
    (c) => c.category === category && c.slug === slug
  )

  // Hook called unconditionally (React rules of hooks)
  const { values, setValue, resetAll, isDirty } = useControlValues(entry?.propControls ?? EMPTY_CONTROLS)

  if (!entry) {
    return (
      <div className="py-15 px-10 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Component not found</h2>
        <p className="text-sm text-muted-foreground">
          Select a component from the sidebar to view its demo.
        </p>
      </div>
    )
  }

  const DemoComponent = entry.component
  const hasPropControls = entry.propControls && entry.propControls.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground m-0">{entry.name}</h1>
        <p className="text-sm text-muted-foreground m-0">{entry.description}</p>
        <span className="inline-flex self-start px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-tertiary-foreground border border-border capitalize">{entry.category}</span>
      </div>

      {/* Preview + Controls (side by side, matching heights) */}
      {hasPropControls && (
        <div className="flex gap-4 items-stretch">
          {/* Live Preview frame */}
          <div className={cn(
            "flex-1 min-w-0 border border-border rounded-lg bg-background overflow-hidden",
            entry.demoLayout === 'full-bleed'
              ? 'flex flex-col items-stretch'
              : 'flex items-center justify-center p-8'
          )}>
            <Suspense fallback={<div className="text-sm text-tertiary-foreground p-8">Loading…</div>}>
              <DemoComponent {...values} />
            </Suspense>
          </div>
          {/* Controls */}
          <ControlsPanel
            propControls={entry.propControls!}
            values={values}
            onChange={setValue}
            onReset={resetAll}
            isDirty={isDirty}
            renderControls={entry.renderControls}
          />
        </div>
      )}

      {/* Full demo showcase below — only shown for components without propControls */}
      {!hasPropControls && (
        <div className="bg-background p-6 overflow-visible">
          <Suspense fallback={<div className="p-10 text-sm text-tertiary-foreground">Loading demo…</div>}>
            <DemoComponent />
          </Suspense>
        </div>
      )}

      {/* Design Guidance + Relationships (side by side) */}
      <div className="flex gap-6 pt-5 border-t border-border">
        {/* Design Guidance — left column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-foreground m-0">Design guidance</h2>
          {entry.designGuidance && entry.designGuidance.length > 0 ? (
            entry.designGuidance.map((section) => (
              <div key={section.heading} className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-foreground m-0">{section.heading}</h3>
                {Array.isArray(section.content) ? (
                  <ul className="list-disc pl-4 m-0 space-y-0.5">
                    {section.content.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground m-0">{section.content}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic m-0">No design guidance yet.</p>
          )}
        </div>

        {/* Relationships — right column */}
        {(() => {
          const usedBy = componentRegistry.filter(
            (c) => c.usesComponents?.includes(entry.name)
          )
          const uses = entry.usesComponents ?? []
          return (
            <div className="w-56 shrink-0 flex flex-col gap-4">
              {/* Uses */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Uses</span>
                {uses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {uses.map((compName) => {
                      const linked = componentRegistry.find((c) => c.name === compName)
                      if (linked) {
                        return (
                          <Link
                            key={compName}
                            to={`/admin/components/${linked.category}/${linked.slug}`}
                          >
                            <Badge variant="neutral-subtle" className="cursor-pointer hover:brightness-90 transition-all">
                              {compName}
                            </Badge>
                          </Link>
                        )
                      }
                      return (
                        <Badge key={compName} variant="neutral-subtle">
                          {compName}
                        </Badge>
                      )
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">None</span>
                )}
              </div>

              {/* Used by */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Used by</span>
                {usedBy.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {usedBy.map((comp) => (
                      <Link
                        key={comp.slug}
                        to={`/admin/components/${comp.category}/${comp.slug}`}
                      >
                        <Badge variant="neutral-subtle" className="cursor-pointer hover:brightness-90 transition-all">
                          {comp.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">None</span>
                )}
              </div>

              {/* Used in (page links) */}
              {entry.usedIn && entry.usedIn.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Used in</span>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.usedIn.map((link) => (
                      <Link
                        key={link.route}
                        to={link.route}
                        className="text-xs text-primary hover:underline"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

/** Shows a category overview listing all components in that category */
export function CategoryOverview() {
  const { category } = useParams<{ category: string }>()
  const items = componentRegistry.filter((c) => c.category === category).sort((a, b) => a.name.localeCompare(b.name))
  const categoryMeta = CATEGORIES.find((c) => c.id === category)

  if (!categoryMeta || items.length === 0) {
    return (
      <div className="py-15 px-10 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Category not found</h2>
        <p className="text-sm text-muted-foreground">
          Select a category from the sidebar.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground m-0">{categoryMeta.label}</h1>
        <p className="text-sm text-muted-foreground m-0">
          {items.length} component{items.length !== 1 ? 's' : ''} in this category
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {items.map((item) => (
          <NavLink
            key={item.slug}
            to={`/admin/components/${category}/${item.slug}`}
            className="flex flex-col gap-1 p-4 border border-border rounded-md no-underline transition-all duration-150 hover:border-primary hover:bg-accent"
          >
            <span className="text-sm font-semibold text-foreground">{item.name}</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{item.description}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
