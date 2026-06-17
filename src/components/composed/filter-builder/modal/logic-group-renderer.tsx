/**
 * @component LogicGroupRenderer
 * @description Recursive logic group renderer for the Card-Based Filter Builder.
 * Renders AND/OR toggle, condition summaries, nested groups, and action buttons.
 *
 * @designDecisions
 * - Logic toggle is a clickable Button (size="xs") showing "AND" or "OR" — fixed w-10 + text-center so the pill stays the same width regardless of label length, preventing layout shift on toggle
 * - AND uses primary (teal) styling; OR uses purple-500 to visually distinguish alternative logic at a glance
 * - Left border connector line also colour-codes: primary (teal) for AND groups, purple-500 for OR groups
 * - Conditions rendered as ConditionCard components (natural language summaries)
 * - Nested groups indented with left border-line (border-l-2) for visual hierarchy
 * - "+Filter" (labelled "Condition") opens the ConditionModal in add mode via onOpenModal callback
 * - "+Group" visible only when allowNesting=true and depth < maxDepth
 * - "+Group" disabled with tooltip at maxDepth
 * - Empty nested groups auto-removed via removeEmptyGroups on condition removal
 * - Root depth starts at 1; maxDepth is the limit (e.g., maxDepth=3 means depth 1, 2, 3 allowed)
 *
 * @usage
 * - Internal sub-component of CardFilterBuilder — not used standalone
 * - Recursively renders nested groups with incremented depth
 */

import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import type { FilterGroup, SourceCategoryConfig } from '../types'
import {
  toggleGroupLogic,
  removeConditionFromGroup,
  addNestedGroup,
  removeEmptyGroups,
} from '../group-helpers'
import { ConditionCard } from './condition-card'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LogicGroupRendererProps {
  group: FilterGroup
  onChange: (group: FilterGroup) => void
  sourceCategories: SourceCategoryConfig[]
  allowNesting: boolean
  maxDepth: number
  depth?: number
  onOpenModal: (mode: 'add' | 'edit', editIndex?: number) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LogicGroupRenderer({
  group,
  onChange,
  sourceCategories,
  allowNesting,
  maxDepth,
  depth = 1,
  onOpenModal,
}: LogicGroupRendererProps) {
  const atMaxDepth = depth >= maxDepth
  const canAddGroup = allowNesting && !atMaxDepth

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleToggleLogic() {
    onChange(toggleGroupLogic(group))
  }

  function handleAddFilter() {
    onOpenModal('add')
  }

  function handleAddGroup() {
    onChange(addNestedGroup(group))
  }

  function handleRemoveCondition(index: number) {
    const updated = removeConditionFromGroup(group, index)
    // Auto-remove empty nested groups recursively
    onChange(removeEmptyGroups(updated))
  }

  function handleEditCondition(index: number) {
    onOpenModal('edit', index)
  }

  function handleNestedGroupChange(index: number, nestedGroup: FilterGroup) {
    // If nested group becomes empty, remove it
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

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col gap-0"
      role="group"
      aria-label={`${group.logic.toUpperCase()} filter group`}
    >
      {/* Header: logic toggle + action buttons */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant="default"
          size="xs"
          onClick={handleToggleLogic}
          aria-label={`Toggle group logic, currently ${group.logic.toUpperCase()}`}
          className={cn(
            'text-xs font-bold uppercase w-10 text-center',
            group.logic === 'or' && 'bg-zinc-500 text-white hover:bg-zinc-600'
          )}
        >
          {group.logic}
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* +Group button: visible only when allowNesting=true */}
          {allowNesting && canAddGroup && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleAddGroup}
              className="text-xs text-primary border-primary/30 hover:bg-primary/5"
            >
              <Plus weight="bold" size={12} />
              Group
            </Button>
          )}

          {/* +Group disabled at max depth with tooltip */}
          {allowNesting && atMaxDepth && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled
                      className="text-xs opacity-50"
                    >
                      <Plus weight="bold" size={12} />
                      Group
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Maximum nesting depth reached
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* +Filter button */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleAddFilter}
            className="text-xs text-primary border-primary/30 hover:bg-primary/5"
          >
            <Plus weight="bold" size={12} />
            Condition
          </Button>
        </div>
      </div>

      {/* Conditions with left connector line */}
      {group.conditions.length > 0 && (
        <div className={cn("ml-[18px] pl-4 border-l-2 flex flex-col gap-2", group.logic === "or" ? "border-zinc-500" : "border-primary")}>
          {group.conditions.map((condition, index) => (
            <div key={`${depth}-${index}`}>
              {condition.type === 'row' ? (
                <ConditionCard
                  row={condition.row}
                  sourceCategories={sourceCategories}
                  onEdit={() => handleEditCondition(index)}
                  onRemove={() => handleRemoveCondition(index)}
                />
              ) : (
                <div className="rounded border border-border p-3 bg-secondary/50">
                  <LogicGroupRenderer
                    group={condition.group}
                    onChange={(g) => handleNestedGroupChange(index, g)}
                    sourceCategories={sourceCategories}
                    allowNesting={allowNesting}
                    maxDepth={maxDepth}
                    depth={depth + 1}
                    onOpenModal={onOpenModal}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
