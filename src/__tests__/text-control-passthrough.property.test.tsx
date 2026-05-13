import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { render } from '@testing-library/react'
import LabelDemo from '../pages/component-demos/LabelDemo'
import TextareaDemo from '../pages/component-demos/TextareaDemo'

// Feature: component-controllers-expansion, Property 4: Text Control Passthrough

/**
 * Property 4: Text Control Passthrough
 *
 * For any component with a text-type control that drives visible text content
 * (label, placeholder, primary label), rendering the demo with a randomly
 * generated non-empty string SHALL produce output containing that exact string.
 *
 * **Validates: Requirements 4.2, 7.2**
 */
describe('Feature: component-controllers-expansion, Property 4: Text Control Passthrough', () => {
  const arbText = fc.string({ minLength: 1, maxLength: 50 }).filter(
    (s) => s.trim().length > 0 && !/[<>&]/.test(s)
  )

  it('Label demo renders the text prop as visible content', () => {
    fc.assert(
      fc.property(arbText, (text) => {
        const { container } = render(<LabelDemo text={text} />)
        expect(container.textContent).toContain(text)
      }),
      { numRuns: 100 }
    )
  })

  it('Textarea demo renders the placeholder prop as the placeholder attribute', () => {
    fc.assert(
      fc.property(arbText, (placeholder) => {
        const { container } = render(<TextareaDemo placeholder={placeholder} />)
        const textarea = container.querySelector('textarea')
        expect(textarea).not.toBeNull()
        expect(textarea!.getAttribute('placeholder')).toBe(placeholder)
      }),
      { numRuns: 100 }
    )
  })
})
