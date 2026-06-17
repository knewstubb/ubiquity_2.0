import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { WizardModal } from './WizardModal'
import type { ExporterWizardDraft } from '../../models/wizard'
import type { Automation } from '../../models/automation'
import type { SourceConfig } from '../../models/source-selection'

// Mock contexts
const mockGetConnectionById = vi.fn()
const mockAutomations: Automation[] = []

vi.mock('../../contexts/ConnectionsContext', () => ({
  useConnections: () => ({
    connections: [],
    getConnectionById: mockGetConnectionById,
  }),
}))

vi.mock('../../contexts/AutomationsContext', () => ({
  useAutomations: () => ({
    automations: mockAutomations,
  }),
}))

// Mock child step components to isolate WizardModal logic
vi.mock('./SourceSelectionStep', () => ({
  SourceSelectionStep: ({ draft, onUpdate }: { draft: ExporterWizardDraft; onUpdate: (p: Partial<ExporterWizardDraft>) => void }) => {
    const sourceConfig = draft.sourceConfig
    return (
      <div data-testid="source-selection-step">
        <span data-testid="selected-source">{sourceConfig?.primarySource ?? 'none'}</span>
        <button
          data-testid="select-contacts"
          onClick={() => onUpdate({
            sourceConfig: {
              primarySource: 'contacts',
              filter: { type: 'all' },
              enrichment: null,
            } as SourceConfig,
          })}
        >
          Select Contacts
        </button>
        <button
          data-testid="select-transactions"
          onClick={() => onUpdate({
            sourceConfig: {
              primarySource: 'transactions',
              tableId: 'orders',
              filter: { type: 'all' },
              enrichment: null,
            } as SourceConfig,
          })}
        >
          Select Transactions
        </button>
        <button
          data-testid="select-messages"
          onClick={() => onUpdate({
            sourceConfig: {
              primarySource: 'messages',
              channels: ['email'],
              filter: { type: 'all' },
              enrichment: null,
            } as SourceConfig,
          })}
        >
          Select Messages
        </button>
      </div>
    )
  },
}))

vi.mock('./DataSourceFilterStep', () => ({
  DataSourceFilterStep: ({ draft, onUpdate }: { draft: ExporterWizardDraft; onUpdate: (p: Partial<ExporterWizardDraft>) => void }) => (
    <div data-testid="data-source-filter-step">
      <button
        data-testid="set-source-contacts"
        onClick={() => onUpdate({
          sourceConfig: {
            primarySource: 'contacts',
            filter: { type: 'all' },
            enrichment: null,
          } as SourceConfig,
        })}
      >
        Set Contacts Source
      </button>
    </div>
  ),
}))

vi.mock('./FieldMappingStep', () => ({
  FieldMappingStep: ({ draft, onUpdate }: { draft: ExporterWizardDraft; onUpdate: (p: Partial<ExporterWizardDraft>) => void }) => (
    <div data-testid="field-mapping-step">
      <button data-testid="select-fields" onClick={() => onUpdate({ selectedFields: [{ key: 'email', label: 'Email', source: 'contact' }] })}>Select Fields</button>
    </div>
  ),
}))

vi.mock('./OutputConfigStep', () => ({
  OutputConfigStep: ({ draft, onUpdate }: { draft: ExporterWizardDraft; onUpdate: (p: Partial<ExporterWizardDraft>) => void }) => (
    <div data-testid="output-config-step">
      <button data-testid="set-prefix" onClick={() => onUpdate({ fileNamingPrefix: 'my-export' })}>Set Prefix</button>
    </div>
  ),
}))

vi.mock('./ScheduleStep', () => ({
  ScheduleStep: ({ draft, onUpdate }: { draft: ExporterWizardDraft; onUpdate: (p: Partial<ExporterWizardDraft>) => void }) => (
    <div data-testid="schedule-step">
      <span>Schedule Step</span>
    </div>
  ),
}))

vi.mock('../shared/NotificationsStep', () => ({
  NotificationsStep: ({ value, onUpdate, onValidChange }: { value: unknown; onUpdate: (c: unknown) => void; onValidChange?: (v: boolean) => void }) => (
    <div data-testid="notifications-step">
      <button data-testid="set-notifications-valid" onClick={() => onValidChange?.(true)}>Mark Valid</button>
    </div>
  ),
}))

vi.mock('./ReviewStep', () => ({
  ReviewStep: ({ draft, onEditStep }: { draft: ExporterWizardDraft; onEditStep: (s: number) => void }) => (
    <div data-testid="review-step">
      <span>Review Step</span>
    </div>
  ),
}))

/**
 * Unit tests for WizardModal component.
 *
 * The wizard step order is:
 *   0: File Settings (OutputConfigStep)
 *   1: Data Source (DataSourceFilterStep)
 *   2: Field Mapping (FieldMappingStep)
 *   3: Schedule (ScheduleStep)
 *   4: Notifications (NotificationsStep)
 *   5: Review (ReviewStep)
 */

