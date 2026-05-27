import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewStep } from './ReviewStep'
import type { ExporterWizardDraft } from '@/models/wizard'
import { DEFAULT_EXPORTER_DRAFT } from '@/models/wizard'

/**
 * Unit tests for ReviewStep component.
 *
 * Validates: Requirements 1.2, 1.3
 */

function createDraft(overrides: Partial<ExporterWizardDraft> = {}): ExporterWizardDraft {
  return { ...DEFAULT_EXPORTER_DRAFT, ...overrides }
}

describe('ReviewStep', () => {
  describe('Exporter Type', () => {
    it('displays "Contact / Transactional" label when type is contact_transactional', () => {
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Contact / Transactional')).toBeInTheDocument()
    })

    it('displays "Event-based" label when type is event_based', () => {
      const draft = createDraft({ exporterType: 'event_based' })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Event-based')).toBeInTheDocument()
    })

    it('displays "Not selected" when exporterType is null', () => {
      const draft = createDraft({ exporterType: null })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Not selected')).toBeInTheDocument()
    })
  })

  describe('Data Sources (contact/transactional path)', () => {
    it('shows selected data sources', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact', 'transactional'],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Contacts')).toBeInTheDocument()
      expect(screen.getByText('Transactional')).toBeInTheDocument()
    })

    it('shows "No sources selected" when no sources are selected', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: [],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('No sources selected')).toBeInTheDocument()
    })

    it('shows join key indicator when multiple sources selected', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact', 'transactional'],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Join Key')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
    })

    it('does not show join key indicator when single source selected', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedSources: ['contact'],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.queryByText('Join Key')).not.toBeInTheDocument()
    })
  })

  describe('Event Sources (event-based path)', () => {
    it('shows selected event sources', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends', 'campaign_events'],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Mailouts from this send')).toBeInTheDocument()
      expect(screen.getByText('All event channels from this campaign')).toBeInTheDocument()
    })

    it('shows "No event sources selected" when none selected', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: [],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('No event sources selected')).toBeInTheDocument()
    })

    it('shows all three event source labels correctly', () => {
      const draft = createDraft({
        exporterType: 'event_based',
        selectedEventSources: ['mailout_sends', 'campaign_events', 'failed_sends'],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Mailouts from this send')).toBeInTheDocument()
      expect(screen.getByText('All event channels from this campaign')).toBeInTheDocument()
      expect(screen.getByText('All failed sends from this send')).toBeInTheDocument()
    })
  })

  describe('Fields', () => {
    it('shows selected fields with resolved column names', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
          { key: 'email', label: 'Email', source: 'contact' },
        ],
        columnRenames: [],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('shows renamed fields with original label in parentheses', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
        ],
        columnRenames: [{ fieldKey: 'firstName', outputName: 'Given Name' }],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Given Name')).toBeInTheDocument()
      expect(screen.getByText('(from: First Name)')).toBeInTheDocument()
    })

    it('shows "No fields selected" when no fields are selected', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedFields: [],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('No fields selected')).toBeInTheDocument()
    })

    it('shows field numbering in order', () => {
      const draft = createDraft({
        exporterType: 'contact_transactional',
        selectedFields: [
          { key: 'firstName', label: 'First Name', source: 'contact' },
          { key: 'lastName', label: 'Last Name', source: 'contact' },
          { key: 'email', label: 'Email', source: 'contact' },
        ],
        columnRenames: [],
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('1.')).toBeInTheDocument()
      expect(screen.getByText('2.')).toBeInTheDocument()
      expect(screen.getByText('3.')).toBeInTheDocument()
    })
  })

  describe('File Configuration', () => {
    it('shows filename preview with prefix and timestamp', () => {
      const draft = createDraft({
        fileNamingPrefix: 'my-export_',
      })
      render(<ReviewStep draft={draft} />)

      // The filename preview should contain the prefix followed by a timestamp pattern
      const fileNameElement = screen.getByText((content) =>
        content.startsWith('my-export_') && content.endsWith('.csv')
      )
      expect(fileNameElement).toBeInTheDocument()
    })

    it('shows filename preview without prefix when prefix is empty', () => {
      const draft = createDraft({
        fileNamingPrefix: '',
      })
      render(<ReviewStep draft={draft} />)

      // Should show just timestamp.csv
      const fileNameElement = screen.getByText((content) =>
        /^\d{8}-\d{6}\.csv$/.test(content)
      )
      expect(fileNameElement).toBeInTheDocument()
    })

    it('shows the prefix value', () => {
      const draft = createDraft({
        fileNamingPrefix: 'daily-contacts',
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('daily-contacts')).toBeInTheDocument()
    })

    it('shows "(none)" when prefix is empty', () => {
      const draft = createDraft({
        fileNamingPrefix: '',
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('(none)')).toBeInTheDocument()
    })

    it('shows timezone from format options', () => {
      const draft = createDraft({
        formatOptions: {
          delimiter: ',',
          includeHeader: true,
          dateFormat: 'ISO8601',
          timezone: 'Pacific/Auckland',
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Pacific/Auckland')).toBeInTheDocument()
    })
  })

  describe('Schedule', () => {
    it('shows "Daily" for daily frequency', () => {
      const draft = createDraft({
        schedule: {
          frequency: 'daily',
          weeklyDays: [false, false, false, false, false, false, false],
          monthlyDays: [],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Daily')).toBeInTheDocument()
    })

    it('shows "Hourly" for hourly frequency', () => {
      const draft = createDraft({
        schedule: {
          frequency: 'hourly',
          weeklyDays: [false, false, false, false, false, false, false],
          monthlyDays: [],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Hourly')).toBeInTheDocument()
    })

    it('shows weekly schedule with selected days', () => {
      const draft = createDraft({
        schedule: {
          frequency: 'weekly',
          weeklyDays: [true, false, true, false, true, false, false], // Mon, Wed, Fri
          monthlyDays: [],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Weekly on Mon, Wed, Fri')).toBeInTheDocument()
    })

    it('shows monthly schedule with selected days', () => {
      const draft = createDraft({
        schedule: {
          frequency: 'monthly',
          weeklyDays: [false, false, false, false, false, false, false],
          monthlyDays: [1, 15],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Monthly on days 1, 15')).toBeInTheDocument()
    })

    it('shows monthly schedule with single day (no plural)', () => {
      const draft = createDraft({
        schedule: {
          frequency: 'monthly',
          weeklyDays: [false, false, false, false, false, false, false],
          monthlyDays: [1],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('Monthly on day 1')).toBeInTheDocument()
    })
  })

  describe('Notifications', () => {
    it('shows failure emails when configured', () => {
      const draft = createDraft({
        notifications: {
          failureEmails: ['admin@example.com', 'ops@example.com'],
          successEnabled: false,
          successEmails: [],
          noFileAlertEnabled: false,
          noFileAlertEmails: [],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('admin@example.com, ops@example.com')).toBeInTheDocument()
    })

    it('shows "None configured" when no failure emails', () => {
      const draft = createDraft({
        notifications: {
          failureEmails: [],
          successEnabled: false,
          successEmails: [],
          noFileAlertEnabled: false,
          noFileAlertEmails: [],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('None configured')).toBeInTheDocument()
    })

    it('shows success notification status when enabled', () => {
      const draft = createDraft({
        notifications: {
          failureEmails: ['admin@example.com'],
          successEnabled: true,
          successEmails: ['success@example.com'],
          noFileAlertEnabled: false,
          noFileAlertEmails: [],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('success@example.com')).toBeInTheDocument()
    })

    it('shows "Disabled" for success notifications when not enabled', () => {
      const draft = createDraft({
        notifications: {
          failureEmails: ['admin@example.com'],
          successEnabled: false,
          successEmails: [],
          noFileAlertEnabled: false,
          noFileAlertEmails: [],
        },
      })
      render(<ReviewStep draft={draft} />)

      // Both success and no-file alerts show "Disabled" — use getAllByText
      const disabledElements = screen.getAllByText('Disabled')
      expect(disabledElements.length).toBeGreaterThanOrEqual(1)

      // Verify the success notifications row specifically
      expect(screen.getByText('Success Notifications')).toBeInTheDocument()
      const successRow = screen.getByText('Success Notifications').closest('div')
      expect(successRow).toHaveTextContent('Disabled')
    })

    it('shows no-file alert emails when enabled', () => {
      const draft = createDraft({
        notifications: {
          failureEmails: ['admin@example.com'],
          successEnabled: false,
          successEmails: [],
          noFileAlertEnabled: true,
          noFileAlertEmails: ['alert@example.com'],
        },
      })
      render(<ReviewStep draft={draft} />)

      expect(screen.getByText('alert@example.com')).toBeInTheDocument()
    })
  })

  describe('Edit buttons', () => {
    it('calls onEditStep with step 0 when type edit is clicked', () => {
      const onEditStep = vi.fn()
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} onEditStep={onEditStep} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0]) // First edit button is for type

      expect(onEditStep).toHaveBeenCalledWith(0)
    })

    it('calls onEditStep with step 1 when source edit is clicked', () => {
      const onEditStep = vi.fn()
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} onEditStep={onEditStep} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[1]) // Second edit button is for sources

      expect(onEditStep).toHaveBeenCalledWith(1)
    })

    it('calls onEditStep with step 2 when fields edit is clicked', () => {
      const onEditStep = vi.fn()
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} onEditStep={onEditStep} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[2]) // Third edit button is for fields

      expect(onEditStep).toHaveBeenCalledWith(2)
    })

    it('calls onEditStep with step 3 when file config edit is clicked', () => {
      const onEditStep = vi.fn()
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} onEditStep={onEditStep} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[3]) // Fourth edit button is for file config

      expect(onEditStep).toHaveBeenCalledWith(3)
    })

    it('calls onEditStep with step 4 when schedule edit is clicked', () => {
      const onEditStep = vi.fn()
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} onEditStep={onEditStep} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[4]) // Fifth edit button is for schedule

      expect(onEditStep).toHaveBeenCalledWith(4)
    })

    it('calls onEditStep with step 5 when notifications edit is clicked', () => {
      const onEditStep = vi.fn()
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} onEditStep={onEditStep} />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[5]) // Sixth edit button is for notifications

      expect(onEditStep).toHaveBeenCalledWith(5)
    })

    it('does not render edit buttons when onEditStep is not provided', () => {
      const draft = createDraft({ exporterType: 'contact_transactional' })
      render(<ReviewStep draft={draft} />)

      expect(screen.queryAllByRole('button', { name: /edit/i })).toHaveLength(0)
    })
  })
})
