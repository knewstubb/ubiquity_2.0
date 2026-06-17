import { describe, it, expect } from 'vitest'
import { generateConditionSummary } from './summary'
import type { CardFilterRow, SourceCategoryConfig } from './types'

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const mockSourceCategories: SourceCategoryConfig[] = [
  {
    key: 'contacts',
    icon: null,
    title: 'Contacts',
    description: 'Contact fields',
    subSources: [
      {
        key: 'orders',
        label: 'Orders',
        fields: [
          { key: 'order_amount', label: 'Order Amount', dataType: 'number' },
          { key: 'order_date', label: 'Order Date', dataType: 'date' },
        ],
      },
    ],
    fields: [
      { key: 'first_name', label: 'First Name', dataType: 'text' },
      { key: 'email', label: 'Email', dataType: 'text' },
      { key: 'created_at', label: 'Created At', dataType: 'date' },
      { key: 'is_active', label: 'Is Active', dataType: 'boolean' },
      {
        key: 'status',
        label: 'Status',
        dataType: 'enum',
        enumOptions: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' },
        ],
      },
    ],
  },
  {
    key: 'transactions',
    icon: null,
    title: 'Transactions',
    description: 'Transaction data',
    fields: [
      { key: 'amount', label: 'Amount', dataType: 'number' },
      { key: 'tx_date', label: 'Transaction Date', dataType: 'date' },
    ],
  },
]

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('generateConditionSummary', () => {
  it('resolves source category, field, and operator to labels', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'first_name',
      operator: 'equals',
      value: 'John',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts First Name Equals John')
  })

  it('handles text contains operator', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'email',
      operator: 'contains',
      value: '@gmail.com',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts Email Contains @gmail.com')
  })

  it('omits value for no-value operators (is_empty)', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'email',
      operator: 'is_empty',
      value: null,
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts Email Is empty')
  })

  it('omits value for no-value operators (is_not_empty)', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'first_name',
      operator: 'is_not_empty',
      value: null,
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts First Name Is not empty')
  })

  it('omits value for boolean no-value operators (is_true)', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'is_active',
      operator: 'is_true',
      value: null,
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts Is Active Is true')
  })

  it('formats "between" with locale date formatting', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'between',
      value: ['2024-01-15', '2024-03-20'],
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    // Verify the format pattern: "between {date} – {date}"
    expect(result).toContain('Contacts Created At Between between')
    expect(result).toContain('–')
  })

  it('formats "in_last_n_days" correctly', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'in_last_n_days',
      value: 30,
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts Created At In last N days in last 30 days')
  })

  it('resolves enum values to their display labels', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'status',
      operator: 'equals',
      value: 'active',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts Status Is Active')
  })

  it('falls back to raw enum value when option not found', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'status',
      operator: 'equals',
      value: 'unknown_status',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts Status Is unknown_status')
  })

  it('falls back to raw key for unresolvable source category', () => {
    const row: CardFilterRow = {
      sourceCategory: 'nonexistent_source',
      subSource: null,
      field: 'some_field',
      operator: 'equals',
      value: 'test',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toContain('nonexistent_source')
    expect(result).toContain('some_field')
  })

  it('falls back to raw key for unresolvable field', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'nonexistent_field',
      operator: 'equals',
      value: 'test',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toContain('Contacts')
    expect(result).toContain('nonexistent_field')
  })

  it('resolves fields from sub-sources correctly', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: 'orders',
      field: 'order_amount',
      operator: 'greater_than',
      value: 100,
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Contacts Order Amount Greater than 100')
  })

  it('formats single date values using toLocaleDateString', () => {
    const row: CardFilterRow = {
      sourceCategory: 'transactions',
      subSource: null,
      field: 'tx_date',
      operator: 'before',
      value: '2024-06-15',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toContain('Transactions Transaction Date Before')
    // Should contain a locale-formatted date, not the raw ISO string
    expect(result).not.toContain('2024-06-15')
  })

  it('handles number values correctly', () => {
    const row: CardFilterRow = {
      sourceCategory: 'transactions',
      subSource: null,
      field: 'amount',
      operator: 'greater_or_equal',
      value: 500,
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toBe('Transactions Amount Greater or equal 500')
  })

  // ─── Date Mode Tests ─────────────────────────────────────────────────────────

  it('includes "anniversary" qualifier for dateMode "anniversary"', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'equals',
      value: '2024-03-15',
      dateMode: 'anniversary',
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    // Format: "{Source} {Field} anniversary {operator} {value}"
    expect(result).toContain('Contacts Created At anniversary On')
    expect(result).not.toContain('2024-03-15')
  })

  it('includes "same day as" qualifier for dateMode "same_day"', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'equals',
      value: '2024-12-25',
      dateMode: 'same_day',
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    // Format: "{Source} {Field} same day as {value}"
    expect(result).toContain('Contacts Created At same day as')
    expect(result).not.toContain('2024-12-25')
  })

  it('does not add qualifier for dateMode "specific"', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'before',
      value: '2024-06-15',
      dateMode: 'specific',
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toContain('Contacts Created At Before')
    expect(result).not.toContain('anniversary')
    expect(result).not.toContain('same day as')
  })

  it('does not add qualifier when dateMode is null for date fields', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'created_at',
      operator: 'after',
      value: '2024-06-15',
      dateMode: null,
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toContain('Contacts Created At After')
    expect(result).not.toContain('anniversary')
    expect(result).not.toContain('same day as')
  })

  it('ignores dateMode for non-date fields', () => {
    const row: CardFilterRow = {
      sourceCategory: 'contacts',
      subSource: null,
      field: 'first_name',
      operator: 'equals',
      value: 'John',
      dateMode: 'anniversary',
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    // Non-date fields should not get the qualifier
    expect(result).toBe('Contacts First Name Equals John')
    expect(result).not.toContain('anniversary')
  })

  it('anniversary mode with "before" operator', () => {
    const row: CardFilterRow = {
      sourceCategory: 'transactions',
      subSource: null,
      field: 'tx_date',
      operator: 'before',
      value: '2024-03-15',
      dateMode: 'anniversary',
    }
    const result = generateConditionSummary(row, mockSourceCategories)
    expect(result).toContain('Transactions Transaction Date anniversary Before')
  })
})
