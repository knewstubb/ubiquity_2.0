/**
 * @component ExpandableTable
 * @pattern compound
 * @description Table with expandable disclosure rows. Uses flex layout (not semantic <table>)
 * to support nested content panels between rows. Shares visual language with the Table
 * primitives (same padding, font, border tokens) but enables a disclosure pattern that
 * HTML <table> cannot support.
 *
 * @designDecisions
 * - Header uses same styling as TableHead: text-sm font-semibold text-muted-foreground, py-2.5
 * - Row borders use border-border/50 matching TableRow
 * - Expanded panels use bg-muted/40 with border-t for visual separation (differentiated from hover)
 * - Caret column is 16px fixed, sits tight to first data column
 * - ARIA: role="table" on wrapper, role="row" on rows, aria-expanded on expandable buttons
 * - Non-expandable rows render with opacity-50 and no caret (aria-disabled, not native disabled)
 * - Hover: bg-secondary matching DataTable and Table conventions
 * - Accordion mode: only one row expanded at a time (single-expand)
 * - Expand/collapse uses CSS grid-template-rows animation (200ms ease)
 *
 * @usage
 * - Run history tables with file-level detail
 * - Grouped transaction views
 * - Any table where rows need progressive disclosure
 *
 * @accessibility
 * - role="table" on container, role="row" on header and row elements
 * - role="columnheader" on header cells
 * - Each expandable row has aria-expanded and aria-controls
 * - Panel uses id for aria-controls reference
 * - Keyboard: Enter/Space toggles expansion
 * - Non-expandable rows use aria-disabled (not native disabled) to remain focusable
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { CaretRight, CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

/* ── Types ── */

export interface ExpandableColumn {
  /** Unique key for the column */
  key: string
  /** Header label */
  label: string
  /** Fixed width (e.g. '140px', '90px') or 'flex-1' to fill remaining space */
  width?: string
  /** Text alignment */
  align?: 'left' | 'right' | 'center'
}

export interface ExpandableTableProps {
  /** Column definitions */
  columns: ExpandableColumn[]
  /** Additional className for the wrapper */
  className?: string
  children: React.ReactNode
}

export interface ExpandableRowProps {
  /** Unique identifier for this row (used for aria-controls and accordion tracking) */
  id: string
  /** Cell content in order matching columns (excluding the caret column) */
  cells: React.ReactNode[]
  /** Whether this row can be expanded */
  expandable?: boolean
  /** Whether row starts expanded */
  defaultExpanded?: boolean
  /** Content shown when expanded */
  children?: React.ReactNode
  /** Additional className for the row button */
  className?: string
  /** Accessible label for the row */
  ariaLabel?: string
}

/* ── Context for accordion behaviour ── */

interface ExpandableTableContextValue {
  expandedId: string | null
  setExpandedId: (id: string | null) => void
}

const ExpandableTableContext = createContext<ExpandableTableContextValue>({
  expandedId: null,
  setExpandedId: () => {},
})

/* ── Child row indent constant ── */

/** Indent for disclosure panel child content: caret (16px) + gap-10 (40px) + small offset (32px) = 88px */
export const DISCLOSURE_INDENT = 88

/* ── ExpandableTable ── */

export function ExpandableTable({ columns, className, children }: ExpandableTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <ExpandableTableContext.Provider value={{ expandedId, setExpandedId }}>
      <div className={cn('flex flex-col', className)} role="table">
        {/* Header */}
        <div className="flex items-center gap-6 px-4 py-2.5 border-b border-border" role="row">
          {/* Caret spacer */}
          <span className="w-4 shrink-0" role="columnheader" aria-label="Expand" />
          {columns.map((col) => (
            <span
              key={col.key}
              role="columnheader"
              className={cn(
                'text-sm font-semibold text-muted-foreground',
                col.width === 'flex-1' ? 'flex-1' : 'shrink-0',
                col.align === 'right' && 'text-right',
                col.align === 'center' && 'text-center',
              )}
              style={col.width && col.width !== 'flex-1' ? { width: col.width } : undefined}
            >
              {col.label}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div role="rowgroup">
          {children}
        </div>
      </div>
    </ExpandableTableContext.Provider>
  )
}

/* ── ExpandableRow ── */

export function ExpandableRow({
  id,
  cells,
  expandable = true,
  defaultExpanded = false,
  children,
  className,
  ariaLabel,
}: ExpandableRowProps) {
  const { expandedId, setExpandedId } = useContext(ExpandableTableContext)
  const isExpanded = expandedId === id
  const panelId = `${id}-panel`

  // Handle default expanded on first render
  const handleToggle = useCallback(() => {
    if (!expandable) return
    setExpandedId(isExpanded ? null : id)
  }, [expandable, isExpanded, id, setExpandedId])

  // Set default expanded if specified and nothing else is expanded
  if (defaultExpanded && expandedId === null && expandable) {
    // This is safe because it only fires once on initial render
    // and React will batch it
    setTimeout(() => setExpandedId(id), 0)
  }

  return (
    <div className="border-b border-border/50 last:border-b-0" role="row">
      <button
        type="button"
        aria-expanded={expandable ? isExpanded : undefined}
        aria-controls={expandable ? panelId : undefined}
        aria-disabled={!expandable || undefined}
        aria-label={ariaLabel}
        className={cn(
          'w-full flex items-center gap-6 px-4 py-3.5 text-left text-sm transition-colors',
          expandable && 'cursor-pointer hover:bg-secondary',
          !expandable && 'cursor-default opacity-50',
          className,
        )}
        onClick={handleToggle}
      >
        <span className="w-4 shrink-0 flex items-center justify-center">
          {expandable ? (
            isExpanded
              ? <CaretDown size={14} className="text-muted-foreground" />
              : <CaretRight size={14} className="text-muted-foreground" />
          ) : (
            <span className="w-[14px]" />
          )}
        </span>
        {cells}
      </button>

      {/* Animated disclosure panel */}
      <div
        id={panelId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          {expandable && children && (
            <div className="bg-muted/40 border-t border-border py-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
