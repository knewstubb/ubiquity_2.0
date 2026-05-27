import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DataSourceStep } from './DataSourceStep'
import type { ExporterWizardDraft } from '../../models/wizard'
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard'

// Mock dependencies that require context or external data
vi.mock('../../contexts/AccountContext', () => ({
  useAccount: () => ({
    filterByAccount: (items: unknown[]) => items,
    currentAccount: { id: 'acc-1', name: 'Test Account' },
  }),
}))

vi.mock('../../data/contacts', () => ({
  spaContacts: [],
}))

function createDraft(overrides: Partial<ExporterWizardDraft> = {}): ExporterWizardDraft {
  return { ...DEFAULT_EXPORTER_DRAFT, ...overrides }
}

describe('DataSourceStep', () => {
  let onUpdate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onUpdate = vi.fn()
  })

  describe('Name input', () => {
    it('renders a name input field', () => {
      render(<DataSourceStep draft={createDraft()} onUpdate={onUpdate} />)
      const input = screen.getByLabelText('Automation name')
      expect(input).toBeInTheDocument()
    })

    it('displays the current draft name value', () => {
      render(<DataSourceStep draft={createDraft({ name: 'My Export' })} onUpdate={onUpdate} />)
      const input = screen.getByLabelText('Automation name') as HTMLInputElement
      expect(input.value).toBe('My Export')
    })

    it('calls onUpdate with name patch when input changes', () => {
      render(<DataSourceStep draft={createDraft()} onUpdate={onUpdate} />)
      const input = screen.getByLabelText('Automation name')
      fireEvent.change(input, { target: { value: 'New Name' } })
      expect(onUpdate).toHaveBeenCalledWith({ name: 'New Name' })
    })
  })

  describe('Source options', () => {
    it('renders three source options: Contacts, Mailout Data, Transactional', () => {
      render(<DataSourceStep draft={createDraft({ selectedSources: ['contact'] })} onUpdate={onUpdate} />)
      expect(screen.getByRole('checkbox', { name: 'Contacts' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'Mailout Data' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'Transactional' })).toBeInTheDocument()
    })

    it('shows selected state for sources in the draft', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact', 'mailout'] })}
          onUpdate={onUpdate}
        />
      )
      expect(screen.getByRole('checkbox', { name: 'Contacts' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('checkbox', { name: 'Mailout Data' })).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByRole('checkbox', { name: 'Transactional' })).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('Source selection toggle', () => {
    it('calls onUpdate to add a source when toggling an unselected source', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact'] })}
          onUpdate={onUpdate}
        />
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'Mailout Data' }))
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedSources: ['contact', 'mailout'],
        })
      )
    })

    it('calls onUpdate to remove a source when toggling a selected source (if more than one selected)', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact', 'mailout'] })}
          onUpdate={onUpdate}
        />
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'Mailout Data' }))
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedSources: ['contact'],
        })
      )
    })

    it('does not remove the last selected source (at least one must remain)', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact'] })}
          onUpdate={onUpdate}
        />
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'Contacts' }))
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Transactional database selector', () => {
    it('shows transactional database selector when transactional is selected', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['transactional'] })}
          onUpdate={onUpdate}
        />
      )
      expect(screen.getByLabelText('Select transactional database')).toBeInTheDocument()
    })

    it('does not show transactional database selector when transactional is not selected', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact'] })}
          onUpdate={onUpdate}
        />
      )
      expect(screen.queryByLabelText('Select transactional database')).not.toBeInTheDocument()
    })
  })

  describe('Join indicator', () => {
    it('shows "Joined by: Email Address" when multiple sources are selected', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact', 'mailout'] })}
          onUpdate={onUpdate}
        />
      )
      const joinIndicator = screen.getByText(/Joined by:/)
      expect(joinIndicator).toBeInTheDocument()
      expect(joinIndicator.querySelector('span')).toHaveTextContent('Email Address')
    })

    it('does not show join indicator when only one source is selected', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact'] })}
          onUpdate={onUpdate}
        />
      )
      expect(screen.queryByText(/Joined by:/)).not.toBeInTheDocument()
    })
  })

  describe('Join key input removed (Requirement 2.2)', () => {
    it('does not render a join key input field', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact', 'mailout'] })}
          onUpdate={onUpdate}
        />
      )
      // No chip input or select for join key should exist
      expect(screen.queryByLabelText(/join key/i)).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText(/join/i)).not.toBeInTheDocument()
    })
  })

  describe('Filter builder', () => {
    it('shows filter builder when sources are selected', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: ['contact'] })}
          onUpdate={onUpdate}
        />
      )
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('does not show filter builder when no sources are selected', () => {
      render(
        <DataSourceStep
          draft={createDraft({ selectedSources: [] })}
          onUpdate={onUpdate}
        />
      )
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })
  })

  describe('onUpdate patches', () => {
    it('resets selectedFields when toggling a source', () => {
      render(
        <DataSourceStep
          draft={createDraft({
            selectedSources: ['contact'],
            selectedFields: [{ key: 'firstName', label: 'First Name', source: 'contact' }],
          })}
          onUpdate={onUpdate}
        />
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'Mailout Data' }))
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedFields: [],
        })
      )
    })

    it('clears transactionalSource when transactional is deselected', () => {
      render(
        <DataSourceStep
          draft={createDraft({
            selectedSources: ['contact', 'transactional'],
            transactionalSource: 'treatments',
          })}
          onUpdate={onUpdate}
        />
      )
      fireEvent.click(screen.getByRole('checkbox', { name: 'Transactional' }))
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionalSource: null,
        })
      )
    })
  })
})
