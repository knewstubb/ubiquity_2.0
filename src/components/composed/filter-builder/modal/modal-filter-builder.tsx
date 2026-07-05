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
 * - Empty filter (zero conditions) renders a flex-fill top-biased layout (flex-1 +
 *   flex spacer at 25% height) with Funnel icon + dashed-border CTA button —
 *   positions content in the upper third rather than dead-centre, which feels more
 *   natural in tall panels and avoids the "floating in space" look.
 *   Button is auto-width (not full-width) to avoid looking oversized in wide panels.
 * - Populated state renders the LogicGroupRenderer with full logic group chrome
 * - Empty sourceCategories renders a disabled empty state message with border
 * - InlineConditionCard replaces the previous ConditionModal approach
 * - In-progress card state (mode, editIndex) is local only
 * - On confirm: mutates filter group and clears inProgressCard
 * - On cancel: discards in-progress condition entirely
 * - Limit enforcement (maxConditions/maxGroups): conditions and groups are counted
 *   via recursive walk of the FilterGroup tree. When at limit, add actions are
 *   disabled at the LogicGroupRenderer level — buttons become inert rather than
 *   hidden, so users understand why they can't add more.
 *
 * @usage
 * - Use as the modal variant of the FilterBuilder composed component
 * - Best suited for multi-source filtering with deep hierarchies
 * - For simpler field sets (< 15 fields, single source), prefer the inline variant
 */

import { useState, useCallback, useMemo } from 'react'
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
  maxConditions,
  maxGroups,
}: ModalFilterBuilderProps) {
  const [inProgressCard, setInProgressCard] = useState<InProgressCard | null>(null)

  // Clamp maxDepth to valid range (1–10)
  const clampedMaxDepth = Math.max(1, Math.min(10, maxDepth))

  // Count conditions and groups for limit enforcement
  const { totalConditions, totalGroups } = useMemo(() => {
    let conditions = 0
    let groups = 0
    function walk(group: FilterGroup) {
      for (const c of group.conditions) {
        if (c.type === 'row') conditions++
        else { groups++; walk(c.group) }
      }
    }
    walk(value)
    return { totalConditions: conditions, totalGroups: groups }
  }, [value])

  const conditionsAtLimit = maxConditions != null && totalConditions >= maxConditions
  const groupsAtLimit = maxGroups != null && totalGroups >= maxGroups

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
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="flex-[0_0_25%]" />
        <Funnel size={32} weight="regular" className="text-primary" />
        <div className="text-center">
          <p className="text-base font-semibold text-foreground m-0">No conditions yet</p>
          <p className="text-sm text-muted-foreground mt-1 m-0">
            Filter your exporter by contact data, activity,<br />or transactional records.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartAdd}
          className="border-2 border-dashed border-primary/40 rounded-lg py-2.5 px-5 text-sm font-semibold text-primary bg-transparent cursor-pointer hover:bg-primary/5 hover:border-primary/60 transition-colors"
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
        disableAddCondition={conditionsAtLimit}
        disableAddGroup={groupsAtLimit}
      />
    </div>
  )
}
