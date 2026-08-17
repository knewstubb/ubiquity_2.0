import { describe, it, expect } from 'vitest'
import {
  toggleGroupLogic,
  addConditionToGroup,
  removeConditionFromGroup,
  replaceConditionInGroup,
  addNestedGroup,
  removeEmptyGroups,
  isConditionInvalid,
} from './group-helpers'
import type { FilterGroup, CardFilterRow, SourceCategoryConfig } from './types'

// ─── Test Helpers ────────────────────────────────────────────────────────────

function makeRow(overrides: Partial<CardFilterRow> = {}): CardFilterRow {
  return {
    sourceCategory: 'contacts',
    subSource: null,
    field: 'email',
    operator: 'contains',
    value: '@example.com',
    dateMode: null,
    ...overrides,
  }
}

function makeGroup(overrides: Partial<FilterGroup> = {}): FilterGroup {
  return {
    logic: 'and',
    conditions: [],
    ...overrides,
  }
}

const mockCategories: SourceCategoryConfig[] = [
  {
    key: 'contacts',
    icon: null,
    title: 'Contacts',
    description: 'Contact data',
    fields: [
      { key: 'email', label: 'Email', dataType: 'text' },
      { key: 'name', label: 'Name', dataType: 'text' },
    ],
    subSources: [
      {
        key: 'addresses',
        label: 'Addresses',
        fields: [{ key: 'city', label: 'City', dataType: 'text' }],
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
      { key: 'date', label: 'Date', dataType: 'date' },
    ],
  },
]

// ─── toggleGroupLogic ────────────────────────────────────────────────────────

describe('toggleGroupLogic', () => {
  it('flips and to or', () => {
    const group = makeGroup({ logic: 'and' })
    const result = toggleGroupLogic(group)
    expect(result.logic).toBe('or')
  })

  it('flips or to and', () => {
    const group = makeGroup({ logic: 'or' })
    const result = toggleGroupLogic(group)
    expect(result.logic).toBe('and')
  })

  it('preserves conditions', () => {
    const row = makeRow()
    const group = makeGroup({
      logic: 'and',
      conditions: [{ type: 'row', row: row as never }],
    })
    const result = toggleGroupLogic(group)
    expect(result.conditions).toEqual(group.conditions)
  })

  it('does not mutate input', () => {
    const group = makeGroup({ logic: 'and' })
    toggleGroupLogic(group)
    expect(group.logic).toBe('and')
  })
})

// ─── addConditionToGroup ─────────────────────────────────────────────────────

describe('addConditionToGroup', () => {
  it('appends condition to empty group', () => {
    const group = makeGroup()
    const row = makeRow()
    const result = addConditionToGroup(group, row)
    expect(result.conditions).toHaveLength(1)
    expect(result.conditions[0]).toEqual({ type: 'row', row })
  })

  it('appends condition to end of existing conditions', () => {
    const existing = makeRow({ field: 'name' })
    const group = makeGroup({
      conditions: [{ type: 'row', row: existing as never }],
    })
    const newRow = makeRow({ field: 'email' })
    const result = addConditionToGroup(group, newRow)
    expect(result.conditions).toHaveLength(2)
    expect(result.conditions[1]).toEqual({ type: 'row', row: newRow })
  })

  it('does not mutate input', () => {
    const group = makeGroup()
    addConditionToGroup(group, makeRow())
    expect(group.conditions).toHaveLength(0)
  })
})

// ─── removeConditionFromGroup ────────────────────────────────────────────────

describe('removeConditionFromGroup', () => {
  it('removes condition at given index', () => {
    const rows = [makeRow({ field: 'a' }), makeRow({ field: 'b' }), makeRow({ field: 'c' })]
    const group = makeGroup({
      conditions: rows.map((r) => ({ type: 'row' as const, row: r as never })),
    })
    const result = removeConditionFromGroup(group, 1)
    expect(result.conditions).toHaveLength(2)
    expect((result.conditions[0] as { type: 'row'; row: CardFilterRow }).row.field).toBe('a')
    expect((result.conditions[1] as { type: 'row'; row: CardFilterRow }).row.field).toBe('c')
  })

  it('preserves order of remaining conditions', () => {
    const rows = [makeRow({ field: 'x' }), makeRow({ field: 'y' }), makeRow({ field: 'z' })]
    const group = makeGroup({
      conditions: rows.map((r) => ({ type: 'row' as const, row: r as never })),
    })
    const result = removeConditionFromGroup(group, 0)
    expect((result.conditions[0] as { type: 'row'; row: CardFilterRow }).row.field).toBe('y')
    expect((result.conditions[1] as { type: 'row'; row: CardFilterRow }).row.field).toBe('z')
  })

  it('does not mutate input', () => {
    const group = makeGroup({
      conditions: [{ type: 'row', row: makeRow() as never }],
    })
    removeConditionFromGroup(group, 0)
    expect(group.conditions).toHaveLength(1)
  })
})

// ─── replaceConditionInGroup ─────────────────────────────────────────────────

describe('replaceConditionInGroup', () => {
  it('replaces condition at given index', () => {
    const rows = [makeRow({ field: 'a' }), makeRow({ field: 'b' })]
    const group = makeGroup({
      conditions: rows.map((r) => ({ type: 'row' as const, row: r as never })),
    })
    const replacement = makeRow({ field: 'replaced' })
    const result = replaceConditionInGroup(group, 1, replacement)
    expect((result.conditions[1] as { type: 'row'; row: CardFilterRow }).row.field).toBe('replaced')
  })

  it('keeps other conditions unchanged', () => {
    const rows = [makeRow({ field: 'a' }), makeRow({ field: 'b' }), makeRow({ field: 'c' })]
    const group = makeGroup({
      conditions: rows.map((r) => ({ type: 'row' as const, row: r as never })),
    })
    const replacement = makeRow({ field: 'new' })
    const result = replaceConditionInGroup(group, 1, replacement)
    expect(result.conditions).toHaveLength(3)
    expect((result.conditions[0] as { type: 'row'; row: CardFilterRow }).row.field).toBe('a')
    expect((result.conditions[2] as { type: 'row'; row: CardFilterRow }).row.field).toBe('c')
  })

  it('does not mutate input', () => {
    const group = makeGroup({
      conditions: [{ type: 'row', row: makeRow({ field: 'original' }) as never }],
    })
    replaceConditionInGroup(group, 0, makeRow({ field: 'new' }))
    expect((group.conditions[0] as { type: 'row'; row: CardFilterRow }).row.field).toBe('original')
  })
})

// ─── addNestedGroup ──────────────────────────────────────────────────────────

describe('addNestedGroup', () => {
  it('adds a nested group with opposite logic (and → or)', () => {
    const group = makeGroup({ logic: 'and' })
    const result = addNestedGroup(group)
    const nested = result.conditions[0] as { type: 'group'; group: FilterGroup }
    expect(nested.type).toBe('group')
    expect(nested.group.logic).toBe('or')
  })

  it('adds a nested group with opposite logic (or → and)', () => {
    const group = makeGroup({ logic: 'or' })
    const result = addNestedGroup(group)
    const nested = result.conditions[0] as { type: 'group'; group: FilterGroup }
    expect(nested.group.logic).toBe('and')
  })

  it('nested group contains one empty row', () => {
    const group = makeGroup({ logic: 'and' })
    const result = addNestedGroup(group)
    const nested = result.conditions[0] as { type: 'group'; group: FilterGroup }
    expect(nested.group.conditions).toHaveLength(1)
    const row = nested.group.conditions[0] as { type: 'row'; row: CardFilterRow }
    expect(row.type).toBe('row')
    expect(row.row).toEqual({
      sourceCategory: '',
      subSource: null,
      field: '',
      operator: '',
      value: null,
      dateMode: null,
    })
  })

  it('appends nested group to existing conditions', () => {
    const group = makeGroup({
      logic: 'and',
      conditions: [{ type: 'row', row: makeRow() as never }],
    })
    const result = addNestedGroup(group)
    expect(result.conditions).toHaveLength(2)
    expect(result.conditions[0].type).toBe('row')
    expect(result.conditions[1].type).toBe('group')
  })

  it('does not mutate input', () => {
    const group = makeGroup()
    addNestedGroup(group)
    expect(group.conditions).toHaveLength(0)
  })
})

// ─── removeEmptyGroups ───────────────────────────────────────────────────────

describe('removeEmptyGroups', () => {
  it('removes nested groups with no conditions', () => {
    const group = makeGroup({
      conditions: [
        { type: 'row', row: makeRow() as never },
        { type: 'group', group: { logic: 'or', conditions: [] } },
      ],
    })
    const result = removeEmptyGroups(group)
    expect(result.conditions).toHaveLength(1)
    expect(result.conditions[0].type).toBe('row')
  })

  it('preserves root group even if empty', () => {
    const group = makeGroup({ conditions: [] })
    const result = removeEmptyGroups(group)
    expect(result).toEqual({ logic: 'and', conditions: [] })
  })

  it('recursively prunes deeply nested empty groups', () => {
    const group = makeGroup({
      conditions: [
        {
          type: 'group',
          group: {
            logic: 'or',
            conditions: [
              { type: 'group', group: { logic: 'and', conditions: [] } },
            ],
          },
        },
      ],
    })
    const result = removeEmptyGroups(group)
    // The inner-most empty group is pruned, which makes its parent empty, which is also pruned
    expect(result.conditions).toHaveLength(0)
  })

  it('preserves non-empty nested groups', () => {
    const group = makeGroup({
      conditions: [
        {
          type: 'group',
          group: {
            logic: 'or',
            conditions: [{ type: 'row', row: makeRow() as never }],
          },
        },
      ],
    })
    const result = removeEmptyGroups(group)
    expect(result.conditions).toHaveLength(1)
    expect(result.conditions[0].type).toBe('group')
  })

  it('does not mutate input', () => {
    const emptyNested = { type: 'group' as const, group: { logic: 'or' as const, conditions: [] } }
    const group = makeGroup({ conditions: [emptyNested] })
    removeEmptyGroups(group)
    expect(group.conditions).toHaveLength(1)
  })
})

// ─── isConditionInvalid ──────────────────────────────────────────────────────

describe('isConditionInvalid', () => {
  it('returns true for empty sourceCategory', () => {
    const row = makeRow({ sourceCategory: '' })
    expect(isConditionInvalid(row, mockCategories)).toBe(true)
  })

  it('returns true for non-existent sourceCategory', () => {
    const row = makeRow({ sourceCategory: 'nonexistent' })
    expect(isConditionInvalid(row, mockCategories)).toBe(true)
  })

  it('returns true for non-existent field in category', () => {
    const row = makeRow({ sourceCategory: 'contacts', field: 'nonexistent_field' })
    expect(isConditionInvalid(row, mockCategories)).toBe(true)
  })

  it('returns false for valid category + top-level field', () => {
    const row = makeRow({ sourceCategory: 'contacts', field: 'email' })
    expect(isConditionInvalid(row, mockCategories)).toBe(false)
  })

  it('returns false for valid category + sub-source field', () => {
    const row = makeRow({ sourceCategory: 'contacts', field: 'city' })
    expect(isConditionInvalid(row, mockCategories)).toBe(false)
  })

  it('returns true for empty field', () => {
    const row = makeRow({ sourceCategory: 'contacts', field: '' })
    expect(isConditionInvalid(row, mockCategories)).toBe(true)
  })

  it('returns true when sourceCategories is empty', () => {
    const row = makeRow()
    expect(isConditionInvalid(row, [])).toBe(true)
  })

  it('returns false for valid category with no sub-sources', () => {
    const row = makeRow({ sourceCategory: 'transactions', field: 'amount' })
    expect(isConditionInvalid(row, mockCategories)).toBe(false)
  })
})
