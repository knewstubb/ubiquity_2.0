import { describe, it, expect } from 'vitest'
import { isConditionComplete, validateValue } from './validation'
import type { CardFilterRow } from './types'

describe('isConditionComplete', () => {
  it('returns false when sourceCategory is empty', () => {
    const row: CardFilterRow = {
      sourceCategory: '',
      subSource: null,
      field: 'email',
      operator: 'equals',
      value: 'test@example.com',
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(false)
  })

  it('returns false when field is empty', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: '',
      operator: 'equals',
      value: 'test@example.com',
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(false)
  })

  it('returns false when operator is empty', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'email',
      operator: '',
      value: 'test@example.com',
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(false)
  })

  it('returns true for no-value operator with null value', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'email',
      operator: 'is_empty',
      value: null,
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(true)
  })

  it('returns true for is_true operator with null value', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'active',
      operator: 'is_true',
      value: null,
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(true)
  })

  it('returns false when value is null for value-requiring operator', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'email',
      operator: 'equals',
      value: null,
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(false)
  })

  it('returns false when value is an empty string', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'email',
      operator: 'contains',
      value: '',
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(false)
  })

  it('returns true for a valid text condition', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'email',
      operator: 'contains',
      value: '@example.com',
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(true)
  })

  it('returns true for a valid between condition with both values', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'between',
      value: ['2024-01-01', '2024-12-31'],
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(true)
  })

  it('returns false for between with empty start', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'between',
      value: ['', '2024-12-31'],
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(false)
  })

  it('returns false for between with empty end', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'between',
      value: ['2024-01-01', ''],
      dateMode: null,
    }
    expect(isConditionComplete(row)).toBe(false)
  })
})

