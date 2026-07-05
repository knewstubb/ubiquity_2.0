/**
 * @component LogicGroupRenderer
 * @description Recursive logic group renderer for the Card-Based Filter Builder.
 * Uses horizontal divider pills between conditions to show/toggle logic (AND/OR),
 * renders condition cards, nested group cards, and bottom action buttons.
 * Supports inline condition editing via InlineConditionCard.
 *
 * @designDecisions
 * - Logic divider: short left line (w-6) + pill (AND/OR) + full-width right line between conditions — pill sits left-aligned for visual anchoring against the condition card edges
 * - Clicking the pill toggles the group logic for all conditions at that level
 * - Pill uses primary (teal) styling: border, text, bg-accent, hover:bg-primary/10
 * - Condition cards: full-width white cards with drag handle, icon, summary, X
 * - Nested groups: bordered card with "Group · or/and" header (sentence case), internal logic dividers
 * - Nested group actions (clone, remove) use CSS-only hover reveal via
 *   `:hover:not(:has([data-condition-card]:hover))` — buttons appear when the
 *   group card is hovered but NOT when a child condition card inside it is hovered.
 *   This avoids conflicting hover highlights between parent group and child cards.
 * - Single-level nesting only: nested groups always pass allowNesting={false} to
 *   prevent further depth — keeps filter complexity manageable for users
 * - disableClone on nested groups: when maxGroups is reached, clone button on
 *   group cards renders disabled (opacity-40, cursor-not-allowed) — mirrors the
 *   condition card pattern to prevent exceeding limits via duplication
 * - Bottom actions: "+ Add condition" (solid at root, outline in nested groups for
 *   visual hierarchy) and "+ Add group" (ghost), both size="xs" for compact inline
 *   presence. Nested groups use "Add condition to group" label for clarity.
 * - Nested bottom actions use reveal-on-hover: max-h-0 + overflow-hidden + opacity-0
 *   that transitions to visible (max-h-10, opacity-100, mt-4) when the parent
 *   .group-card-container is hovered — keeps nested groups compact until interacted
 *   with, reducing visual noise in complex filter trees.
 * - Empty state: dashed-border "Configure condition" CTA
 * - InlineConditionCard renders at bottom (add) or in-place (edit) of conditions
 * - Add-group mode: renders InlineConditionCard inside a dashed-border group frame
 *   with a "Group · {opposite logic}" header (sentence case), visually previewing
 *   the nested group structure before the condition is configured
 * - Drag-and-drop uses position-aware drop targeting: cursor in top half of a
 *   card inserts above, bottom half inserts below. Visual indicator (border-t or
 *   border-b in primary) shows the exact insertion point during drag-over.
 * - Root depth starts at 1; maxDepth is the limit
 *
 * @usage
 * - Internal sub-component of ModalFilterBuilder — not used standalone
 * - Recursively renders nested groups with incremented depth
 */

import { useState } from 'react'
import { Plus, Copy, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import type { FilterGroup, SourceCategoryConfig, CardFilterRow } from '../types'
import {
  toggleGroupLogic,
  removeConditionFromGroup,
  addConditionToGroup,
  removeEmptyGroups,
} from '../group-helpers'
import { ConditionCard } from './condition-card'
import { InlineConditionCard } from './inline-condition-card'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LogicGroupRendererProps {
  group: FilterGroup
  onChange: (group: FilterGroup) => void
  sourceCategories: SourceCategoryConfig[]
  allowNesting: boolean
  maxDepth: number
  depth?: number
  inProgressCard?: { mode: 'add' | 'edit' | 'add-group'; editIndex: number | null } | null
  onStartEdit?: (index: number) => void
  onCancelInProgress?: () => void
  onConfirmInProgress?: (row: CardFilterRow) => void
  disableAddCondition?: boolean
  disableAddGroup?: boolean
}

// ─── Logic Divider ───────────────────────────────────────────────────────────

function LogicDivider({
  logic,
  onToggle,
  uppercase = true,
}: {
  logic: 'and' | 'or'
  onToggle: () => void
  uppercase?: boolean
}) {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="w-6 h-px bg-primary/50" />
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "px-2.5 py-0.5 rounded-full border border-primary/40 text-[11px] font-bold text-primary bg-accent cursor-pointer hover:bg-primary/10 transition-colors",
          uppercase && "uppercase"
        )}
      >
        {logic}
      </button>
      <div className="flex-1 h-px bg-primary/50" />
    </div>
  )
}

