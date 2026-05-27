import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FieldMappingStep } from './FieldMappingStep'
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard'
import type { ExporterWizardDraft } from '../../models/wizard'
import type { SelectedField } from '../../models/automation'

function createDraft(overrides: Partial<ExporterWizardDraft> = {}): ExporterWizardDraft {
  return { ...DEFAULT_EXPORTER_DRAFT, ...overrides }
}

describe('FieldMappingStep', () => {
  describe('Contact/Transactional mode', () => {
    it('shows fields from selected sources', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
          { key: 'lastName', label: 'Last Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByLabelText('Export fields')).toBeInTheDocument()
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    })

    it('allows deselecting a field', () => {
      const selectedFields: SelectedField[] = [
        { key: 'firstName', label: 'First Name', source: 'contact' },
        { key: 'lastName', label: 'Last Name', source: 'contact' },
      ]
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields,
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // Click the checkbox for First Name to deselect it
      fireEvent.click(screen.getByRole('checkbox', { name: 'First Name' }))

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedFields: [{ key: 'lastName', label: 'Last Name', source: 'contact' }],
        })
      )
    })

    it('allows selecting an unselected field', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // Email Address should be in the unselected list — click to select
      fireEvent.click(screen.getByRole('checkbox', { name: 'Email Address' }))

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedFields: expect.arrayContaining([
            { key: 'firstName', label: 'First Name', source: 'contact' },
            { key: 'email', label: 'Email Address', source: 'contact' },
          ]),
        })
      )
    })

    it('select all toggles all contact fields on', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }))

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedFields: expect.arrayContaining([
            expect.objectContaining({ key: 'firstName' }),
            expect.objectContaining({ key: 'lastName' }),
            expect.objectContaining({ key: 'email' }),
          ]),
        })
      )
    })

    it('select all deselects all when all are already selected', () => {
      const allContactFields: SelectedField[] = [
        { key: 'id', label: 'Customer ID', source: 'contact' },
        { key: 'firstName', label: 'First Name', source: 'contact' },
        { key: 'lastName', label: 'Last Name', source: 'contact' },
        { key: 'email', label: 'Email Address', source: 'contact' },
        { key: 'phone', label: 'Phone Number', source: 'contact' },
        { key: 'membershipTier', label: 'Membership Tier', source: 'contact' },
        { key: 'joinDate', label: 'Join Date', source: 'contact' },
        { key: 'communicationPreferences', label: 'Communication Preferences', source: 'contact' },
      ]
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: allContactFields,
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select All' }))

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedFields: [],
        })
      )
    })

    it('shows "Select at least one field" error when no fields selected', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByTestId('no-fields-error')).toHaveTextContent('Select at least one field')
    })

    it('does not show error when fields are selected', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.queryByTestId('no-fields-error')).not.toBeInTheDocument()
    })
  })

  describe('Event-based mode', () => {
    it('shows immutable event fields that cannot be deselected', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // Event fields should be displayed
      expect(screen.getByTestId('event-field-event_timestamp')).toBeInTheDocument()
      expect(screen.getByTestId('event-field-recipient_email')).toBeInTheDocument()
      expect(screen.getByTestId('event-field-mailout_name')).toBeInTheDocument()
      expect(screen.getByTestId('event-field-send_status')).toBeInTheDocument()
      expect(screen.getByTestId('event-field-open_count')).toBeInTheDocument()
      expect(screen.getByTestId('event-field-click_count')).toBeInTheDocument()

      // Event fields should NOT have checkboxes (they are locked)
      const eventFieldRow = screen.getByTestId('event-field-event_timestamp')
      expect(eventFieldRow.querySelector('[role="checkbox"]')).not.toBeInTheDocument()
    })

    it('shows lock icon on event fields', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // The event fields section header should have a lock indicator
      expect(screen.getByText('Event Fields')).toBeInTheDocument()
      expect(screen.getByText('(auto-included, cannot be removed)')).toBeInTheDocument()
    })

    it('shows additional contact fields section for event-based mode', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByText('Additional Contact Fields')).toBeInTheDocument()
      expect(screen.getByText('(optional)')).toBeInTheDocument()
    })

    it('allows selecting optional contact fields alongside event fields', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // Select a contact field
      fireEvent.click(screen.getByRole('checkbox', { name: 'First Name' }))

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedFields: [expect.objectContaining({ key: 'firstName' })],
        })
      )
    })

    it('deduplicates event fields across multiple event sources', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends', 'campaign_events'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // event_timestamp and recipient_email are shared — should appear only once
      const timestampFields = screen.getAllByText('Event Timestamp')
      expect(timestampFields).toHaveLength(1)
      const emailFields = screen.getAllByText('Recipient Email')
      expect(emailFields).toHaveLength(1)
    })
  })

  describe('Column renaming', () => {
    it('shows rename input for each selected field', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
          { key: 'lastName', label: 'Last Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByTestId('rename-input-firstName')).toBeInTheDocument()
      expect(screen.getByTestId('rename-input-lastName')).toBeInTheDocument()
    })

    it('shows rename input for event fields', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByTestId('rename-input-event_timestamp')).toBeInTheDocument()
      expect(screen.getByTestId('rename-input-recipient_email')).toBeInTheDocument()
    })

    it('calls onUpdate with columnRenames when typing a custom name', async () => {
      const user = userEvent.setup()
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      const input = screen.getByTestId('rename-input-firstName')
      await user.type(input, 'G')

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          columnRenames: expect.arrayContaining([
            expect.objectContaining({ fieldKey: 'firstName', outputName: 'G' }),
          ]),
        })
      )
    })

    it('shows reset button when a field has a custom rename', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
        columnRenames: [{ fieldKey: 'firstName', outputName: 'Given Name' }],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByTestId('reset-rename-firstName')).toBeInTheDocument()
    })

    it('does not show reset button when no rename exists', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
        columnRenames: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.queryByTestId('reset-rename-firstName')).not.toBeInTheDocument()
    })

    it('clears rename when reset button is clicked', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
        columnRenames: [{ fieldKey: 'firstName', outputName: 'Given Name' }],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      fireEvent.click(screen.getByTestId('reset-rename-firstName'))

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          columnRenames: [],
        })
      )
    })

    it('shows validation error for whitespace-only column name', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
        columnRenames: [{ fieldKey: 'firstName', outputName: '   ' }],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByTestId('field-error-firstName')).toHaveTextContent(
        'Column name cannot be whitespace only'
      )
    })

    it('shows validation error for column name exceeding 128 characters', () => {
      const longName = 'a'.repeat(129)
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
        columnRenames: [{ fieldKey: 'firstName', outputName: longName }],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByTestId('field-error-firstName')).toHaveTextContent(
        'Column name cannot exceed 128 characters'
      )
    })

    it('shows validation error for duplicate column names', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
          { key: 'lastName', label: 'Last Name', source: 'contact' },
        ],
        columnRenames: [
          { fieldKey: 'firstName', outputName: 'Name' },
          { fieldKey: 'lastName', outputName: 'Name' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.getByTestId('field-error-firstName')).toHaveTextContent('Duplicate column name "Name"')
      expect(screen.getByTestId('field-error-lastName')).toHaveTextContent('Duplicate column name "Name"')
    })
  })

  describe('Join key indicator', () => {
    it('shows join key indicator when multiple sources selected in contact mode', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact', 'mailout'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      const indicator = screen.getByTestId('join-key-indicator')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveTextContent('Joined by:')
      expect(indicator).toHaveTextContent('Email Address')
    })

    it('does not show join key indicator with single source', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.queryByTestId('join-key-indicator')).not.toBeInTheDocument()
    })

    it('does not show join key indicator in event-based mode', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends', 'campaign_events'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      expect(screen.queryByTestId('join-key-indicator')).not.toBeInTheDocument()
    })
  })

  describe('Drag to reorder', () => {
    it('renders drag handles for selected fields', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
          { key: 'lastName', label: 'Last Name', source: 'contact' },
        ],
      })
      const onUpdate = vi.fn()
      const { container } = render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // Each selected field row should be draggable
      const draggableRows = container.querySelectorAll('[draggable="true"]')
      expect(draggableRows.length).toBe(2)
    })

    it('renders drag handles for event fields', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends'],
        selectedFields: [],
      })
      const onUpdate = vi.fn()
      const { container } = render(<FieldMappingStep draft={draft} onUpdate={onUpdate} />)

      // Event fields should also be draggable
      const draggableRows = container.querySelectorAll('[draggable="true"]')
      expect(draggableRows.length).toBe(6) // mailout_sends has 6 fields
    })
  })
})
