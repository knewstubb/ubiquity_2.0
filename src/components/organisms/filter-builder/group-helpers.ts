/**
 * Group manipulation helpers for the Filter Builder.
 *
 * All functions are pure — they return new objects and never mutate input.
 * These handle logic toggling, condition CRUD, nested group management,
 * empty group pruning, and config-based validity checking.
 */

import type {
  FilterGroup,
  FilterCondition,
  CardFilterRow,
  SourceCategoryConfig,
} from './types'

// ─── Empty Row Factory ───────────────────────────────────────────────────────

function createEmptyRow(): CardFilterRow {
  return {
    sourceCategory: '',
    subSource: null,
    field: '',
    operator: '',
    value: null,
    dateMode: null,
  }
}

// ─── Group Logic ─────────────────────────────────────────────────────────────

/**
 * Flips the logic of a filter group (and → or, or → and).
 * Conditions remain unchanged.
 */
export function toggleGroupLogic(group: FilterGroup): FilterGroup {
  return {
    ...group,
    logic: group.logic === 'and' ? 'or' : 'and',
  }
}

// ─── Condition Operations ────────────────────────────────────────────────────

/**
 * Appends a new condition row to the end of the group's conditions.
 */
export function addConditionToGroup(
  group: FilterGroup,
  row: CardFilterRow
): FilterGroup {
  const newCondition: FilterCondition = { type: 'row', row }
  return {
    ...group,
    conditions: [...group.conditions, newCondition],
  }
}

/**
 * Removes the condition at the given index, preserving the order of remaining conditions.
 */
export function removeConditionFromGroup(
  group: FilterGroup,
  index: number
): FilterGroup {
  return {
    ...group,
    conditions: group.conditions.filter((_, i) => i !== index),
  }
}

/**
 * Replaces the condition at the given index with a new row, keeping all other
 * conditions unchanged.
 */
export function replaceConditionInGroup(
  group: FilterGroup,
  index: number,
  row: CardFilterRow
): FilterGroup {
  const conditions = group.conditions.map((condition, i) =>
    i === index ? ({ type: 'row', row } as FilterCondition) : condition
  )
  return { ...group, conditions }
}

// ─── Nested Groups ───────────────────────────────────────────────────────────

/**
 * Adds a new nested child group with the opposite logic of the parent
 * and one empty condition row.
 */
export function addNestedGroup(group: FilterGroup): FilterGroup {
  const childGroup: FilterGroup = {
    logic: group.logic === 'and' ? 'or' : 'and',
    conditions: [{ type: 'row', row: createEmptyRow() }],
  }
  const newCondition: FilterCondition = { type: 'group', group: childGroup }
  return {
    ...group,
    conditions: [...group.conditions, newCondition],
  }
}

/**
 * Recursively prunes empty nested groups from the filter tree.
 * The root group is never removed regardless of whether it has conditions.
 */
export function removeEmptyGroups(group: FilterGroup): FilterGroup {
  const conditions = group.conditions
    .map((condition) => {
      if (condition.type === 'group') {
        // Recurse into nested groups first
        const pruned = removeEmptyGroups(condition.group)
        // If the nested group has no conditions after pruning, exclude it
        if (pruned.conditions.length === 0) {
          return null
        }
        return { type: 'group' as const, group: pruned }
      }
      return condition
    })
    .filter((c): c is FilterCondition => c !== null)

  return { ...group, conditions }
}

// ─── Validity Checking ───────────────────────────────────────────────────────

/**
 * Checks if a condition row references keys that don't exist in the provided
 * source category configuration. A condition is invalid if:
 * - Its sourceCategory key doesn't match any config entry, OR
 * - Its field key doesn't exist within the matched category's fields
 *   (checking both top-level fields and sub-source fields)
 *
 * An empty row (sourceCategory === '') is considered invalid.
 */
export function isConditionInvalid(
  row: CardFilterRow,
  sourceCategories: SourceCategoryConfig[]
): boolean {
  // Empty source category is invalid
  if (!row.sourceCategory) {
    return true
  }

  // Find the matching source category config
  const category = sourceCategories.find((c) => c.key === row.sourceCategory)
  if (!category) {
    return true
  }

  // Empty field is invalid
  if (!row.field) {
    return true
  }

  // Check if field exists in the category's top-level fields
  const inTopLevelFields = category.fields.some((f) => f.key === row.field)
  if (inTopLevelFields) {
    return false
  }

  // Check if field exists within any sub-source's fields
  if (category.subSources) {
    const inSubSourceFields = category.subSources.some((sub) =>
      sub.fields.some((f) => f.key === row.field)
    )
    if (inSubSourceFields) {
      return false
    }
  }

  // Field key not found anywhere in the category
  return true
}
