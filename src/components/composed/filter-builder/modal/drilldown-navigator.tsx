/**
 * @component DrilldownNavigator
 * @description A progressive drill-down list navigator for selecting source → sub-source → field
 * in the filter builder's inline condition card. Replaces the Combobox-based phase progression
 * with a slide-animated list that lets users navigate a hierarchical tree.
 *
 * @designDecisions
 * - Search filters the current level only (not global) — keeps focus narrow at each step
 * - Animation scoped to the inner content wrapper (header + search + list) — the entire panel
 *   content animates together via key-based re-mount (drillForward/drillBack 450ms), giving a
 *   cohesive level-change feel while the outer container remains stable
 * - No animation on initial mount (animationDirection starts null) — avoids flash on first render
 * - Header: static title (current step label) shows the current phase prompt; each breadcrumb
 *   segment is individually clickable to navigate directly to that level (multi-level jump supported)
 * - Items with children show a CaretRight chevron — clicking drills to next level
 * - Leaf items (fields) complete the selection immediately via onSelect callback
 * - Transactional sub-sources also complete immediately (no field phase) — models "has transactions" pattern
 * - Search input auto-focuses on level change (50ms delay for animation settle)
 * - Data type badge shown on field-level items for quick identification
 * - List items use py-2 px-2 padding with rounded corners — allows natural text flow
 *   while giving a pill-shaped hover highlight inset from the edges
 * - Wrapper div carries px-1 inset so the rounded hover zone doesn't touch the container edge
 * - Hover state uses bg-black/[0.04] — ultra-subtle neutral tint that works in both
 *   light and dark modes without coupling to a semantic token
 * - Border separators live on the wrapper div (not the button) — decouples the visual
 *   divider from the interactive hover zone so hover:bg doesn't bleed into the border area
 * - List area capped at 200px max-height — keeps the drilldown compact within inline cards
 *   and ensures the breadcrumb/search remain visible without excessive scroll
 *
 * @usage
 * - Inside InlineConditionCard for source → sub-source → field hierarchical selection
 * - Not a standalone component — tightly coupled to FilterBuilder's SourceCategoryConfig tree shape
 * - Alternative to Combobox when the hierarchy is deep (3+ levels) and benefits from visible breadcrumbs
 */

import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { CaretRight, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import type { SourceCategoryConfig, SubSourceConfig, FilterFieldDef } from '../types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DrilldownNavigatorProps {
  sourceCategories: SourceCategoryConfig[]
  onSelect: (selection: DrilldownSelection) => void
  /** When true, the initial mount animates in from the left (returning from operator phase) */
  slideInFromLeft?: boolean
}

export interface DrilldownSelection {
  sourceCategory: string
  subSourcePath: string[]
  field: string | null // null for transactional (relationship) sub-sources
  isTransactional: boolean
}

interface NavigationLevel {
  label: string // breadcrumb label for this level
  items: NavigationItem[]
}

interface NavigationItem {
  key: string
  label: string
  hasChildren: boolean
  isTransactional?: boolean
  badge?: string // e.g. data type badge for fields
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DrilldownNavigator({ sourceCategories, onSelect, slideInFromLeft }: DrilldownNavigatorProps) {
  const [path, setPath] = useState<string[]>([]) // keys navigated so far
  const [searchQuery, setSearchQuery] = useState('')
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'back' | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when level changes
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [path.length])

  // ─── Derive current level items ─────────────────────────────────────────

  const currentLevel: NavigationLevel = useMemo(() => {
    if (path.length === 0) {
      // Root level: show source categories
      return {
        label: 'Select source',
        items: sourceCategories.map((cat) => ({
          key: cat.key,
          label: cat.title,
          hasChildren: true, // all sources drill deeper (either to sub-sources or fields)
        })),
      }
    }

    // Find where we are in the tree
    const sourceCategoryKey = path[0]
    const category = sourceCategories.find((c) => c.key === sourceCategoryKey)
    if (!category) return { label: 'Unknown', items: [] }

    if (path.length === 1) {
      // We selected a source category — show its sub-sources or fields
      if (category.subSources && category.subSources.length > 0) {
        // Determine label based on what the items contain
        const itemsHaveChildren = category.subSources.some((s) =>
          !s.sourceType && ((s.subSources && s.subSources.length > 0) || (s.fields && s.fields.length > 0 && s.subSources && s.subSources.length > 0))
        )
        const stepLabel = itemsHaveChildren ? 'Select folder' : 'Select folder'
        return {
          label: `${category.title} > ${stepLabel}`,
          items: category.subSources.map((sub) => ({
            key: sub.key,
            label: sub.label,
            hasChildren: !sub.sourceType && (
              (sub.subSources && sub.subSources.length > 0) ||
              (sub.fields && sub.fields.length > 0)
            ),
            isTransactional: sub.sourceType === 'transactional',
          })),
        }
      }
      // No sub-sources — show fields directly
      return {
        label: `${category.title} > Select field`,
        items: category.fields.map((f) => ({
          key: f.key,
          label: f.label,
          hasChildren: false,
          badge: f.dataType,
        })),
      }
    }

    // Deeper: traverse sub-sources
    let subs: SubSourceConfig[] = category.subSources ?? []
    const breadcrumbParts = [category.title]
    let currentSub: SubSourceConfig | undefined

    for (let i = 1; i < path.length; i++) {
      currentSub = subs.find((s) => s.key === path[i])
      if (!currentSub) return { label: 'Unknown', items: [] }
      breadcrumbParts.push(currentSub.label)
      subs = currentSub.subSources ?? []
    }

    // Show next level sub-sources or fields
    if (subs.length > 0) {
      // Determine if the items at this level are leaf sub-sources (contain fields directly) or folders (contain more sub-sources)
      const itemsAreLeaf = subs.every((s) => !s.subSources || s.subSources.length === 0)
      const stepLabel = itemsAreLeaf ? 'Select mailout' : 'Select folder'
      return {
        label: `${breadcrumbParts.join(' > ')} > ${stepLabel}`,
        items: subs.map((sub) => ({
          key: sub.key,
          label: sub.label,
          hasChildren: !sub.sourceType && (
            (sub.subSources && sub.subSources.length > 0) ||
            (sub.fields && sub.fields.length > 0)
          ),
          isTransactional: sub.sourceType === 'transactional',
        })),
      }
    }

    // At a leaf sub-source — show its fields
    const fields: FilterFieldDef[] = currentSub?.fields ?? []
    return {
      label: `${breadcrumbParts.join(' > ')} > Select field`,
      items: fields.map((f) => ({
        key: f.key,
        label: f.label,
        hasChildren: false,
        badge: f.dataType,
      })),
    }
  }, [path, sourceCategories])

