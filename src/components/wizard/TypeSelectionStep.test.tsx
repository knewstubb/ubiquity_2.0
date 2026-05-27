import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TypeSelectionStep } from './TypeSelectionStep'
import type { ExporterType } from '@/models/wizard'

/**
 * Unit tests for TypeSelectionStep component.
 *
 * Validates: Requirements 1.1, 1.4, 1.5
 */

describe('TypeSelectionStep', () => {
  it('renders two exporter type options', () => {
    render(<TypeSelectionStep selectedType={null} onSelect={vi.fn()} />)

    const options = screen.getAllByRole('checkbox')
    expect(options).toHaveLength(2)
  })

  it('renders "Contact/Transactional" and "Event-based" labels', () => {
    render(<TypeSelectionStep selectedType={null} onSelect={vi.fn()} />)

    expect(screen.getByLabelText('Contact/Transactional')).toBeInTheDocument()
    expect(screen.getByLabelText('Event-based')).toBeInTheDocument()
  })

  it('neither option is selected when selectedType is null', () => {
    render(<TypeSelectionStep selectedType={null} onSelect={vi.fn()} />)

    const options = screen.getAllByRole('checkbox')
    options.forEach((option) => {
      expect(option).toHaveAttribute('aria-checked', 'false')
    })
  })

  it('shows selected state for Contact/Transactional when selectedType matches', () => {
    render(<TypeSelectionStep selectedType="contact_transactional" onSelect={vi.fn()} />)

    const contactOption = screen.getByLabelText('Contact/Transactional')
    const eventOption = screen.getByLabelText('Event-based')

    expect(contactOption).toHaveAttribute('aria-checked', 'true')
    expect(eventOption).toHaveAttribute('aria-checked', 'false')
  })

  it('shows selected state for Event-based when selectedType matches', () => {
    render(<TypeSelectionStep selectedType="event_based" onSelect={vi.fn()} />)

    const contactOption = screen.getByLabelText('Contact/Transactional')
    const eventOption = screen.getByLabelText('Event-based')

    expect(contactOption).toHaveAttribute('aria-checked', 'false')
    expect(eventOption).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onSelect with "contact_transactional" when Contact/Transactional is clicked', () => {
    const onSelect = vi.fn()
    render(<TypeSelectionStep selectedType={null} onSelect={onSelect} />)

    fireEvent.click(screen.getByLabelText('Contact/Transactional'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('contact_transactional')
  })

  it('calls onSelect with "event_based" when Event-based is clicked', () => {
    const onSelect = vi.fn()
    render(<TypeSelectionStep selectedType={null} onSelect={onSelect} />)

    fireEvent.click(screen.getByLabelText('Event-based'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('event_based')
  })

  it('retains selected type on re-render', () => {
    const onSelect = vi.fn()
    const { rerender } = render(
      <TypeSelectionStep selectedType="contact_transactional" onSelect={onSelect} />
    )

    // Verify initial selected state
    expect(screen.getByLabelText('Contact/Transactional')).toHaveAttribute('aria-checked', 'true')

    // Re-render with same props
    rerender(<TypeSelectionStep selectedType="contact_transactional" onSelect={onSelect} />)

    // Selection should be retained
    expect(screen.getByLabelText('Contact/Transactional')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Event-based')).toHaveAttribute('aria-checked', 'false')
  })

  it('renders a radiogroup container for accessibility', () => {
    render(<TypeSelectionStep selectedType={null} onSelect={vi.fn()} />)

    const radiogroup = screen.getByRole('radiogroup', { name: 'Exporter type selection' })
    expect(radiogroup).toBeInTheDocument()
  })
})
