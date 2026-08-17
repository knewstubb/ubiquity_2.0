/**
 * Validation utilities for the Filter Builder.
 *
 * Provides pure functions to validate condition completeness and
 * individual field values based on data type and operator.
 */

import type { CardFilterRow, FilterFieldDef } from './types'
import { NO_VALUE_OPERATORS, ARRAY_VALUE_OPERATORS, SUB_FILTER_OPERATORS } from './operators'

// ─── Validation Result ───────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  message?: string
}

// ─── Condition Completeness ──────────────────────────────────────────────────

/**
 * Checks whether a CardFilterRow has all required fields set and a valid value.
 *
 * Rules:
 * - sourceCategory, field, and operator must be non-empty strings.
 * - For no-value operators (is_empty, is_not_empty, is_true, is_false,
 *   has_transactions, has_no_transactions): value can be null.
 * - For sub-filter operators (has_matching_transactions, does_not_have_matching):
 *   at least one sub-filter condition must be present.
 * - For array-value operators (is_in, is_not_in): value must be a non-empty string[].
 * - For value-requiring operators: value must be present (non-null, non-empty string).
 */
export function isConditionComplete(row: CardFilterRow): boolean {
  // Required fields must be set
  if (!row.sourceCategory || !row.field || !row.operator) {
    return false
  }

  // No-value operators don't require a value (includes has_transactions, has_no_transactions)
  if (NO_VALUE_OPERATORS.includes(row.operator)) {
    return true
  }

  // Sub-filter operators require at least one sub-filter condition
  if (SUB_FILTER_OPERATORS.includes(row.operator)) {
    return !!(
      row.subFilters &&
      row.subFilters.conditions.length > 0 &&
      row.subFilters.conditions.every((c) => {
        if (c.type === 'row') {
          const r = c.row
          return !!(r.field && r.operator && (r.value !== null && r.value !== undefined && r.value !== ''))
        }
        return true
      })
    )
  }

  // Array-value operators (is_in, is_not_in) require a non-empty string[]
  if (ARRAY_VALUE_OPERATORS.includes(row.operator)) {
    return Array.isArray(row.value) && row.value.length > 0
  }

  // Value-requiring operators must have a present value
  if (row.value === null || row.value === undefined) {
    return false
  }

  // Empty string is not valid
  if (typeof row.value === 'string' && row.value.trim() === '') {
    return false
  }

  // For between (tuple), both values must be present
  if (Array.isArray(row.value)) {
    const [start, end] = row.value
    return start !== '' && end !== ''
  }

  return true
}

// ─── Value Validation ────────────────────────────────────────────────────────

