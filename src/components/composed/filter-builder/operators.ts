/**
 * Operator definitions for the Filter Builder.
 *
 * Defines operator sets per data type and provides a lookup function
 * to retrieve the appropriate operators for a given field type.
 */

// ─── Operator Definition ─────────────────────────────────────────────────────

export interface OperatorDef {
  value: string
  label: string
}

// ─── Operator Sets by Data Type ──────────────────────────────────────────────

export const TEXT_OPERATORS: OperatorDef[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'does_not_contain', label: 'Does not contain' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'is_in', label: 'Is in' },
  { value: 'is_not_in', label: 'Is not in' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

export const NUMBER_OPERATORS: OperatorDef[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'greater_or_equal', label: 'Greater or equal' },
  { value: 'less_or_equal', label: 'Less or equal' },
  { value: 'is_in', label: 'Is in' },
  { value: 'is_not_in', label: 'Is not in' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

export const DATE_OPERATORS: OperatorDef[] = [
  { value: 'equals', label: 'On' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'between', label: 'Between' },
  { value: 'in_last_n_days', label: 'In last N days' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

export const BOOLEAN_OPERATORS: OperatorDef[] = [
  { value: 'is_true', label: 'Is true' },
  { value: 'is_false', label: 'Is false' },
]

export const ENUM_OPERATORS: OperatorDef[] = [
  { value: 'equals', label: 'Is' },
  { value: 'not_equals', label: 'Is not' },
  { value: 'is_in', label: 'Is in' },
  { value: 'is_not_in', label: 'Is not in' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
]

// ─── No-Value Operators ──────────────────────────────────────────────────────

/**
 * Operators that do not require a value input.
 * When one of these is selected, the value field is hidden and confirm is enabled immediately.
 */
export const NO_VALUE_OPERATORS: string[] = [
  'is_true',
  'is_false',
  'is_empty',
  'is_not_empty',
  'has_transactions',
  'has_no_transactions',
]

// ─── Relationship Operators ──────────────────────────────────────────────────

/**
 * Operators for transactional sub-source relationships.
 * Used when a sub-source has sourceType: 'transactional' instead of field-level operators.
 */
export const RELATIONSHIP_OPERATORS: OperatorDef[] = [
  { value: 'has_transactions', label: 'Has transactions' },
  { value: 'has_no_transactions', label: 'Has no transactions' },
  { value: 'has_matching_transactions', label: 'Has matching transactions' },
  { value: 'does_not_have_matching', label: 'Does not have matching transactions' },
]

/**
 * Relationship operators that require sub-filter conditions.
 */
export const SUB_FILTER_OPERATORS: string[] = [
  'has_matching_transactions',
  'does_not_have_matching',
]

// ─── Array-Value Operators ───────────────────────────────────────────────────

/**
 * Operators that require a string[] value (chip-based input).
 * Confirm is disabled when the array is empty.
 */
export const ARRAY_VALUE_OPERATORS: string[] = [
  'is_in',
  'is_not_in',
]

// ─── Operator Lookup ─────────────────────────────────────────────────────────

type DataType = 'text' | 'number' | 'date' | 'boolean' | 'enum'

const OPERATORS_BY_TYPE: Record<DataType, OperatorDef[]> = {
  text: TEXT_OPERATORS,
  number: NUMBER_OPERATORS,
  date: DATE_OPERATORS,
  boolean: BOOLEAN_OPERATORS,
  enum: ENUM_OPERATORS,
}

/**
 * Returns the operator definitions for a given data type.
 */
export function getOperatorsForType(dataType: DataType): OperatorDef[] {
  return OPERATORS_BY_TYPE[dataType] ?? []
}
