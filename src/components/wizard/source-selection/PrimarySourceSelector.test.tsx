import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrimarySourceSelector } from './PrimarySourceSelector'

/**
 * Unit tests for PrimarySourceSelector component.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 */

describe('PrimarySourceSelector', () => {
  it('renders three primary source options', () => {
    render(<PrimarySourceSelector selected={null} onChange={vi.fn()} hasDownstreamConfig={false} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('renders Contacts, Transactions, and Messages labels', () => {
    render(<PrimarySourceSelector selected={null} onChange={vi.fn()} hasDownstreamConfig={false} />)

    expect(screen.getByText('Contacts')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Messages')).toBeInTheDocument()
  })

  it('no option is selected when selected is null', () => {
    render(<PrimarySourceSelector selected={null} onChange={vi.fn()} hasDownstreamConfig={false} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('shows selected state for Contacts when selected matches', () => {
    render(
      <PrimarySourceSelector selected="contacts" onChange={vi.fn()} hasDownstreamConfig={false} />
    )

    const buttons = screen.getAllByRole('button')
    const contactsButton = buttons.find((b) => b.textContent?.includes('Contacts'))
    expect(contactsButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows selected state for Transactions when selected matches', () => {
    render(
      <PrimarySourceSelector
        selected="transactions"
        onChange={vi.fn()}
        hasDownstreamConfig={false}
      />
    )

    const buttons = screen.getAllByRole('button')
    const transactionsButton = buttons.find((b) => b.textContent?.includes('Transactions'))
    expect(transactionsButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows selected state for Messages when selected matches', () => {
    render(
      <PrimarySourceSelector selected="messages" onChange={vi.fn()} hasDownstreamConfig={false} />
    )

    const buttons = screen.getAllByRole('button')
    const messagesButton = buttons.find((b) => b.textContent?.includes('Messages'))
    expect(messagesButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onChange with "contacts" when Contacts is clicked', () => {
    const onChange = vi.fn()
    render(<PrimarySourceSelector selected={null} onChange={onChange} hasDownstreamConfig={false} />)

    fireEvent.click(screen.getByText('Contacts'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('contacts')
  })

  it('calls onChange with "transactions" when Transactions is clicked', () => {
    const onChange = vi.fn()
    render(<PrimarySourceSelector selected={null} onChange={onChange} hasDownstreamConfig={false} />)

    fireEvent.click(screen.getByText('Transactions'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('transactions')
  })

  it('calls onChange with "messages" when Messages is clicked', () => {
    const onChange = vi.fn()
    render(<PrimarySourceSelector selected={null} onChange={onChange} hasDownstreamConfig={false} />)

    fireEvent.click(screen.getByText('Messages'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('messages')
  })

  it('does not call onChange when clicking the already-selected option', () => {
    const onChange = vi.fn()
    render(
      <PrimarySourceSelector selected="contacts" onChange={onChange} hasDownstreamConfig={false} />
    )

    fireEvent.click(screen.getByText('Contacts'))

    expect(onChange).not.toHaveBeenCalled()
  })

  describe('confirmation dialog when hasDownstreamConfig is true', () => {
    let confirmSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      confirmSpy = vi.spyOn(window, 'confirm')
    })

    afterEach(() => {
      confirmSpy.mockRestore()
    })

    it('shows confirmation when changing selection with downstream config', () => {
      confirmSpy.mockReturnValue(true)
      const onChange = vi.fn()

      render(
        <PrimarySourceSelector selected="contacts" onChange={onChange} hasDownstreamConfig={true} />
      )

      fireEvent.click(screen.getByText('Transactions'))

      expect(confirmSpy).toHaveBeenCalledWith(
        'Changing the primary source will reset your filter and enrichment settings. Continue?'
      )
    })

    it('calls onChange when user confirms the dialog', () => {
      confirmSpy.mockReturnValue(true)
      const onChange = vi.fn()

      render(
        <PrimarySourceSelector selected="contacts" onChange={onChange} hasDownstreamConfig={true} />
      )

      fireEvent.click(screen.getByText('Transactions'))

      expect(onChange).toHaveBeenCalledWith('transactions')
    })

    it('does not call onChange when user cancels the dialog', () => {
      confirmSpy.mockReturnValue(false)
      const onChange = vi.fn()

      render(
        <PrimarySourceSelector selected="contacts" onChange={onChange} hasDownstreamConfig={true} />
      )

      fireEvent.click(screen.getByText('Transactions'))

      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not show confirmation when hasDownstreamConfig is false', () => {
      const onChange = vi.fn()

      render(
        <PrimarySourceSelector
          selected="contacts"
          onChange={onChange}
          hasDownstreamConfig={false}
        />
      )

      fireEvent.click(screen.getByText('Transactions'))

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledWith('transactions')
    })

    it('does not show confirmation when no previous selection exists', () => {
      const onChange = vi.fn()

      render(
        <PrimarySourceSelector selected={null} onChange={onChange} hasDownstreamConfig={true} />
      )

      fireEvent.click(screen.getByText('Contacts'))

      expect(confirmSpy).not.toHaveBeenCalled()
      expect(onChange).toHaveBeenCalledWith('contacts')
    })
  })

  it('renders a radiogroup container for accessibility', () => {
    render(<PrimarySourceSelector selected={null} onChange={vi.fn()} hasDownstreamConfig={false} />)

    const radiogroup = screen.getByRole('radiogroup', { name: 'Primary source selection' })
    expect(radiogroup).toBeInTheDocument()
  })
})