/**
 * Validates a value based on its data type and operator.
 * Pure function — no side effects.
 *
 * @param dataType - The field's data type
 * @param operator - The selected operator
 * @param value - The current value to validate
 * @param enumOptions - Available enum options (required for enum validation)
 * @param dateMode - The date mode for date fields (ignored for non-date fields)
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateValue(
  dataType: FilterFieldDef['dataType'],
  operator: string,
  value: string | number | boolean | null | [string, string] | string[],
  enumOptions?: { value: string; label: string }[],
  dateMode?: 'specific' | 'anniversary' | 'same_day' | null
): ValidationResult {
  // No-value operators are always valid (value is ignored)
  if (NO_VALUE_OPERATORS.includes(operator)) {
    return { valid: true }
  }

  // Array-value operators (is_in, is_not_in) require a non-empty string[]
  if (ARRAY_VALUE_OPERATORS.includes(operator)) {
    return validateArrayValue(dataType, value, enumOptions)
  }

  // Null/undefined value is invalid for value-requiring operators
  if (value === null || value === undefined) {
    return { valid: false, message: 'A value is required' }
  }

  // Silently treat dateMode as null for non-date fields
  const effectiveDateMode = dataType === 'date' ? (dateMode ?? null) : null

  switch (dataType) {
    case 'text':
      return validateText(value)
    case 'number':
      return validateNumber(value)
    case 'date':
      return validateDate(operator, value, effectiveDateMode)
    case 'boolean':
      return { valid: true }
    case 'enum':
      return validateEnum(value, enumOptions)
    default:
      return { valid: true }
  }
}

// ─── Type-Specific Validators ────────────────────────────────────────────────

function validateArrayValue(
  dataType: FilterFieldDef['dataType'],
  value: string | number | boolean | null | [string, string] | string[],
  enumOptions?: { value: string; label: string }[]
): ValidationResult {
  if (!Array.isArray(value)) {
    return { valid: false, message: 'Value must be a list' }
  }

  if (value.length === 0) {
    return { valid: false, message: 'At least one value is required' }
  }

  // For number type: each chip must be a valid number string
  if (dataType === 'number') {
    for (const chip of value) {
      const num = Number(chip)
      if (isNaN(num) || !isFinite(num)) {
        return { valid: false, message: `"${chip}" is not a valid number` }
      }
    }
  }

  // For enum type: each chip must be a valid enum option value
  if (dataType === 'enum') {
    if (!enumOptions || enumOptions.length === 0) {
      return { valid: false, message: 'No options available' }
    }
    const validValues = enumOptions.map((opt) => opt.value)
    for (const chip of value) {
      if (!validValues.includes(chip)) {
        return { valid: false, message: `"${chip}" is not a valid option` }
      }
    }
  }

  // For text type: just needs to be a non-empty array (chips are already trimmed)
  return { valid: true }
}

function validateText(value: string | number | boolean | null | [string, string]): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, message: 'Text value must be a string' }
  }

  if (value.trim() === '') {
    return { valid: false, message: 'Value cannot be empty' }
  }

  if (value.length > 500) {
    return { valid: false, message: 'Value must be 500 characters or fewer' }
  }

  return { valid: true }
}

function validateNumber(value: string | number | boolean | null | [string, string]): ValidationResult {
  // Accept both string and number representations
  const numStr = typeof value === 'number' ? String(value) : value

  if (typeof numStr !== 'string') {
    return { valid: false, message: 'Invalid number value' }
  }

  if (numStr.trim() === '') {
    return { valid: false, message: 'A number is required' }
  }

  const num = Number(numStr)
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, message: 'Must be a valid number' }
  }

  return { valid: true }
}

function validateDate(
  operator: string,
  value: string | number | boolean | null | [string, string],
  dateMode?: 'specific' | 'anniversary' | 'same_day' | null
): ValidationResult {
  if (operator === 'between') {
    return validateDateBetween(value)
  }

  if (operator === 'in_last_n_days') {
    return validateInLastNDays(value)
  }

  // Anniversary mode: validate month (1–12) and day (1–31), value stored as "MM-DD"
  if (dateMode === 'anniversary') {
    return validateAnniversaryDate(value)
  }

  // Standard date operators (equals, before, after) — just needs a valid date string
  if (typeof value !== 'string' || value.trim() === '') {
    return { valid: false, message: 'A date is required' }
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Must be a valid date' }
  }

  return { valid: true }
}

function validateAnniversaryDate(
  value: string | number | boolean | null | [string, string]
): ValidationResult {
  if (typeof value !== 'string' || value.trim() === '') {
    return { valid: false, message: 'A month and day are required' }
  }

  // Expected format: "MM-DD"
  const parts = value.split('-')
  if (parts.length !== 2) {
    return { valid: false, message: 'Must be in MM-DD format' }
  }

  const [monthStr, dayStr] = parts
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)

  if (isNaN(month) || isNaN(day)) {
    return { valid: false, message: 'Must be in MM-DD format' }
  }

  if (month < 1 || month > 12) {
    return { valid: false, message: 'Month must be between 1 and 12' }
  }

  if (day < 1 || day > 31) {
    return { valid: false, message: 'Day must be between 1 and 31' }
  }

  return { valid: true }
}

function validateDateBetween(value: string | number | boolean | null | [string, string]): ValidationResult {
  if (!Array.isArray(value) || value.length !== 2) {
    return { valid: false, message: 'Between requires a start and end date' }
  }

  const [startStr, endStr] = value

  if (!startStr || !endStr) {
    return { valid: false, message: 'Both start and end dates are required' }
  }

  const start = new Date(startStr)
  const end = new Date(endStr)

  if (isNaN(start.getTime())) {
    return { valid: false, message: 'Start date is invalid' }
  }

  if (isNaN(end.getTime())) {
    return { valid: false, message: 'End date is invalid' }
  }

  if (start > end) {
    return { valid: false, message: 'Start date must be on or before end date' }
  }

  return { valid: true }
}

function validateInLastNDays(value: string | number | boolean | null | [string, string]): ValidationResult {
  const numStr = typeof value === 'number' ? String(value) : value

  if (typeof numStr !== 'string') {
    return { valid: false, message: 'Must be a number of days' }
  }

  if (numStr.trim() === '') {
    return { valid: false, message: 'Number of days is required' }
  }

  const num = Number(numStr)

  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, message: 'Must be a valid number' }
  }

  if (!Number.isInteger(num)) {
    return { valid: false, message: 'Must be a whole number' }
  }

  if (num < 1 || num > 3650) {
    return { valid: false, message: 'Must be between 1 and 3650 days' }
  }

  return { valid: true }
}

function validateEnum(
  value: string | number | boolean | null | [string, string],
  enumOptions?: { value: string; label: string }[]
): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, message: 'Enum value must be a string' }
  }

  if (value.trim() === '') {
    return { valid: false, message: 'A value must be selected' }
  }

  if (!enumOptions || enumOptions.length === 0) {
    return { valid: false, message: 'No options available' }
  }

  const validValues = enumOptions.map((opt) => opt.value)
  if (!validValues.includes(value)) {
    return { valid: false, message: 'Must be one of the available options' }
  }

  return { valid: true }
}
