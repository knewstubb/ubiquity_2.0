import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EnrichmentSection } from './EnrichmentSection'
import type { EnrichmentConfig } from '@/models/source-selection'

/**
 * Unit tests for EnrichmentSection component.
 *
 * Validates: Requirements 5.1, 5.2, 5.6, 5.7, 5.8
 */

describe('EnrichmentSection', () => {
  it('renders enrichment option cards when no enrichment is selected', () => {
    render(
      <EnrichmentSection primarySource="contacts" config={null} onChange={vi.fn()} />
    )

    expect(screen.getByRole('group', { name: 'Enrichment options' })).toBeInTheDocument()
  })

  describe('available enrichment options', () => {
    it('shows Transactions and Messages when primary source is Contacts', () => {
      render(
        <EnrichmentSection primarySource="contacts" config={null} onChange={vi.fn()} />
      )

      expect(screen.getByText('Transactions')).toBeInTheDocument()
      expect(screen.getByText('Messages')).toBeInTheDocument()
      expect(screen.queryByText('Contacts')).not.toBeInTheDocument()
    })

    it('shows Contacts and Messages when primary source is Transactions', () => {
      render(
        <EnrichmentSection primarySource="transactions" config={null} onChange={vi.fn()} />
      )

      expect(screen.getByText('Contacts')).toBeInTheDocument()
      expect(screen.getByText('Messages')).toBeInTheDocument()
      expect(screen.queryByText('Transactions')).not.toBeInTheDocument()
    })

    it('shows Contacts and Transactions when primary source is Messages', () => {
      render(
        <EnrichmentSection primarySource="messages" config={null} onChange={vi.fn()} />
      )

      expect(screen.getByText('Contacts')).toBeInTheDocument()
      expect(screen.getByText('Transactions')).toBeInTheDocument()
      expect(screen.queryByText('Messages')).not.toBeInTheDocument()
    })
  })

  describe('selecting an enrichment', () => {
    it('calls onChange with contacts enrichment config when Contacts is clicked', () => {
      const onChange = vi.fn()
      render(
        <EnrichmentSection primarySource="transactions" config={null} onChange={onChange} />
      )

      fireEvent.click(screen.getByText('Contacts'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith({ entity: 'contacts' })
    })

    it('calls onChange with transactions enrichment config when Transactions is clicked', () => {
      const onChange = vi.fn()
      render(
        <EnrichmentSection primarySource="contacts" config={null} onChange={onChange} />
      )

      fireEvent.click(screen.getByText('Transactions'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith({
        entity: 'transactions',
        tableId: '',
        joinStrategy: 'most_recent',
      })
    })

    it('calls onChange with messages enrichment config when Messages is clicked', () => {
      const onChange = vi.fn()
      render(
        <EnrichmentSection primarySource="contacts" config={null} onChange={onChange} />
      )

      fireEvent.click(screen.getByText('Messages'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith({
        entity: 'messages',
        channel: '',
        statuses: [],
      })
    })
  })

  describe('when enrichment is selected', () => {
    it('hides enrichment option cards when an enrichment is configured', () => {
      const config: EnrichmentConfig = { entity: 'contacts' }
      render(
        <EnrichmentSection primarySource="transactions" config={config} onChange={vi.fn()} />
      )

      // The option cards group should not be present
      expect(screen.queryByRole('group', { name: 'Enrichment options' })).not.toBeInTheDocument()
    })

    it('shows the selected enrichment label in the header', () => {
      const config: EnrichmentConfig = { entity: 'contacts' }
      render(
        <EnrichmentSection primarySource="transactions" config={config} onChange={vi.fn()} />
      )

      expect(screen.getByText('Contacts')).toBeInTheDocument()
    })

    it('shows a Remove button when enrichment is configured', () => {
      const config: EnrichmentConfig = { entity: 'contacts' }
      render(
        <EnrichmentSection primarySource="transactions" config={config} onChange={vi.fn()} />
      )

      expect(screen.getByRole('button', { name: 'Remove enrichment' })).toBeInTheDocument()
    })

    it('calls onChange with null when Remove is clicked', () => {
      const onChange = vi.fn()
      const config: EnrichmentConfig = { entity: 'contacts' }
      render(
        <EnrichmentSection primarySource="transactions" config={config} onChange={onChange} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Remove enrichment' }))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('renders ContactEnrichmentConfig for contacts enrichment', () => {
      const config: EnrichmentConfig = { entity: 'contacts' }
      render(
        <EnrichmentSection primarySource="transactions" config={config} onChange={vi.fn()} />
      )

      expect(
        screen.getByText(/auto-joined via contact id/i)
      ).toBeInTheDocument()
    })

    it('renders TransactionEnrichmentConfig for transactions enrichment', () => {
      const config: EnrichmentConfig = {
        entity: 'transactions',
        tableId: '',
        joinStrategy: 'most_recent',
      }
      render(
        <EnrichmentSection primarySource="contacts" config={config} onChange={vi.fn()} />
      )

      expect(screen.getByText('Transaction table')).toBeInTheDocument()
    })

    it('renders MessageEnrichmentConfig for messages enrichment', () => {
      const config: EnrichmentConfig = {
        entity: 'messages',
        channel: '' as never,
        statuses: [],
      }
      render(
        <EnrichmentSection primarySource="contacts" config={config} onChange={vi.fn()} />
      )

      expect(screen.getByText('Channel')).toBeInTheDocument()
      expect(screen.getByText(/message statuses/i)).toBeInTheDocument()
    })
  })

  describe('v1 limit: one enrichment layer', () => {
    it('shows only two enrichment options (not three)', () => {
      render(
        <EnrichmentSection primarySource="contacts" config={null} onChange={vi.fn()} />
      )

      const group = screen.getByRole('group', { name: 'Enrichment options' })
      const buttons = group.querySelectorAll('button')
      expect(buttons).toHaveLength(2)
    })

    it('hides option cards once an enrichment is selected (limits to one)', () => {
      const config: EnrichmentConfig = {
        entity: 'transactions',
        tableId: 'tbl-purchases',
        joinStrategy: 'most_recent',
      }
      render(
        <EnrichmentSection primarySource="contacts" config={config} onChange={vi.fn()} />
      )

      // No option cards visible — only the selected enrichment config
      expect(screen.queryByRole('group', { name: 'Enrichment options' })).not.toBeInTheDocument()
    })
  })
})
