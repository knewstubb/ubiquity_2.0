/**
 * @component ModalFilterBuilder
 * @description Top-level controlled component for the Card-Based Filter Builder.
 * Orchestrates the LogicGroupRenderer and ConditionModal, manages modal state,
 * and delegates all filter mutations to the parent via onChange.
 *
 * This is a pure controlled component — it maintains no internal filter state.
 * Local state is limited to modal open/close and edit context.
 *
 * @designDecisions
 * - No outer border on the main container — the component is borderless so it
 *   inherits the visual context of its parent (card, panel, page section).
 *   The empty-state variant retains a border for standalone visibility.
 * - Always renders root LogicGroupRenderer, even when value has no conditions
 * - Empty sourceCategories renders a disabled empty state message with border
 * - Modal state (open, mode, editIndex, targetGroupPath) is local only
 * - On modal confirm: mutates filter group and calls props.onChange
 * - On modal dismiss: discards in-progress condition entirely
 * - When "edit" targets an unconfigured row (no sourceCategory or field),
 *   mode downgrades to 'add' so the modal starts at Step 1 instead of Step 4
 *
 * @usage
 * - Use as the modal variant of the FilterBuilder composed component
 * - Best suited for multi-source filtering with deep hierarchies
 * - For simpler field sets (< 15 fields, single source), prefer the inline variant
 */

import { useState, useCallback } from 'react'
import { Warning } from '@phosphor-icons/react'

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
import { ConditionModal } from './condition-modal'

// ─── Modal State ─────────────────────────────────────────────────────────────

interface ModalContext {
  isOpen: boolean
  mode: 'add' | 'edit'
  editIndex: number | null
}

const INITIAL_MODAL_STATE: ModalContext = {
  isOpen: false,
  mode: 'add',
  editIndex: null,
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ModalFilterBuilder({
  value,
  onChange,
  sourceCategories,
  allowNesting = true,
  maxDepth = 3,
}: ModalFilterBuilderProps) {
  const [modalState, setModalState] = useState<ModalContext>(INITIAL_MODAL_STATE)

  // Clamp maxDepth to valid range (1–10)
  const clampedMaxDepth = Math.max(1, Math.min(10, maxDepth))

  // ─── Modal Handlers ────────────────────────────────────────────────────

  const handleOpenModal = useCallback((mode: 'add' | 'edit', editIndex?: number) => {
    setModalState({
      isOpen: true,
      mode,
      editIndex: editIndex ?? null,
    })
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalState(INITIAL_MODAL_STATE)
  }, [])

  const handleConfirmCondition = useCallback(
    (row: CardFilterRow) => {
      let updatedGroup: FilterGroup

      if (modalState.mode === 'edit' && modalState.editIndex !== null) {
        updatedGroup = replaceConditionInGroup(value, modalState.editIndex, row)
      } else {
        updatedGroup = addConditionToGroup(value, row)
      }

      onChange(updatedGroup)
      setModalState(INITIAL_MODAL_STATE)
    },
    [modalState.mode, modalState.editIndex, value, onChange]
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

  return (
    <div className="rounded-md p-4">
      <LogicGroupRenderer
        group={value}
        onChange={handleGroupChange}
        sourceCategories={sourceCategories}
        allowNesting={allowNesting}
        maxDepth={clampedMaxDepth}
        depth={1}
        onOpenModal={handleOpenModal}
      />

      {/* ConditionModal */}
      <ConditionModal
        key={`${modalState.isOpen}-${modalState.editIndex}`}
        open={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal()
        }}
        sourceCategories={sourceCategories}
        mode={(() => {
          if (modalState.mode === 'edit' && modalState.editIndex !== null) {
            const row = getRowAtIndex(value, modalState.editIndex)
            if (row && !row.sourceCategory && !row.field) return 'add'
          }
          return modalState.mode
        })()}
        editRow={(() => {
          if (modalState.mode === 'edit' && modalState.editIndex !== null) {
            const row = getRowAtIndex(value, modalState.editIndex)
            if (row && !row.sourceCategory && !row.field) return null
            return row ?? null
          }
          return null
        })()}
        onConfirm={handleConfirmCondition}
      />
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts the CardFilterRow at a given index from the root group's conditions.
 * Returns undefined if the index is out of bounds or the condition isn't a row.
 */
function getRowAtIndex(group: FilterGroup, index: number): CardFilterRow | undefined {
  const condition = group.conditions[index]
  if (condition?.type === 'row') {
    return condition.row as CardFilterRow
  }
  return undefined
}
