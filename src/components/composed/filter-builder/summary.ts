/**
 * Summary generator for the Filter Builder.
 *
 * Converts a CardFilterRow into a human-readable natural language string
 * by resolving keys to their display labels. Falls back to raw keys when
 * source category or field cannot be resolved.
 */

import type {
  CardFilterRow,
  SourceCategoryConfig,
  SubSourceConfig,
  FilterFieldDef,
} from './types'
import { getOperatorsForType } from './operators'
import { NO_VALUE_OPERATORS, ARRAY_VALUE_OPERATORS } from './operators'

/**
 * Generates a natural language summary for a single filter condition row.
 *
 * Format: "{Source Category Title} {Field Label} {Operator Label} {Value}"
 * - No-value operators omit the value portion
 * - "between" formats as "between {start} – {end}" with locale date formatting
 * - "in_last_n_days" formats as "in last {N} days"
 * - Enum values resolve to their display labels
 * - Unresolvable keys fall back to raw key text
 */
export function generateConditionSummary(
  row: CardFilterRow,
  sourceCategories: SourceCategoryConfig[]
): string {
  const sourceCategoryTitle = resolveSourceCategoryTitle(row.sourceCategory, sourceCategories)
  const fieldDef = resolveFieldDef(row, sourceCategories)
  const fieldLabel = fieldDef?.label ?? row.field
  const operatorLabel = resolveOperatorLabel(row.operator, fieldDef?.dataType)
  const valuePortion = formatValue(row, fieldDef)

  // Date mode handling — only applies to date-type fields
  const isDateField = fieldDef?.dataType === 'date'

  if (isDateField && row.dateMode === 'anniversary') {
    // Format: "{Source} {Field} anniversary {operator} {value}"
    const parts = [sourceCategoryTitle, fieldLabel, 'anniversary', operatorLabel]
    if (valuePortion !== null) {
      parts.push(valuePortion)
    }
    return parts.join(' ')
  }

  if (isDateField && row.dateMode === 'same_day') {
    // Format: "{Source} {Field} same day as {value}"
    const parts = [sourceCategoryTitle, fieldLabel, 'same day as']
    if (valuePortion !== null) {
      parts.push(valuePortion)
    }
    return parts.join(' ')
  }

  // Default: no date mode qualifier (specific or null, or non-date field)
  const parts = [sourceCategoryTitle, fieldLabel, operatorLabel]

  if (valuePortion !== null) {
    parts.push(valuePortion)
  }

  return parts.join(' ')
}

/**
 * Resolves a source category key to its display title.
 * Falls back to the raw key if not found.
 */
function resolveSourceCategoryTitle(
  key: string,
  sourceCategories: SourceCategoryConfig[]
): string {
  const category = sourceCategories.find((c) => c.key === key)
  return category?.title ?? key
}

/**
 * Resolves the field definition for a given row, checking sub-source fields first,
 * then category-level fields.
 */
function resolveFieldDef(
  row: CardFilterRow,
  sourceCategories: SourceCategoryConfig[]
): FilterFieldDef | undefined {
  const category = sourceCategories.find((c) => c.key === row.sourceCategory)
  if (!category) return undefined

  // Check sub-source fields first if a sub-source is specified
  if (row.subSource && category.subSources) {
    const subSource = category.subSources.find(
      (s: SubSourceConfig) => s.key === row.subSource
    )
    if (subSource) {
      const field = subSource.fields.find((f: FilterFieldDef) => f.key === row.field)
      if (field) return field
    }
  }

  // Fall back to category-level fields
  return category.fields.find((f: FilterFieldDef) => f.key === row.field)
}

/**
 * Resolves an operator key to its display label for the given data type.
 * Falls back to the raw key if the operator or data type cannot be resolved.
 */
function resolveOperatorLabel(
  operatorKey: string,
  dataType?: 'text' | 'number' | 'date' | 'boolean' | 'enum'
): string {
  if (!dataType) return operatorKey

  const operators = getOperatorsForType(dataType)
  const op = operators.find((o) => o.value === operatorKey)
  return op?.label ?? operatorKey
}

/**
 * Formats the value portion of the summary based on operator and data type.
 * Returns null if the operator is a no-value operator.
 */
function formatValue(
  row: CardFilterRow,
  fieldDef?: FilterFieldDef
): string | null {
  // No-value operators produce no value portion
  if (NO_VALUE_OPERATORS.includes(row.operator)) {
    return null
  }

  // Handle "is_in" / "is_not_in" operators with array values
  if (ARRAY_VALUE_OPERATORS.includes(row.operator) && Array.isArray(row.value)) {
    return `${row.value.length} values`
  }

  // Handle "between" operator with date range
  if (row.operator === 'between' && Array.isArray(row.value)) {
    const [start, end] = row.value
    const startFormatted = formatDateValue(start)
    const endFormatted = formatDateValue(end)
    return `between ${startFormatted} – ${endFormatted}`
  }

  // Handle "in_last_n_days" operator
  if (row.operator === 'in_last_n_days') {
    return `in last ${row.value} days`
  }

  // Handle date values for single-date operators
  if (fieldDef?.dataType === 'date' && typeof row.value === 'string') {
    return formatDateValue(row.value)
  }

  // Handle enum values — resolve to display label
  if (fieldDef?.dataType === 'enum' && fieldDef.enumOptions && typeof row.value === 'string') {
    const option = fieldDef.enumOptions.find((o) => o.value === row.value)
    return option?.label ?? row.value
  }

  // Default: return the value as a string
  if (row.value === null || row.value === undefined) {
    return null
  }

  return String(row.value)
}

/**
 * Formats a date string using locale-aware short date formatting.
 */
function formatDateValue(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString()
}
