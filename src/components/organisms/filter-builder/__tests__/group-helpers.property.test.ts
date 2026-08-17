// Feature: card-based-filter-builder, Property 1: Logic toggle flips correctly
// Feature: card-based-filter-builder, Property 2: Nested group has opposite logic
// Feature: card-based-filter-builder, Property 3: Empty group auto-removal preserves root
// Feature: card-based-filter-builder, Property 8: Removing a condition produces correct group
// Feature: card-based-filter-builder, Property 9: Confirm appends new condition to target group
// Feature: card-based-filter-builder, Property 14: Edit replaces condition in-place

/**
 * Property-based tests for group manipulation helpers.
 * **Validates: Requirements 1.2, 1.3, 1.6, 1.7, 2.5, 3.4, 8.4**
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  toggleGroupLogic,
  addConditionToGroup,
  removeConditionFromGroup,
  replaceConditionInGroup,
  addNestedGroup,
  removeEmptyGroups,
} from '../group-helpers'
import type { FilterGroup, FilterCondition } from '../types'
import type { CardFilterRow } from '../types'

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const arbLogic = fc.constantFrom('and' as const, 'or' as const)

const arbCardFilterRow: fc.Arbitrary<CardFilterRow> = fc.record({
  sourceCategory: fc.string({ minLength: 1, maxLength: 20 }),
  subSource: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
  field: fc.string({ minLength: 1, maxLength: 20 }),
  operator: fc.string({ minLength: 1, maxLength: 20 }),
  value: fc.oneof(
    fc.string({ maxLength: 50 }),
    fc.integer(),
    fc.boolean(),
    fc.constant(null)
  ),
  dateMode: fc.oneof(
    fc.constant('specific' as const),
    fc.constant('anniversary' as const),
    fc.constant('same_day' as const),
    fc.constant(null)
  ),
})

const arbRowCondition: fc.Arbitrary<FilterCondition> = arbCardFilterRow.map((row) => ({
  type: 'row' as const,
  row: row as never,
}))

function arbFilterGroup(maxDepth: number = 2): fc.Arbitrary<FilterGroup> {
  if (maxDepth <= 0) {
    return fc.record({
      logic: arbLogic,
      conditions: fc.array(arbRowCondition, { minLength: 0, maxLength: 5 }),
    })
  }
  const arbCondition: fc.Arbitrary<FilterCondition> = fc.oneof(
    { weight: 3, arbitrary: arbRowCondition },
    {
      weight: 1,
      arbitrary: arbFilterGroup(maxDepth - 1).map((group) => ({
        type: 'group' as const,
        group,
      })),
    }
  )
  return fc.record({
    logic: arbLogic,
    conditions: fc.array(arbCondition, { minLength: 0, maxLength: 5 }),
  })
}

/** Generate a FilterGroup with at least N row conditions */
function arbFilterGroupWithMinRows(minRows: number): fc.Arbitrary<FilterGroup> {
  return fc.record({
    logic: arbLogic,
    conditions: fc.array(arbRowCondition, { minLength: minRows, maxLength: minRows + 5 }),
  })
}

// ─── Property 1: Logic toggle flips correctly ────────────────────────────────