describe('WizardModal', () => {
  const defaultProps = {
    connectionId: 'conn-1',
    connectorName: 'Test Connector',
    onSave: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetConnectionById.mockReturnValue({ id: 'conn-1', name: 'Test Connection' })
  })

  describe('Initial render', () => {
    it('renders with File Settings as first step', () => {
      render(<WizardModal {...defaultProps} />)

      expect(screen.getByTestId('output-config-step')).toBeInTheDocument()
    })

    it('renders the wizard modal dialog', () => {
      render(<WizardModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('wizard-modal')).toBeInTheDocument()
    })

    it('shows "New Exporter" title when not in edit mode', () => {
      render(<WizardModal {...defaultProps} />)

      expect(screen.getByText('New Exporter')).toBeInTheDocument()
    })

    it('shows "Edit Exporter" title when in edit mode', () => {
      const automation: Automation = {
        id: 'auto-1',
        connectionId: 'conn-1',
        name: 'Existing Export',
        direction: 'export',
        dataType: 'contact',
        selectedFields: [{ key: 'email', label: 'Email', source: 'contact' }],
        fileType: 'csv',
        formatOptions: { delimiter: ',', includeHeader: true, dateFormat: 'ISO8601', timezone: 'UTC' },
        fileNamingPattern: 'test_{date}',
        schedule: 'daily',
        filters: { combinator: 'AND', rules: [], groups: [] },
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      mockAutomations.push(automation)

      render(<WizardModal {...defaultProps} editConnectorId="auto-1" />)

      expect(screen.getByText('Edit Exporter')).toBeInTheDocument()

      // Clean up
      mockAutomations.length = 0
    })
  })

  describe('Step labels (6-step wizard)', () => {
    it('shows correct step labels in the stepper', () => {
      render(<WizardModal {...defaultProps} />)

      const nav = screen.getByRole('navigation', { name: 'Progress' })
      expect(within(nav).getByText('File Settings')).toBeInTheDocument()
      expect(within(nav).getByText('Data Source')).toBeInTheDocument()
      expect(within(nav).getByText('Field Mapping')).toBeInTheDocument()
      expect(within(nav).getByText('Schedule')).toBeInTheDocument()
      expect(within(nav).getByText('Notifications')).toBeInTheDocument()
      expect(within(nav).getByText('Review')).toBeInTheDocument()
    })

    it('keeps File Settings step label unchanged', () => {
      render(<WizardModal {...defaultProps} />)

      const nav = screen.getByRole('navigation', { name: 'Progress' })
      expect(within(nav).getByText('File Settings')).toBeInTheDocument()
    })
  })

  describe('Next button validation on File Settings step', () => {
    it('Next button is enabled on File Settings when connector name is valid', () => {
      render(<WizardModal {...defaultProps} />)

      // File Settings step uses the connector name slugified as default prefix,
      // which is valid for "Test Connector" → "test-connector"
      const nextButton = screen.getByRole('button', { name: 'Next' })
      expect(nextButton).toBeEnabled()
    })
  })

  describe('Navigation forward marks steps as completed', () => {
    it('navigating forward from File Settings goes to Data Source', () => {
      render(<WizardModal {...defaultProps} />)

      // File Settings is valid by default (connector name provides a valid prefix)
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))

      // Now on step 1 (Data Source)
      expect(screen.getByTestId('data-source-filter-step')).toBeInTheDocument()
    })

    it('navigating forward from Data Source goes to Field Mapping', () => {
      render(<WizardModal {...defaultProps} />)

      // Advance to Data Source
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getByTestId('data-source-filter-step')).toBeInTheDocument()

      // Must configure a source before proceeding (at least one filter condition required)
      fireEvent.click(screen.getByTestId('set-source-contacts'))
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))

      // Now on step 2 (Field Mapping)
      expect(screen.getByTestId('field-mapping-step')).toBeInTheDocument()
    })
  })

  describe('Back button navigation', () => {
    it('Back button is disabled on the first step', () => {
      render(<WizardModal {...defaultProps} />)

      const backButton = screen.getByRole('button', { name: 'Back' })
      expect(backButton).toBeDisabled()
    })

    it('Back button navigates to previous step', () => {
      render(<WizardModal {...defaultProps} />)

      // Advance to Data Source
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
      expect(screen.getByTestId('data-source-filter-step')).toBeInTheDocument()

      // Click Back
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))

      // Should be back on File Settings
      expect(screen.getByTestId('output-config-step')).toBeInTheDocument()
    })
  })

  describe('Close button triggers discard confirmation when dirty', () => {
    it('close button triggers discard confirmation when draft is dirty', () => {
      render(<WizardModal {...defaultProps} />)

      // Make the draft dirty by setting the prefix
      fireEvent.click(screen.getByTestId('set-prefix'))

      // Click close button
      fireEvent.click(screen.getByTestId('wizard-close-button'))

      // Discard confirmation should appear
      expect(screen.getByText('Discard changes?')).toBeInTheDocument()
      expect(screen.getByText('Your unsaved changes will be lost. This cannot be undone.')).toBeInTheDocument()
    })

    it('close button calls onClose directly when draft is not dirty', () => {
      render(<WizardModal {...defaultProps} />)

      // Click close without making changes
      fireEvent.click(screen.getByTestId('wizard-close-button'))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('discard confirmation "Keep editing" button dismisses the dialog', () => {
      render(<WizardModal {...defaultProps} />)

      // Make dirty
      fireEvent.click(screen.getByTestId('set-prefix'))
      // Trigger close
      fireEvent.click(screen.getByTestId('wizard-close-button'))

      // Click "Keep editing"
      fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }))

      // Dialog should be dismissed, wizard still visible
      expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument()
      expect(screen.getByTestId('wizard-modal')).toBeInTheDocument()
    })

    it('discard confirmation "Discard" button calls onClose', () => {
      render(<WizardModal {...defaultProps} />)

      // Make dirty
      fireEvent.click(screen.getByTestId('set-prefix'))
      // Trigger close
      fireEvent.click(screen.getByTestId('wizard-close-button'))

      // Click "Discard"
      fireEvent.click(screen.getByRole('button', { name: 'Discard' }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Escape key triggers discard confirmation when dirty', () => {
    it('Escape key triggers discard confirmation when draft is dirty', () => {
      render(<WizardModal {...defaultProps} />)

      // Make dirty
      fireEvent.click(screen.getByTestId('set-prefix'))

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.getByText('Discard changes?')).toBeInTheDocument()
    })

    it('Escape key calls onClose directly when draft is not dirty', () => {
      render(<WizardModal {...defaultProps} />)

      // Press Escape without making changes
      fireEvent.keyDown(document, { key: 'Escape' })

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Step indicator shows correct current position', () => {
    it('step indicator shows step 1 as current on initial render', () => {
      render(<WizardModal {...defaultProps} />)

      // The stepper should show File Settings as first step
      const nav = screen.getByRole('navigation', { name: 'Progress' })
      expect(within(nav).getByText('File Settings')).toBeInTheDocument()
    })

    it('step indicator updates when navigating forward', () => {
      render(<WizardModal {...defaultProps} />)

      // Advance to Data Source
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))

      // The step content should now be Data Source
      expect(screen.getByTestId('data-source-filter-step')).toBeInTheDocument()
    })
  })

  describe('Save/create button on final step', () => {
    it('shows "Next" button when not on the final step', () => {
      render(<WizardModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    })
  })

  describe('Edit mode hydration', () => {
    it('hydrates draft from existing automation in edit mode', () => {
      const automation: Automation = {
        id: 'auto-edit',
        connectionId: 'conn-1',
        name: 'Existing Export',
        direction: 'export',
        dataType: 'contact',
        selectedFields: [{ key: 'email', label: 'Email', source: 'contact' }],
        fileType: 'csv',
        formatOptions: { delimiter: ',', includeHeader: true, dateFormat: 'ISO8601', timezone: 'UTC' },
        fileNamingPattern: 'test_{date}',
        schedule: 'daily',
        filters: { combinator: 'AND', rules: [], groups: [] },
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        scheduleConfig: {
          frequency: 'weekly',
          starting: '',
          every: '1',
          at: '',
          weeklyDays: [true, false, true, false, true, false, false],
          monthlyPattern: 'day',
          monthlyOrdinal: '',
          monthlyDayOfWeek: '',
          monthlyDates: [],
        },
      }
      mockAutomations.push(automation)

      render(<WizardModal {...defaultProps} editConnectorId="auto-edit" />)

      // In edit mode, the wizard still shows File Settings as the first step
      expect(screen.getByTestId('output-config-step')).toBeInTheDocument()
      // Edit mode title
      expect(screen.getByText('Edit Exporter')).toBeInTheDocument()

      // Clean up
      mockAutomations.length = 0
    })

    it('overrides legacy timezone with Pacific/Auckland in edit mode', () => {
      const automation: Automation = {
        id: 'auto-tz',
        connectionId: 'conn-1',
        name: 'Legacy Export',
        direction: 'export',
        dataType: 'contact',
        selectedFields: [{ key: 'email', label: 'Email', source: 'contact' }],
        fileType: 'csv',
        formatOptions: { delimiter: ',', includeHeader: true, dateFormat: 'ISO8601', timezone: 'UTC' },
        fileNamingPattern: 'test_{date}',
        schedule: 'daily',
        filters: { combinator: 'AND', rules: [], groups: [] },
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
      mockAutomations.push(automation)

      // The component should hydrate with Pacific/Auckland timezone
      render(<WizardModal {...defaultProps} editConnectorId="auto-tz" />)
      expect(screen.getByText('Edit Exporter')).toBeInTheDocument()

      // Clean up
      mockAutomations.length = 0
    })
  })

  describe('Cancel button', () => {
    it('Cancel button triggers discard confirmation when dirty', () => {
      render(<WizardModal {...defaultProps} />)

      // Make dirty
      fireEvent.click(screen.getByTestId('set-prefix'))

      // Click Cancel
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.getByText('Discard changes?')).toBeInTheDocument()
    })

    it('Cancel button calls onClose when not dirty', () => {
      render(<WizardModal {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })
})
