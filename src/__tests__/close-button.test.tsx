import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import fc from 'fast-check'
import { CloseButton } from '@/components/ui/close-button'

/**
 * Unit tests and property tests for CloseButton rendering and accessibility.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 4.2, 4.3, 6.1, 6.2, 6.3
 */

describe('CloseButton', () => {
  describe('Unit Tests', () => {
    it('renders a button element by default', () => {
      render(<CloseButton />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('contains an X icon (SVG element) inside the button', () => {
      render(<CloseButton />)
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('contains a sr-only span with text "Close"', () => {
      render(<CloseButton />)
      const srOnly = screen.getByText('Close')
      expect(srOnly).toBeInTheDocument()
      expect(srOnly.tagName).toBe('SPAN')
      expect(srOnly.className).toContain('sr-only')
    })

    it('renders child element via Slot when asChild is true', () => {
      // When asChild is true, Slot merges CloseButton's props onto the
      // single child element. The child must accept children (X icon + sr-only span).
      render(
        <CloseButton asChild data-testid="slot-target">
          <div role="button" data-custom="slot-child" />
        </CloseButton>
      )
      const element = screen.getByTestId('slot-target')
      expect(element).toBeInTheDocument()
      // The rendered element is the child div, not a native button
      expect(element.tagName).toBe('DIV')
      // Props from CloseButton are merged onto the child
      expect(element).toHaveAttribute('data-custom', 'slot-child')
      // The variant classes are applied to the child element
      expect(element.className).toContain('inline-flex')
    })

    it('uses provided aria-label as the accessible name', () => {
      render(<CloseButton aria-label="Dismiss" />)
      const button = screen.getByRole('button', { name: 'Dismiss' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Dismiss')
    })

    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn()
      render(<CloseButton onClick={handleClick} />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('has disabled attribute when disabled prop is true', () => {
      render(<CloseButton disabled />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('forwards data-testid attribute to the rendered element', () => {
      render(<CloseButton data-testid="close-btn" />)
      const button = screen.getByTestId('close-btn')
      expect(button).toBeInTheDocument()
    })

    it('forwards ref to the underlying DOM element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<CloseButton ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('BUTTON')
    })
  })

  describe('Property 4: HTML attributes are forwarded', () => {
    /**
     * **Validates: Requirements 4.2**
     *
     * For any set of standard HTML button attributes (onClick, disabled,
     * aria-label, data-* attributes), the CloseButton SHALL forward all
     * provided attributes to the rendered DOM element.
     */
    it('forwards arbitrary data-* attributes to the rendered element', () => {
      fc.assert(
        fc.property(
          fc.record({
            key: fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/).filter(k => k.length > 0),
            value: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          ({ key, value }) => {
            const attrName = `data-${key}`
            const { container } = render(
              <CloseButton {...{ [attrName]: value }} />
            )
            const button = container.querySelector('button')!
            expect(button.getAttribute(attrName)).toBe(value)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('forwards disabled state correctly for any boolean', () => {
      fc.assert(
        fc.property(fc.boolean(), (disabled) => {
          const { container } = render(<CloseButton disabled={disabled} />)
          const button = container.querySelector('button')!
          if (disabled) {
            expect(button).toHaveAttribute('disabled')
          } else {
            expect(button).not.toHaveAttribute('disabled')
          }
        }),
        { numRuns: 10 }
      )
    })

    it('forwards onClick and calls it on click', () => {
      fc.assert(
        fc.property(fc.nat({ max: 100 }), (id) => {
          const handler = vi.fn()
          const { container } = render(
            <CloseButton onClick={handler} data-id={String(id)} />
          )
          const button = container.querySelector('button')!
          fireEvent.click(button)
          expect(handler).toHaveBeenCalledTimes(1)
        }),
        { numRuns: 20 }
      )
    })
  })

  describe('Property 5: Accessible name is always present', () => {
    /**
     * **Validates: Requirements 6.1, 6.2**
     *
     * For any CloseButton rendered without an explicit aria-label prop,
     * the component SHALL contain a visually hidden element with text
     * content "Close". For any CloseButton rendered with an explicit
     * aria-label prop, that label SHALL appear as an attribute on the
     * rendered element.
     */
    it('always has sr-only "Close" text when no aria-label is provided', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('xs', 'sm', 'default', 'lg') as fc.Arbitrary<'xs' | 'sm' | 'default' | 'lg'>,
          (size) => {
            const { container } = render(<CloseButton size={size} />)
            const srOnly = container.querySelector('.sr-only')
            expect(srOnly).not.toBeNull()
            expect(srOnly!.textContent).toBe('Close')
          }
        ),
        { numRuns: 20 }
      )
    })

    it('uses provided aria-label as accessible name for any non-empty string', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (label) => {
            const { container } = render(<CloseButton aria-label={label} />)
            const button = container.querySelector('button')!
            expect(button.getAttribute('aria-label')).toBe(label)
            // sr-only "Close" text is still present in the DOM
            const srOnly = container.querySelector('.sr-only')
            expect(srOnly).not.toBeNull()
            expect(srOnly!.textContent).toBe('Close')
          }
        ),
        { numRuns: 30 }
      )
    })
  })
})