// ─── Nested Group Card ───────────────────────────────────────────────────────

function NestedGroupCard({
  condition,
  index,
  sourceCategories,
  maxDepth,
  depth,
  onRemove,
  onClone,
  disableClone,
  onChange,
}: {
  condition: { type: 'group'; group: FilterGroup }
  index: number
  sourceCategories: SourceCategoryConfig[]
  maxDepth: number
  depth: number
  onRemove: () => void
  onClone?: () => void
  disableClone?: boolean
  onChange: (g: FilterGroup) => void
  onStartEdit?: (index: number) => void
  onCancelInProgress?: () => void
  onConfirmInProgress?: (row: CardFilterRow) => void
}) {
  const [localInProgress, setLocalInProgress] = useState<{ mode: 'add' | 'edit'; editIndex: number | null } | null>(null)

  const handleLocalStartEdit = (idx: number) => {
    if (idx === -1) {
      setLocalInProgress({ mode: 'add', editIndex: null })
    } else {
      setLocalInProgress({ mode: 'edit', editIndex: idx })
    }
  }

  const handleLocalCancel = () => {
    setLocalInProgress(null)
  }

  const handleLocalConfirm = (row: CardFilterRow) => {
    if (localInProgress?.mode === 'edit' && localInProgress.editIndex !== null) {
      const conditions = condition.group.conditions.map((c, i) =>
        i === localInProgress.editIndex ? { type: 'row' as const, row } : c
      )
      onChange({ ...condition.group, conditions })
    } else {
      onChange({
        ...condition.group,
        conditions: [...condition.group.conditions, { type: 'row', row }],
      })
    }
    setLocalInProgress(null)
  }

  return (
    <div className="group-card-container rounded-lg border border-border bg-card p-4 transition-all duration-150 hover:[&:not(:has([data-condition-card]:hover))]:border-primary hover:[&:not(:has([data-condition-card]:hover))]:shadow-md">
      {/* Group header — buttons visible when group is hovered but no card inside is hovered */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold tracking-wide text-primary">
          Group · {condition.group.logic}
        </div>
        <div className="flex items-center gap-1 invisible [.group-card-container:hover:not(:has([data-condition-card]:hover))_&]:visible">
          <button
            type="button"
            onClick={disableClone ? undefined : onClone}
            disabled={disableClone}
            className={cn(
              "p-1 rounded border border-border text-muted-foreground transition-colors",
              disableClone ? "opacity-40 cursor-not-allowed" : "hover:text-foreground hover:border-border-strong"
            )}
            aria-label="Clone group"
          >
            <Copy size={14} weight="regular" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-colors"
            aria-label="Remove group"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Nested group content — manages its own in-progress state */}
      <LogicGroupRenderer
        group={condition.group}
        onChange={onChange}
        sourceCategories={sourceCategories}
        allowNesting={false}
        maxDepth={maxDepth}
        depth={depth + 1}
        inProgressCard={localInProgress}
        onStartEdit={handleLocalStartEdit}
        onCancelInProgress={handleLocalCancel}
        onConfirmInProgress={handleLocalConfirm}
      />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LogicGroupRenderer({
  group,
  onChange,
  sourceCategories,
  allowNesting,
  maxDepth,
  depth = 1,
  inProgressCard,
  onStartEdit,
  onCancelInProgress,
  onConfirmInProgress,
  disableAddCondition,
  disableAddGroup,
}: LogicGroupRendererProps) {
  const canAddGroup = allowNesting && depth < maxDepth && !disableAddCondition && !disableAddGroup
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<'above' | 'below'>('above')

  // ─── Drag handlers ───────────────────────────────────────────────────────

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (index !== dragIndex) {
      // Determine if cursor is in top or bottom half
      const rect = e.currentTarget.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      const position = e.clientY < midY ? 'above' : 'below'
      setDragOverIndex(index)
      setDragOverPosition(position)
    }
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const conditions = [...group.conditions]
    const [moved] = conditions.splice(dragIndex, 1)
    // Calculate target index based on position
    let targetIndex = index
    if (dragOverPosition === 'below') {
      targetIndex = dragIndex < index ? index : index + 1
    } else {
      targetIndex = dragIndex < index ? index - 1 : index
    }
    conditions.splice(targetIndex, 0, moved)
    onChange({ ...group, conditions })
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleToggleLogic() {
    onChange(toggleGroupLogic(group))
  }

  function handleAddGroup() {
    // Signal to parent to open inline card in "add-to-group" mode
    if (onStartEdit) {
      onStartEdit(-2)
    }
  }

  function handleRemoveCondition(index: number) {
    const updated = removeConditionFromGroup(group, index)
    onChange(removeEmptyGroups(updated))
  }

  function handleCloneCondition(index: number) {
    const condition = group.conditions[index]
    if (condition?.type === 'row') {
      onChange(addConditionToGroup(group, condition.row as CardFilterRow))
    }
  }

  function handleCloneGroup(index: number) {
    const condition = group.conditions[index]
    if (condition?.type === 'group') {
      // Deep-clone the group and append it
      const clonedGroup = JSON.parse(JSON.stringify(condition.group)) as FilterGroup
      onChange({
        ...group,
        conditions: [...group.conditions, { type: 'group', group: clonedGroup }],
      })
    }
  }

  function handleEditCondition(index: number) {
    if (onStartEdit) {
      onStartEdit(index)
    }
  }

  function handleToggleDisabled(index: number) {
    const condition = group.conditions[index]
    if (condition?.type === 'row') {
      const row = condition.row as CardFilterRow
      const updatedRow = { ...row, disabled: !row.disabled }
      const conditions = group.conditions.map((c, i) =>
        i === index ? { type: 'row' as const, row: updatedRow } : c
      )
      onChange({ ...group, conditions })
    }
  }

  function handleNestedGroupChange(index: number, nestedGroup: FilterGroup) {
    const pruned = removeEmptyGroups(nestedGroup)
    if (pruned.conditions.length === 0) {
      const updated = removeConditionFromGroup(group, index)
      onChange(removeEmptyGroups(updated))
    } else {
      const conditions = group.conditions.map((c, i) =>
        i === index ? ({ type: 'group' as const, group: pruned }) : c
      )
      onChange({ ...group, conditions })
    }
  }

  // Determine the edit row for inline editing
  const editRow: CardFilterRow | null = (() => {
    if (inProgressCard?.mode === 'edit' && inProgressCard.editIndex !== null) {
      const condition = group.conditions[inProgressCard.editIndex]
      if (condition?.type === 'row') {
        return condition.row as CardFilterRow
      }
    }
    return null
  })()

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col"
      role="group"
      aria-label={`${group.logic.toUpperCase()} filter group`}
    >
      {/* Conditions with logic dividers between them */}
      {group.conditions.length > 0 ? (
        <div className="flex flex-col">
          {group.conditions.map((condition, index) => {
            // If this condition is being edited inline, render InlineConditionCard in its place
            const isBeingEdited = inProgressCard?.mode === 'edit' && inProgressCard.editIndex === index

            return (
              <div key={`${depth}-${index}`}>
                {/* Logic divider between conditions (not before the first one) */}
                {index > 0 && (
                  <LogicDivider logic={group.logic} onToggle={handleToggleLogic} uppercase={depth <= 1} />
                )}

                <div
                  draggable={!isBeingEdited}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={dragOverIndex === index && dragIndex !== index ? (dragOverPosition === 'above' ? 'border-t-2 border-t-primary' : 'border-b-2 border-b-primary') : undefined}
                >

                {isBeingEdited && onConfirmInProgress && onCancelInProgress ? (
                  <InlineConditionCard
                    sourceCategories={sourceCategories}
                    mode="edit"
                    editRow={editRow}
                    onConfirm={onConfirmInProgress}
                    onCancel={onCancelInProgress}
                  />
                ) : condition.type === 'row' ? (
                  <ConditionCard
                    row={condition.row}
                    sourceCategories={sourceCategories}
                    onEdit={() => handleEditCondition(index)}
                    onRemove={() => handleRemoveCondition(index)}
                    onClone={() => handleCloneCondition(index)}
                    onToggleDisabled={() => handleToggleDisabled(index)}
                    disableClone={disableAddCondition}
                  />
                ) : (
                  /* Nested group card */
                  <NestedGroupCard
                    condition={condition}
                    index={index}
                    sourceCategories={sourceCategories}
                    maxDepth={maxDepth}
                    depth={depth}
                    onRemove={() => handleRemoveCondition(index)}
                    onClone={() => handleCloneGroup(index)}
                    disableClone={disableAddGroup}
                    onChange={(g) => handleNestedGroupChange(index, g)}
                    onStartEdit={onStartEdit}
                    onCancelInProgress={onCancelInProgress}
                    onConfirmInProgress={onConfirmInProgress}
                  />
                )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty state */
        <button
          type="button"
          onClick={() => onStartEdit?.(0)}
          className="w-full flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <span className="flex-1 text-left text-sm text-primary font-medium">
            Configure condition
          </span>
        </button>
      )}

      {/* Inline add card — rendered at the bottom of conditions */}
      {inProgressCard?.mode === 'add' && onConfirmInProgress && onCancelInProgress && (
        <>
          {group.conditions.length > 0 && (
            <LogicDivider logic={group.logic} onToggle={handleToggleLogic} uppercase={depth <= 1} />
          )}
          <InlineConditionCard
            sourceCategories={sourceCategories}
            mode="add"
            editRow={null}
            onConfirm={onConfirmInProgress}
            onCancel={onCancelInProgress}
          />
        </>
      )}

      {/* Inline add-group card — rendered inside a group frame at the bottom */}
      {inProgressCard?.mode === 'add-group' && onConfirmInProgress && onCancelInProgress && (
        <>
          {group.conditions.length > 0 && (
            <LogicDivider logic={group.logic} onToggle={handleToggleLogic} uppercase={depth <= 1} />
          )}
          <div className="rounded-lg border border-dashed border-primary/40 bg-card p-4">
            <div className="text-xs font-semibold tracking-wide text-primary mb-3">
              Group · {group.logic === 'and' ? 'or' : 'and'}
            </div>
            <InlineConditionCard
              sourceCategories={sourceCategories}
              mode="add"
              editRow={null}
              onConfirm={onConfirmInProgress}
              onCancel={onCancelInProgress}
            />
          </div>
        </>
      )}

      {/* Bottom action buttons — hide when an inline card is active; hidden in nested groups until hovered */}
      {!inProgressCard && (
        <div className={cn(
          "flex items-center gap-2",
          depth > 1 ? "mt-0 max-h-0 overflow-hidden opacity-0 [.group-card-container:hover_&]:mt-4 [.group-card-container:hover_&]:max-h-10 [.group-card-container:hover_&]:opacity-100 transition-all duration-200 ease-out" : "mt-4"
        )}>
          <Button
            type="button"
            variant={depth > 1 ? "outline" : "default"}
            size="xs"
            onClick={() => onStartEdit?.(-1)}
            disabled={disableAddCondition}
          >
            <Plus weight="bold" size={12} className="mr-1" />
            {depth > 1 ? 'Add condition to group' : 'Add condition'}
          </Button>

          {canAddGroup && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleAddGroup}
              disabled={disableAddGroup}
            >
              <Plus weight="bold" size={12} className="mr-1" />
              Add group
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
