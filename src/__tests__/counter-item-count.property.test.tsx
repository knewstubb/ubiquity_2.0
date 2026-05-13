// Feature: component-controllers-expansion, Property 3: Counter-Driven Item Count
import { describe, it, expect, beforeAll } from 'vitest'
import fc from 'fast-check'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Property 3: Counter-Driven Item Count
 *
 * For any component with a counter control that semantically drives a rendered
 * item count (option-count, field-count, card-count, item-count), rendering the
 * demo with a randomly generated valid count within the counter's min/max bounds
 * SHALL produce exactly that many corresponding DOM elements.
 *
 * **Validates: Requirements 5.2, 9.3, 10.2, 11.4, 12.3**
 */
describe('Feature: component-controllers-expansion, Property 3: Counter-Driven Item Count', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  describe('RadioGroup: option-count drives radio item count', () => {
    it('renders exactly N radio items for any valid option-count (2–5)', async () => {
      const RadioGroupDemo = (await import('../pages/component-demos/RadioGroupDemo')).default

      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          (count) => {
            const { container, unmount } = render(
              <RadioGroupDemo option-count={count} orientation="vertical" disabled={false} />
            )

            const radioItems = container.querySelectorAll('[role="radio"]')
            expect(radioItems.length).toBe(count)

            unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('ToggleGroup: item-count drives toggle item count', () => {
    it('renders exactly N toggle items for any valid item-count (2–6)', async () => {
      const ToggleGroupDemo = (await import('../pages/component-demos/ToggleGroupDemo')).default

      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 6 }),
          (count) => {
            const { container, unmount } = render(
              <ToggleGroupDemo type="single" variant="default" item-count={count} />
            )

            // ToggleGroupItem renders as a button inside the group
            // Radix ToggleGroup items have role="radio" in single mode
            const groupEl = container.querySelector('[role="group"]')
            const items = groupEl
              ? groupEl.querySelectorAll('[role="radio"]')
              : container.querySelectorAll('[data-radix-collection-item]')

            expect(items.length).toBe(count)

            unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Form: field-count drives form field count', () => {
    it('renders exactly N form fields for any valid field-count (1–5)', async () => {
      const FormDemo = (await import('../pages/component-demos/FormDemo')).default

      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (count) => {
            const { container, unmount } = render(
              <FormDemo field-count={count} show-descriptions={true} validation="none" />
            )

            // FormItem renders a div containing FormLabel + FormControl + FormDescription
            // Each field has a label element
            const labels = container.querySelectorAll('label')
            expect(labels.length).toBe(count)

            unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('CardSelector: card-count drives card element count', () => {
    it('renders exactly N card buttons for any valid card-count (2–6)', async () => {
      const CardSelectorDemo = (await import('../pages/component-demos/CardSelectorDemo')).default

      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 6 }),
          (count) => {
            const { container, unmount } = render(
              <CardSelectorDemo card-count={count} rows={1} max-width={100} disabled={false} />
            )

            // CardSelector renders buttons with aria-pressed attribute
            const cards = container.querySelectorAll('button[aria-pressed]')
            expect(cards.length).toBe(count)

            unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('SplitButton: option-count drives dropdown menu item count', () => {
    it('renders exactly N dropdown menu items for any valid option-count (1–4)', async () => {
      const SplitButtonDemo = (await import('../pages/component-demos/SplitButtonDemo')).default
      const user = userEvent.setup()

      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 4 }),
          async (count) => {
            const { unmount } = render(
              <SplitButtonDemo label="Test" variant="default" size="default" option-count={count} disabled={false} />
            )

            // Open the dropdown by clicking the trigger button (labelled "More options")
            const trigger = screen.getByLabelText('More options')
            await user.click(trigger)

            // Radix DropdownMenu renders items with role="menuitem" in a portal
            const menuItems = document.querySelectorAll('[role="menuitem"]')
            expect(menuItems.length).toBe(count)

            unmount()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