  // ─── Filtered items ─────────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return currentLevel.items
    const q = searchQuery.toLowerCase().trim()
    return currentLevel.items.filter((item) => item.label.toLowerCase().includes(q))
  }, [currentLevel.items, searchQuery])

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleItemClick = useCallback((item: NavigationItem) => {
    if (item.isTransactional) {
      // Transactional sub-sources complete selection immediately
      onSelect({
        sourceCategory: path[0] ?? item.key,
        subSourcePath: path.length === 0 ? [item.key] : [...path.slice(1), item.key],
        field: null,
        isTransactional: true,
      })
      return
    }

    if (item.hasChildren) {
      // Drill deeper
      setAnimationDirection('forward')
      setSearchQuery('')
      setPath((prev) => [...prev, item.key])
      return
    }

    // Leaf node — this is a field selection
    if (path.length === 0) {
      // Shouldn't happen (root items always have children) but handle gracefully
      return
    }

    onSelect({
      sourceCategory: path[0],
      subSourcePath: path.slice(1),
      field: item.key,
      isTransactional: false,
    })
  }, [path, onSelect])

  // ─── Breadcrumb segments ────────────────────────────────────────────────

  const breadcrumbSegments = useMemo(() => {
    if (path.length === 0) return []

    const segments: { label: string; pathIndex: number }[] = []
    const category = sourceCategories.find((c) => c.key === path[0])
    if (category) {
      segments.push({ label: category.title, pathIndex: 0 })

      let subs = category.subSources ?? []
      for (let i = 1; i < path.length; i++) {
        const sub = subs.find((s) => s.key === path[i])
        if (sub) {
          segments.push({ label: sub.label, pathIndex: i })
          subs = sub.subSources ?? []
        }
      }
    }

    return segments
  }, [path, sourceCategories])

  // ─── Render ─────────────────────────────────────────────────────────────

  // Determine the last part of the breadcrumb label (the current step prompt)
  const currentStepLabel = currentLevel.label.includes(' > ')
    ? currentLevel.label.split(' > ').pop() ?? ''
    : currentLevel.label

  return (
    <div
      className="flex flex-col gap-3"
      style={slideInFromLeft ? { animation: 'drillBack 450ms ease both' } : undefined}
    >
      <div
        key={path.join('/')}
        className="flex flex-col gap-3"
        style={{ animation: animationDirection === 'forward' ? 'drillForward 450ms ease both' : animationDirection === 'back' ? 'drillBack 450ms ease both' : undefined }}
      >
        {/* Header: title + breadcrumb trail on one line */}
        <div className="flex items-baseline gap-2 min-h-[26px]">
          <span className="text-base font-semibold text-primary shrink-0">
            {currentStepLabel}
          </span>
          {breadcrumbSegments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              {breadcrumbSegments.map((seg, i) => (
                <span key={i} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAnimationDirection('back')
                      setSearchQuery('')
                      setPath((prev) => prev.slice(0, seg.pathIndex))
                    }}
                    className="hover:text-foreground hover:underline transition-colors cursor-pointer"
                  >
                    {seg.label}
                  </button>
                  <span>&gt;</span>
                </span>
              ))}
              <span>…</span>
            </span>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            <MagnifyingGlass size={14} />
          </span>
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-sm pl-8"
          />
        </div>

        {/* List items — scrollable */}
        <div className="flex flex-col overflow-y-auto max-h-[200px] scrollbar-gutter-stable -mt-1">
        {filteredItems.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No results found
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.key} className="border-b border-border/40 last:border-b-0 px-1">
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex items-center justify-between w-full text-left py-2 px-2 text-sm rounded transition-colors cursor-default select-none',
                  'hover:bg-black/[0.04]'
                )}
              >
              <span className="truncate">{item.label}</span>
              <span className="flex items-center gap-2 shrink-0 ml-2">
                {item.badge && (
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
                {(item.hasChildren || item.isTransactional) && (
                  <CaretRight size={14} weight="bold" className="text-muted-foreground/60" />
                )}
              </span>
            </button>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  )
}