describe('validateValue', () => {
  describe('no-value operators', () => {
    it('returns valid for is_empty regardless of value', () => {
      expect(validateValue('text', 'is_empty', null)).toEqual({ valid: true })
    })

    it('returns valid for is_not_empty regardless of value', () => {
      expect(validateValue('number', 'is_not_empty', null)).toEqual({ valid: true })
    })

    it('returns valid for is_true', () => {
      expect(validateValue('boolean', 'is_true', null)).toEqual({ valid: true })
    })

    it('returns valid for is_false', () => {
      expect(validateValue('boolean', 'is_false', null)).toEqual({ valid: true })
    })
  })

  describe('null value for value-requiring operators', () => {
    it('returns invalid when value is null', () => {
      const result = validateValue('text', 'equals', null)
      expect(result.valid).toBe(false)
      expect(result.message).toBeDefined()
    })
  })

  describe('text validation', () => {
    it('returns valid for non-empty string within limit', () => {
      expect(validateValue('text', 'equals', 'hello')).toEqual({ valid: true })
    })

    it('returns invalid for empty string', () => {
      const result = validateValue('text', 'equals', '')
      expect(result.valid).toBe(false)
    })

    it('returns invalid for whitespace-only string', () => {
      const result = validateValue('text', 'contains', '   ')
      expect(result.valid).toBe(false)
    })

    it('returns invalid for string over 500 characters', () => {
      const longStr = 'a'.repeat(501)
      const result = validateValue('text', 'equals', longStr)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('500')
    })

    it('returns valid for string exactly 500 characters', () => {
      const str = 'a'.repeat(500)
      expect(validateValue('text', 'equals', str)).toEqual({ valid: true })
    })
  })

  describe('number validation', () => {
    it('returns valid for integer', () => {
      expect(validateValue('number', 'equals', '42')).toEqual({ valid: true })
    })

    it('returns valid for decimal', () => {
      expect(validateValue('number', 'greater_than', '3.14')).toEqual({ valid: true })
    })

    it('returns valid for negative number', () => {
      expect(validateValue('number', 'less_than', '-5')).toEqual({ valid: true })
    })

    it('returns valid for numeric type', () => {
      expect(validateValue('number', 'equals', 99)).toEqual({ valid: true })
    })

    it('returns invalid for non-numeric string', () => {
      const result = validateValue('number', 'equals', 'abc')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('valid number')
    })

    it('returns invalid for empty string', () => {
      const result = validateValue('number', 'equals', '')
      expect(result.valid).toBe(false)
    })
  })

  describe('date validation', () => {
    it('returns valid for standard date operators with valid date', () => {
      expect(validateValue('date', 'equals', '2024-06-15')).toEqual({ valid: true })
    })

    it('returns invalid for empty date', () => {
      const result = validateValue('date', 'before', '')
      expect(result.valid).toBe(false)
    })

    it('returns invalid for invalid date string', () => {
      const result = validateValue('date', 'after', 'not-a-date')
      expect(result.valid).toBe(false)
    })
  })

  describe('date between validation', () => {
    it('returns valid when start ≤ end', () => {
      expect(
        validateValue('date', 'between', ['2024-01-01', '2024-12-31'])
      ).toEqual({ valid: true })
    })

    it('returns valid when start equals end', () => {
      expect(
        validateValue('date', 'between', ['2024-06-15', '2024-06-15'])
      ).toEqual({ valid: true })
    })

    it('returns invalid when start > end', () => {
      const result = validateValue('date', 'between', ['2024-12-31', '2024-01-01'])
      expect(result.valid).toBe(false)
      expect(result.message).toContain('before')
    })

    it('returns invalid when start is empty', () => {
      const result = validateValue('date', 'between', ['', '2024-12-31'])
      expect(result.valid).toBe(false)
    })

    it('returns invalid when end is empty', () => {
      const result = validateValue('date', 'between', ['2024-01-01', ''])
      expect(result.valid).toBe(false)
    })

    it('returns invalid when value is not a tuple', () => {
      const result = validateValue('date', 'between', '2024-01-01')
      expect(result.valid).toBe(false)
    })
  })

  describe('in_last_n_days validation', () => {
    it('returns valid for whole number within range', () => {
      expect(validateValue('date', 'in_last_n_days', '30')).toEqual({ valid: true })
    })

    it('returns valid for 1 (minimum)', () => {
      expect(validateValue('date', 'in_last_n_days', '1')).toEqual({ valid: true })
    })

    it('returns valid for 3650 (maximum)', () => {
      expect(validateValue('date', 'in_last_n_days', '3650')).toEqual({ valid: true })
    })

    it('returns invalid for 0', () => {
      const result = validateValue('date', 'in_last_n_days', '0')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('between 1 and 3650')
    })

    it('returns invalid for 3651', () => {
      const result = validateValue('date', 'in_last_n_days', '3651')
      expect(result.valid).toBe(false)
    })

    it('returns invalid for decimal', () => {
      const result = validateValue('date', 'in_last_n_days', '7.5')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('whole number')
    })

    it('returns invalid for negative number', () => {
      const result = validateValue('date', 'in_last_n_days', '-5')
      expect(result.valid).toBe(false)
    })

    it('returns invalid for non-numeric string', () => {
      const result = validateValue('date', 'in_last_n_days', 'week')
      expect(result.valid).toBe(false)
    })

    it('returns valid for numeric type', () => {
      expect(validateValue('date', 'in_last_n_days', 90)).toEqual({ valid: true })
    })
  })

  describe('enum validation', () => {
    const options = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ]

    it('returns valid for value in options', () => {
      expect(validateValue('enum', 'equals', 'active', options)).toEqual({ valid: true })
    })

    it('returns invalid for value not in options', () => {
      const result = validateValue('enum', 'equals', 'deleted', options)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('available options')
    })

    it('returns invalid for empty string', () => {
      const result = validateValue('enum', 'equals', '', options)
      expect(result.valid).toBe(false)
    })

    it('returns invalid when no options provided', () => {
      const result = validateValue('enum', 'equals', 'active')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('No options')
    })

    it('returns invalid when options array is empty', () => {
      const result = validateValue('enum', 'equals', 'active', [])
      expect(result.valid).toBe(false)
    })
  })

  describe('anniversary date mode validation', () => {
    it('returns valid for valid MM-DD format (03-15)', () => {
      expect(validateValue('date', 'equals', '03-15', undefined, 'anniversary')).toEqual({ valid: true })
    })

    it('returns valid for month 01 and day 01', () => {
      expect(validateValue('date', 'equals', '01-01', undefined, 'anniversary')).toEqual({ valid: true })
    })

    it('returns valid for month 12 and day 31', () => {
      expect(validateValue('date', 'equals', '12-31', undefined, 'anniversary')).toEqual({ valid: true })
    })

    it('returns invalid for month 0', () => {
      const result = validateValue('date', 'equals', '00-15', undefined, 'anniversary')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('Month')
    })

    it('returns invalid for month 13', () => {
      const result = validateValue('date', 'equals', '13-15', undefined, 'anniversary')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('Month')
    })

    it('returns invalid for day 0', () => {
      const result = validateValue('date', 'equals', '03-00', undefined, 'anniversary')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('Day')
    })

    it('returns invalid for day 32', () => {
      const result = validateValue('date', 'equals', '03-32', undefined, 'anniversary')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('Day')
    })

    it('returns invalid for non-MM-DD format', () => {
      const result = validateValue('date', 'equals', '2024-03-15', undefined, 'anniversary')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('MM-DD')
    })

    it('returns invalid for empty string in anniversary mode', () => {
      const result = validateValue('date', 'equals', '', undefined, 'anniversary')
      expect(result.valid).toBe(false)
    })

    it('returns invalid for non-numeric parts', () => {
      const result = validateValue('date', 'equals', 'ab-cd', undefined, 'anniversary')
      expect(result.valid).toBe(false)
    })

    it('anniversary mode applies to before operator', () => {
      expect(validateValue('date', 'before', '06-20', undefined, 'anniversary')).toEqual({ valid: true })
    })

    it('anniversary mode applies to after operator', () => {
      expect(validateValue('date', 'after', '11-05', undefined, 'anniversary')).toEqual({ valid: true })
    })
  })

  describe('dateMode ignored for non-date fields', () => {
    it('text field with anniversary dateMode is validated as text (not date)', () => {
      // A text field value "03-15" should be valid as text even with dateMode set
      expect(validateValue('text', 'equals', '03-15', undefined, 'anniversary')).toEqual({ valid: true })
    })

    it('number field with anniversary dateMode is validated as number', () => {
      // Number validation applies, dateMode is ignored
      expect(validateValue('number', 'equals', '42', undefined, 'anniversary')).toEqual({ valid: true })
    })

    it('number field with dateMode does not apply date validation', () => {
      // "abc" fails number validation regardless of dateMode
      const result = validateValue('number', 'equals', 'abc', undefined, 'anniversary')
      expect(result.valid).toBe(false)
      expect(result.message).toContain('valid number')
    })

    it('enum field with dateMode still validates against enum options', () => {
      const options = [{ value: 'active', label: 'Active' }]
      expect(validateValue('enum', 'equals', 'active', options, 'same_day')).toEqual({ valid: true })
    })
  })
})
