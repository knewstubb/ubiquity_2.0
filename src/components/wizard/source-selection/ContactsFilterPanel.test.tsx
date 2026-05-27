import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContactsFilterPanel } from './ContactsFilterPanel'
import type { ContactsFilterConfig } from '@/models/source-selection'

/**
 * Unit tests for ContactsFilterPanel component.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.7
 */

describe('ContactsFilterPanel', () => {
  const defaultConfig: ContactsFilterConfig = { type: 'all' }

  it('renders all five canned filter options', () => {
    render(<ContactsFilterPanel config={defaultConfig} onChange={vi.fn()} />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(5)
  })

  it('renders filter option labels', () => {
    render(<ContactsFilterPanel config={defaultConfig} onChange={vi.fn()} />)

    expect(screen.getByText('All contacts')).toBeInTheDocument()
    expect(screen.getByText('Created in last N days')).toBeInTheDocument()
    expect(screen.getByText('In list/segment')).toBeInTheDocument()
    expect(screen.getByText('Unsubscribed')).toBeInTheDocument()
    expect(screen.getByText('Not sent campaign')).toBeInTheDocument()
  })

  it('shows "All contacts" as selected when config type is "all"', () => {
    render(<ContactsFilterPanel config={{ type: 'all' }} onChange={vi.fn()} />)

    const allRadio = screen.getByRole('radio', { name: /All contacts/i })
    expect(allRadio).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange with new filter type when a different option is clicked', () => {
    const onChange = vi.fn()
    render(<ContactsFilterPanel config={defaultConfig} onChange={onChange} />)

    fireEvent.click(screen.getByText('Unsubscribed'))

    expect(onChange).toHaveBeenCalledWith({ type: 'unsubscribed' })
  })

  describe('Created in last N days', () => {
    it('shows days input when "Created in last N days" is selected', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'created_in_last_n_days' }}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByPlaceholderText('e.g. 30')).toBeInTheDocument()
    })

    it('does not show days input when a different filter is selected', () => {
      render(<ContactsFilterPanel config={{ type: 'all' }} onChange={vi.fn()} />)

      expect(screen.queryByPlaceholderText('e.g. 30')).not.toBeInTheDocument()
    })

    it('calls onChange with days value when valid number is entered', () => {
      const onChange = vi.fn()
      render(
        <ContactsFilterPanel
          config={{ type: 'created_in_last_n_days' }}
          onChange={onChange}
        />
      )

      fireEvent.change(screen.getByPlaceholderText('e.g. 30'), {
        target: { value: '30' },
      })

      expect(onChange).toHaveBeenCalledWith({
        type: 'created_in_last_n_days',
        days: 30,
      })
    })

    it('shows validation error for value greater than 365', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'created_in_last_n_days', days: 400 }}
          onChange={vi.fn()}
        />
      )

      // Simulate typing 400
      const input = screen.getByPlaceholderText('e.g. 30')
      fireEvent.change(input, { target: { value: '400' } })

      expect(screen.getByText('Must be 365 days or fewer')).toBeInTheDocument()
    })

    it('shows validation error for value less than 1', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'created_in_last_n_days', days: 0 }}
          onChange={vi.fn()}
        />
      )

      const input = screen.getByPlaceholderText('e.g. 30')
      fireEvent.change(input, { target: { value: '0' } })

      expect(screen.getByText('Must be at least 1 day')).toBeInTheDocument()
    })

    it('shows validation error for decimal values', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'created_in_last_n_days' }}
          onChange={vi.fn()}
        />
      )

      const input = screen.getByPlaceholderText('e.g. 30')
      fireEvent.change(input, { target: { value: '3.5' } })

      expect(screen.getByText('Must be a whole number (no decimals)')).toBeInTheDocument()
    })
  })

  describe('In list/segment', () => {
    it('shows segment combobox when "In list/segment" is selected', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'in_list_segment' }}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Search segments...')).toBeInTheDocument()
    })

    it('calls onChange with segmentId when a segment is selected', () => {
      const onChange = vi.fn()
      render(
        <ContactsFilterPanel
          config={{ type: 'in_list_segment' }}
          onChange={onChange}
        />
      )

      // Open the combobox
      fireEvent.click(screen.getByRole('combobox'))
      // Click a segment option
      fireEvent.click(screen.getByText('Gold Members'))

      expect(onChange).toHaveBeenCalledWith({
        type: 'in_list_segment',
        segmentId: 'seg-gold-members',
      })
    })
  })

  describe('Not sent campaign', () => {
    it('shows campaign combobox when "Not sent campaign" is selected', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'not_sent_campaign' }}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText('Choose a campaign...')).toBeInTheDocument()
    })

    it('shows cross-entity filter label', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'not_sent_campaign' }}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Cross-entity filter/)).toBeInTheDocument()
    })
  })

  describe('Mutually exclusive selection', () => {
    it('only one filter option is checked at a time', () => {
      render(
        <ContactsFilterPanel
          config={{ type: 'unsubscribed' }}
          onChange={vi.fn()}
        />
      )

      const radios = screen.getAllByRole('radio')
      const checkedRadios = radios.filter(
        (r) => r.getAttribute('aria-checked') === 'true'
      )
      expect(checkedRadios).toHaveLength(1)
    })
  })

  describe('No secondary input required', () => {
    it('does not show secondary inputs for "All contacts"', () => {
      render(<ContactsFilterPanel config={{ type: 'all' }} onChange={vi.fn()} />)

      expect(screen.queryByPlaceholderText('e.g. 30')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Search segments...')).not.toBeInTheDocument()
      expect(screen.queryByText('Choose a campaign...')).not.toBeInTheDocument()
    })

    it('does not show secondary inputs for "Unsubscribed"', () => {
      render(
        <ContactsFilterPanel config={{ type: 'unsubscribed' }} onChange={vi.fn()} />
      )

      expect(screen.queryByPlaceholderText('e.g. 30')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Search segments...')).not.toBeInTheDocument()
      expect(screen.queryByText('Choose a campaign...')).not.toBeInTheDocument()
    })
  })
})
