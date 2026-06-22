/**
 * @component ModalFilterBuilder
 * @description Top-level controlled component for the Card-Based Filter Builder.
 * Orchestrates the LogicGroupRenderer and InlineConditionCard, manages in-progress
 * card state, and delegates all filter mutations to the parent via onChange.
 *
 * This is a pure controlled component — it maintains no internal filter state.
 * Local state is limited to in-progress card context (add/edit).
 *
 * @designDecisions
 * - No outer border on the main container — the component is borderless so it
 *   inherits the visual context of its parent (card, panel, page section).
 *   The empty-state variant retains a border for standalone visibility.
 * - Empty filter (zero conditions) renders a centered Funnel icon + dashed-border
 *   CTA button ("Add your first condition") on an accent background — friendlier
 *   onboarding than showing the logic group chrome with no content.
 * - Populated state renders the LogicGroupRenderer with full logic group chrome
 * - Empty sourceCategories renders a disabled empty state message with border
 * - InlineConditionCard replaces the previous ConditionModal approach
 * - In-progress card state (mode, editIndex) is local only
 * - On confirm: mutates filter group and clears inProgressCard
 * - On cancel: discards in-progress condition entirely
 *
 * @usage
 * - Use as the modal variant of the FilterBuilder composed component
 * - Best suited for multi-source filtering with deep hierarchies
 * - For simpler field sets (< 15 fields, single source), prefer the inline variant
 */

import { useState, useCallback } from 'react'
import { Warning, Funnel } from '@phosphor-icons/react'

import type {
  ModalFilterBuilderProps,
  CardFilterRow,
  FilterGroup,
} from '../types'
import {
  addConditionToGroup,
  replaceConditionInGroup,
} from '../group-helpers'
import { LogicGroupRenderer } from './logic-group-renderer'
import { InlineConditionCard } from './inline-condition-card'

// ─── In-Progress Card State ──────────────────────────────────────────────────

interface InProgressCard {
  mode: 'add' | 'edit' | 'add-group'
  editIndex: number | null
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ModalFilterBuilder({
  value,
  onChange,
  sourceCategories,
  allowNesting = true,
  maxDepth = 3,
}: ModalFilterBuilderProps) {
  const [inProgressCard, setInProgressCard] = useState<InProgressCard | null>(null)

  // Clamp maxDepth to valid range (1–10)
  const clampedMaxDepth = Math.max(1, Math.min(10, maxDepth))

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleStartAdd = useCallback(() => {
    setInProgressCard({ mode: 'add', editIndex: null })
  }, [])

  const handleStartEdit = useCallback((index: number) => {
    // -1 sentinel means "add new" from the LogicGroupRenderer button
    // -2 sentinel means "add to new group"
    if (index === -1) {
      setInProgressCard({ mode: 'add', editIndex: null })
    } else if (index === -2) {
      setInProgressCard({ mode: 'add-group', editIndex: null })
    } else {
      setInProgressCard({ mode: 'edit', editIndex: index })
    }
  }, [])

  const handleCancelInProgress = useCallback(() => {
    setInProgressCard(null)
  }, [])

  const handleConfirmInProgress = useCallback(
    (row: CardFilterRow) => {
      let updatedGroup: FilterGroup

      if (inProgressCard?.mode === 'edit' && inProgressCard.editIndex !== null) {
        updatedGroup = replaceConditionInGroup(value, inProgressCard.editIndex, row)
      } else if (inProgressCard?.mode === 'add-group') {
        // Create a new nested group with opposite logic containing this condition
        const nestedGroup: FilterGroup = {
          logic: value.logic === 'and' ? 'or' : 'and',
          conditions: [{ type: 'row', row }],
        }
        updatedGroup = {
          ...value,
          conditions: [...value.conditions, { type: 'group', group: nestedGroup }],
        }
      } else {
        updatedGroup = addConditionToGroup(value, row)
      }

      onChange(updatedGroup)
      setInProgressCard(null)
    },
    [inProgressCard, value, onChange]
  )

  // ─── Root Group Change Handler ─────────────────────────────────────────

  const handleGroupChange = useCallback(
    (group: FilterGroup) => {
      onChange(group)
    },
    [onChange]
  )

  // ─── Empty Source Categories State ─────────────────────────────────────

  if (sourceCategories.length === 0) {
    return (
      <div className="rounded-md border border-border p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Warning size={18} weight="fill" className="text-amber-500" />
          <span className="text-sm">
            No source categories configured. Filter creation is disabled.
          </span>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────

  // Empty state — no conditions configured yet
  if (value.conditions.length === 0 && !inProgressCard) {
    return (
      <div className="rounded-lg p-8 flex flex-col items-center gap-4">
        <Funnel size={32} weight="regular" className="text-primary" />
        <div className="text-center">
          <p className="text-base font-semibold text-foreground m-0">No conditions yet</p>
          <p className="text-sm text-muted-foreground mt-1 m-0">
            Filter your exporter by contact data, activity, or transactional records.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartAdd}
          className="w-full max-w-md border-2 border-dashed border-primary/40 rounded-lg py-3 px-4 text-sm font-semibold text-primary bg-transparent cursor-pointer hover:bg-primary/5 hover:border-primary/60 transition-colors"
        >
          + Add your first condition
        </button>
      </div>
    )
  }

  // Empty state with in-progress card (first condition being added)
  if (value.conditions.length === 0 && inProgressCard) {
    return (
      <div className="rounded-lg p-6">
        <InlineConditionCard
          sourceCategories={sourceCategories}
          mode="add"
          editRow={null}
          onConfirm={handleConfirmInProgress}
          onCancel={handleCancelInProgress}
        />
      </div>
    )
  }

  return (
    <div className="rounded-lg p-6">
      <LogicGroupRenderer
        group={value}
        onChange={handleGroupChange}
        sourceCategories={sourceCategories}
        allowNesting={allowNesting}
        maxDepth={clampedMaxDepth}
        depth={1}
        inProgressCard={inProgressCard}
        onStartEdit={handleStartEdit}
        onCancelInProgress={handleCancelInProgress}
        onConfirmInProgress={handleConfirmInProgress}
      />
    </div>
  )
}
