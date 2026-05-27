import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubSourceSelector } from './SubSourceSelector'
import type { Channel } from '../../../models/source-selection'

/**
 * Unit tests for SubSourceSelector component.
 *
 * Validates: Requirements 3.1, 3.8, 4.1, 4.2, 4.3
 */

describe('SubSourceSelector', () => {
  const defaultProps = {
    primarySource: 'contacts' as const,
    onTableChange: vi.fn(),
    onChannelChange: vi.fn(),
    availableChannels: ['email', 'sms', 'push'] as Channel[],
  }

  describe('Contacts path', () => {
    it('renders nothing when primary source is contacts', () => {
      const { container } = render(
        <SubSourceSelector {...defaultProps} primarySource="contacts" />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Transactions path', () => {
    it('renders a transaction table selector', () => {
      render(
        <SubSourceSelector {...defaultProps} primarySource="transactions" />
      )
      expect(screen.getByText('Select a transaction table...')).toBeInTheDocument()
    })

    it('shows placeholder text when no table is selected', () => {
      render(
        <SubSourceSelector {...defaultProps} primarySource="transactions" />
      )
      expect(screen.getByText('Select a transaction table...')).toBeInTheDocument()
    })

    it('shows validation message when no table is selected', () => {
      render(
        <SubSourceSelector {...defaultProps} primarySource="transactions" />
      )
      expect(
        screen.getByText('A transaction table must be selected to continue.')
      ).toBeInTheDocument()
    })

    it('does not show validation message when a table is selected', () => {
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="transactions"
          selectedTableId="purchases"
        />
      )
      expect(
        screen.queryByText('A transaction table must be selected to continue.')
      ).not.toBeInTheDocument()
    })
  })

  describe('Messages path — multiple channels', () => {
    it('renders channel selector cards when multiple channels available', () => {
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="messages"
          availableChannels={['email', 'sms', 'push']}
        />
      )
      expect(screen.getByRole('checkbox', { name: 'Email' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'SMS' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'Push' })).toBeInTheDocument()
    })

    it('renders only available channels', () => {
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="messages"
          availableChannels={['email', 'sms']}
        />
      )
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('SMS')).toBeInTheDocument()
      expect(screen.queryByText('Push')).not.toBeInTheDocument()
    })

    it('calls onChannelChange when a channel card is clicked', () => {
      const onChannelChange = vi.fn()
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="messages"
          availableChannels={['email', 'sms', 'push']}
          onChannelChange={onChannelChange}
        />
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'SMS' }))
      expect(onChannelChange).toHaveBeenCalledWith('sms')
    })

    it('shows selected state for the chosen channels', () => {
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="messages"
          availableChannels={['email', 'sms', 'push']}
          selectedChannels={['email', 'sms']}
        />
      )
      expect(screen.getByRole('checkbox', { name: 'Email' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('checkbox', { name: 'SMS' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('checkbox', { name: 'Push' })).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('Messages path — single channel', () => {
    it('auto-selects the only available channel', () => {
      const onChannelChange = vi.fn()
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="messages"
          availableChannels={['email']}
          onChannelChange={onChannelChange}
        />
      )
      expect(onChannelChange).toHaveBeenCalledWith('email')
    })

    it('shows auto-selected confirmation when only one channel exists', () => {
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="messages"
          availableChannels={['email']}
          selectedChannel="email"
        />
      )
      expect(
        screen.getByText('Only one channel is available — automatically selected.')
      ).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  describe('Messages path — no channels', () => {
    it('shows informational message when no channels configured', () => {
      render(
        <SubSourceSelector
          {...defaultProps}
          primarySource="messages"
          availableChannels={[]}
        />
      )
      expect(
        screen.getByText(
          'No channels configured. Please configure at least one messaging channel to continue.'
        )
      ).toBeInTheDocument()
    })
  })
})
