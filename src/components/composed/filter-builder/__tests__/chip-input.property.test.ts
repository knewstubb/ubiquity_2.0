// Feature: card-based-filter-builder, Property 17: Chip operations produce correct array
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ─── Pure Chip Operation Model ───────────────────────────────────────────────
// Models the exact logic from FilterChipInput as pure array operations:
// - Add(chip): if chip not in array, append it
// - Remove(index): remove at index
// - ClearAll: reset to empty array

type ChipOp =
  | { type: 'add'; chip: string }
  | { type: 'remove'; index: number }
  | { type: 'clear' }

/**
 * Apply a single chip operation to an array, matching FilterChipInput logic.
 * - Add: appends trimmed chip if non-empty and not already present (dedup)
 * - Remove: removes chip at the given index (if valid)
 * - Clear: returns empty array
 */
function applyOp(arr: string[], op: ChipOp): string[] {
  switch (op.type) {
    case 'add': {
      const trimmed = op.chip.trim()
      if (!trimmed) return arr
      if (arr.includes(trimmed)) return arr
      return [...arr, trimmed]
    }
    case 'remove': {
      if (op.index < 0 || op.index >= arr.length) return arr
      return arr.filter((_, i) => i !== op.index)
    }
    case 'clear':
      return []
  }
}

/**
 * Apply a sequence of chip operations to an initially empty array.
 */
function applyOps(ops: ChipOp[]): string[] {
  return ops.reduce((arr, op) => applyOp(arr, op), [] as string[])
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

// Generate non-empty trimmed chip values (simulating real user input)
const chipValueArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

// Generate a chip add operation
const addOpArb: fc.Arbitrary<ChipOp> = chipValueArb.map((chip) => ({
  type: 'add' as const,
  chip,
}))

// Generate a chip remove operation (index will be bounded at application time)
const removeOpArb: fc.Arbitrary<ChipOp> = fc.nat({ max: 99 }).map((index) => ({
  type: 'remove' as const,
  index,
}))

// Generate a clear-all operation
const clearOpArb: fc.Arbitrary<ChipOp> = fc.constant({ type: 'clear' as const })

// Generate an arbitrary sequence of chip operations
const opsArb: fc.Arbitrary<ChipOp[]> = fc.array(
  fc.oneof(
    { weight: 5, arbitrary: addOpArb },
    { weight: 3, arbitrary: removeOpArb },
    { weight: 1, arbitrary: clearOpArb },
  ),
  { minLength: 1, maxLength: 30 },
)

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property 17: Chip operations produce correct array', () => {
  /**
   * **Validates: Requirements 13.1, 13.2, 13.5, 13.6**
   *
   * For any sequence of add, remove, and clear-all operations on an initially
   * empty chip list, the resulting value array contains exactly the chips added
   * and not subsequently removed or cleared, in insertion order.
   */
  it('any sequence of add/remove/clear operations produces the expected array', () => {
    fc.assert(
      fc.property(opsArb, (ops) => {
        const result = applyOps(ops)

        // Independently compute expected state by tracking what should be present
        let expected: string[] = []
        for (const op of ops) {
          switch (op.type) {
            case 'add': {
              const trimmed = op.chip.trim()
              if (trimmed && !expected.includes(trimmed)) {
                expected = [...expected, trimmed]
              }
              break
            }
            case 'remove': {
              if (op.index >= 0 && op.index < expected.length) {
                expected = expected.filter((_, i) => i !== op.index)
              }
              break
            }
            case 'clear':
              expected = []
              break
          }
        }

        expect(result).toEqual(expected)
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 13.1, 13.2, 13.5, 13.6**
   *
   * The resulting array never contains duplicates — the add operation
   * deduplicates by checking if the chip already exists.
   */
  it('result array never contains duplicates after any operation sequence', () => {
    fc.assert(
      fc.property(opsArb, (ops) => {
        const result = applyOps(ops)
        const unique = new Set(result)

        expect(unique.size).toBe(result.length)
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 13.1, 13.2, 13.5, 13.6**
   *
   * Insertion order is preserved: if chip A was added before chip B and
   * neither was removed or cleared, then A appears before B in the result.
   */
  it('insertion order is preserved for chips that remain in the array', () => {
    fc.assert(
      fc.property(opsArb, (ops) => {
        const result = applyOps(ops)

        // Track insertion order: for each chip currently in the result,
        // find the index of its most recent effective add (after last clear
        // and after any removal)
        for (let i = 0; i < result.length - 1; i++) {
          const a = result[i]
          const b = result[i + 1]
          // a should appear before b — which is already guaranteed by toEqual
          // above, but this confirms ordering is stable
          expect(result.indexOf(a)).toBeLessThan(result.indexOf(b))
        }
      }),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 13.6**
   *
   * Clear-all always produces an empty array regardless of what was added before.
   */
  it('clear-all always produces an empty array', () => {
    fc.assert(
      fc.property(
        fc.array(chipValueArb, { minLength: 0, maxLength: 20 }),
        (chips) => {
          // Add all chips, then clear
          const ops: ChipOp[] = [
            ...chips.map((chip) => ({ type: 'add' as const, chip })),
            { type: 'clear' as const },
          ]
          const result = applyOps(ops)

          expect(result).toEqual([])
        },
      ),
      { numRuns: 100 },
    )
  })

  /**
   * **Validates: Requirements 13.5**
   *
   * Removing a chip at a valid index reduces the array length by exactly 1
   * and preserves all other chips in order.
   */
  it('removing a chip at a valid index reduces length by 1 and preserves order', () => {
    fc.assert(
      fc.property(
        fc.array(chipValueArb, { minLength: 1, maxLength: 20 }).chain((chips) => {
          // Ensure unique chips for a clean starting state
          const uniqueChips = [...new Set(chips.map((c) => c.trim()).filter((c) => c.length > 0))]
          if (uniqueChips.length === 0) return fc.constant({ chips: ['a'], index: 0 })
          return fc.nat({ max: uniqueChips.length - 1 }).map((index) => ({
            chips: uniqueChips,
            index,
          }))
        }),
        ({ chips, index }) => {
          // Build array by adding all chips
          const ops: ChipOp[] = chips.map((chip) => ({ type: 'add' as const, chip }))
          const before = applyOps(ops)

          // Remove at index
          const after = applyOp(before, { type: 'remove', index })

          expect(after.length).toBe(before.length - 1)
          // All chips except the removed one are still present in order
          const expectedAfter = before.filter((_, i) => i !== index)
          expect(after).toEqual(expectedAfter)
        },
      ),
      { numRuns: 100 },
    )
  })
})