describe('Property 1: Logic toggle flips correctly', () => {
  it('FOR ALL FilterGroups, toggling logic produces opposite logic with conditions unchanged', () => {
    fc.assert(
      fc.property(arbFilterGroup(), (group) => {
        const toggled = toggleGroupLogic(group)

        // Logic must be the opposite
        expect(toggled.logic).not.toBe(group.logic)
        expect(toggled.logic).toBe(group.logic === 'and' ? 'or' : 'and')

        // Conditions must remain unchanged
        expect(toggled.conditions).toEqual(group.conditions)
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 2: Nested group has opposite logic ─────────────────────────────

describe('Property 2: Nested group has opposite logic', () => {
  it('FOR ALL parent groups, adding a nested group creates a child with opposite logic', () => {
    fc.assert(
      fc.property(arbFilterGroup(), (group) => {
        const result = addNestedGroup(group)

        // Should have one more condition than original
        expect(result.conditions.length).toBe(group.conditions.length + 1)

        // Last condition should be a group type
        const lastCondition = result.conditions[result.conditions.length - 1]
        expect(lastCondition.type).toBe('group')

        if (lastCondition.type === 'group') {
          // Child logic must be opposite of parent
          expect(lastCondition.group.logic).toBe(
            group.logic === 'and' ? 'or' : 'and'
          )
          // Child should have one empty row condition
          expect(lastCondition.group.conditions.length).toBe(1)
          expect(lastCondition.group.conditions[0].type).toBe('row')
        }
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 3: Empty group auto-removal preserves root ─────────────────────

describe('Property 3: Empty group auto-removal preserves root', () => {
  it('FOR ALL filter trees, removeEmptyGroups prunes empty nested groups but root always survives', () => {
    // Generate groups that may contain nested empty groups
    const arbWithEmptyNested: fc.Arbitrary<FilterGroup> = fc.record({
      logic: arbLogic,
      conditions: fc.array(
        fc.oneof(
          arbRowCondition,
          // Empty nested group
          fc.record({ logic: arbLogic, conditions: fc.constant([]) }).map((g) => ({
            type: 'group' as const,
            group: g,
          })),
          // Non-empty nested group
          fc.record({
            logic: arbLogic,
            conditions: fc.array(arbRowCondition, { minLength: 1, maxLength: 3 }),
          }).map((g) => ({
            type: 'group' as const,
            group: g,
          }))
        ),
        { minLength: 0, maxLength: 6 }
      ),
    })

    fc.assert(
      fc.property(arbWithEmptyNested, (group) => {
        const result = removeEmptyGroups(group)

        // Root is never removed — result is always a valid FilterGroup
        expect(result).toBeDefined()
        expect(result.logic).toBeDefined()
        expect(result.conditions).toBeDefined()

        // No nested groups should have empty conditions
        for (const condition of result.conditions) {
          if (condition.type === 'group') {
            expect(condition.group.conditions.length).toBeGreaterThan(0)
          }
        }

        // Root itself is preserved even if all conditions are removed
        // (root group can have zero conditions after pruning — that's fine)
      }),
      { numRuns: 100 }
    )
  })

  it('FOR ALL empty root groups, removeEmptyGroups still returns the root', () => {
    fc.assert(
      fc.property(arbLogic, (logic) => {
        const emptyRoot: FilterGroup = { logic, conditions: [] }
        const result = removeEmptyGroups(emptyRoot)

        // Root must still exist
        expect(result).toBeDefined()
        expect(result.logic).toBe(logic)
        expect(result.conditions).toEqual([])
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 8: Removing a condition produces correct group ─────────────────

describe('Property 8: Removing a condition produces correct group', () => {
  it('FOR ALL groups with N≥1 conditions and valid index, removing produces N-1 conditions with order preserved', () => {
    fc.assert(
      fc.property(
        arbFilterGroupWithMinRows(1).chain((group) =>
          fc.tuple(
            fc.constant(group),
            fc.integer({ min: 0, max: group.conditions.length - 1 })
          )
        ),
        ([group, index]) => {
          const result = removeConditionFromGroup(group, index)

          // Should have N-1 conditions
          expect(result.conditions.length).toBe(group.conditions.length - 1)

          // Logic unchanged
          expect(result.logic).toBe(group.logic)

          // Order of remaining conditions is preserved
          const expectedConditions = [
            ...group.conditions.slice(0, index),
            ...group.conditions.slice(index + 1),
          ]
          expect(result.conditions).toEqual(expectedConditions)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 9: Confirm appends new condition to target group ───────────────

describe('Property 9: Confirm appends new condition to target group', () => {
  it('FOR ALL groups with N conditions and a new row, adding produces N+1 with new at end', () => {
    fc.assert(
      fc.property(arbFilterGroup(), arbCardFilterRow, (group, newRow) => {
        const result = addConditionToGroup(group, newRow)

        // Should have N+1 conditions
        expect(result.conditions.length).toBe(group.conditions.length + 1)

        // Logic unchanged
        expect(result.logic).toBe(group.logic)

        // Existing conditions unchanged
        for (let i = 0; i < group.conditions.length; i++) {
          expect(result.conditions[i]).toEqual(group.conditions[i])
        }

        // New condition is at the end
        const lastCondition = result.conditions[result.conditions.length - 1]
        expect(lastCondition.type).toBe('row')
        if (lastCondition.type === 'row') {
          expect(lastCondition.row).toEqual(newRow)
        }
      }),
      { numRuns: 100 }
    )
  })
})

// ─── Property 14: Edit replaces condition in-place ───────────────────────────

describe('Property 14: Edit replaces condition in-place', () => {
  it('FOR ALL groups with N≥1 conditions, replacing at index i produces N conditions with only i changed', () => {
    fc.assert(
      fc.property(
        arbFilterGroupWithMinRows(1).chain((group) =>
          fc.tuple(
            fc.constant(group),
            fc.integer({ min: 0, max: group.conditions.length - 1 }),
            arbCardFilterRow
          )
        ),
        ([group, index, newRow]) => {
          const result = replaceConditionInGroup(group, index, newRow)

          // Same number of conditions
          expect(result.conditions.length).toBe(group.conditions.length)

          // Logic unchanged
          expect(result.logic).toBe(group.logic)

          // Only index i changed
          for (let i = 0; i < group.conditions.length; i++) {
            if (i === index) {
              expect(result.conditions[i].type).toBe('row')
              if (result.conditions[i].type === 'row') {
                expect(result.conditions[i].row).toEqual(newRow)
              }
            } else {
              expect(result.conditions[i]).toEqual(group.conditions[i])
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
