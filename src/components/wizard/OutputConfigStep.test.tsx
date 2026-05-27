import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { OutputConfigStep } from './OutputConfigStep'
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard'
import type { ExporterWizardDraft } from '../../models/wizard'

/**
 * Unit tests for reworked OutputConfigStep component.
 *
 * Validates: Requirements 7.2, 7.4, 7.5, 8.1
 */

// Radix Select uses hasPointerCapture which isn't available in jsdom
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
})

function renderStep(overrides: Partial<ExporterWizardDraft> = {}) {
  const draft: ExporterWizardDraft = { ...DEFAULT_EXPORTER_DRAFT, ...overrides }
  const onUpdate = vi.fn()
  const result = render(<OutputConfigStep draft={draft} onUpdate={onUpdate} />)
  return { ...result, draft, onUpdate }
}

describe('OutputConfigStep', () => {
  describe('File name prefix', () => {
    it('renders file name prefix input with suffix indicator', () => {
      renderStep()
      expect(screen.getByTestId('file-prefix-input')).toBeInTheDocument()
      // The suffix indicator shows -{timestamp}.csv — text is split across nodes in the span
      const input = screen.getByTestId('file-prefix-input')
      const container = input.parentElement
      const suffix = container?.querySelector('span')
      expect(suffix).not.toBeNull()
      expect(suffix?.textContent).toContain('{timestamp}')
      expect(suffix?.textContent).toContain('.csv')
    })

    it('shows validation error for invalid prefix with special characters', () => {
      render(
        <OutputConfigStep
          draft={{ ...DEFAULT_EXPORTER_DRAFT, fileNamingPrefix: 'bad prefix!' }}
          onUpdate={vi.fn()}
        />
      )

      expect(screen.getByTestId('prefix-error')).toBeInTheDocument()
      expect(screen.getByTestId('prefix-error')).toHaveTextContent(
        'Prefix must be 1–100 characters using only letters, numbers, hyphens, and underscores'
      )
    })

    it('shows validation error for prefix that is too long (>100 chars)', () => {
      const longPrefix = 'a'.repeat(101)
      render(
        <OutputConfigStep
          draft={{ ...DEFAULT_EXPORTER_DRAFT, fileNamingPrefix: longPrefix }}
          onUpdate={vi.fn()}
        />
      )

      expect(screen.getByTestId('prefix-error')).toBeInTheDocument()
    })

    it('does not show validation error for valid prefix', () => {
      renderStep({ fileNamingPrefix: 'daily-export_2025' })
      expect(screen.queryByTestId('prefix-error')).not.toBeInTheDocument()
    })

    it('does not show validation error when prefix is empty (initial state)', () => {
      renderStep({ fileNamingPrefix: '' })
      expect(screen.queryByTestId('prefix-error')).not.toBeInTheDocument()
    })

    it('calls onUpdate with fileNamingPrefix when prefix changes', () => {
      const onUpdate = vi.fn()
      render(
        <OutputConfigStep
          draft={{ ...DEFAULT_EXPORTER_DRAFT, fileNamingPrefix: '' }}
          onUpdate={onUpdate}
        />
      )

      const input = screen.getByTestId('file-prefix-input')
      fireEvent.change(input, { target: { value: 'new-prefix' } })

      expect(onUpdate).toHaveBeenCalledWith({ fileNamingPrefix: 'new-prefix' })
    })

    it('marks input as aria-invalid when prefix has invalid characters', () => {
      render(
        <OutputConfigStep
          draft={{ ...DEFAULT_EXPORTER_DRAFT, fileNamingPrefix: 'bad@prefix' }}
          onUpdate={vi.fn()}
        />
      )

      const input = screen.getByTestId('file-prefix-input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('File format selection', () => {
    it('renders file format selector', () => {
      renderStep()
      expect(screen.getByTestId('file-format-select')).toBeInTheDocument()
    })

    it('defaults to CSV format', () => {
      renderStep()
      expect(screen.getByTestId('file-format-select')).toHaveTextContent('CSV (Comma-separated)')
    })

    it('shows TSV when delimiter is tab', () => {
      renderStep({
        formatOptions: { ...DEFAULT_EXPORTER_DRAFT.formatOptions, delimiter: '\t' },
      })
      expect(screen.getByTestId('file-format-select')).toHaveTextContent('TSV (Tab-separated)')
    })

    it('shows Pipe-delimited when delimiter is pipe', () => {
      renderStep({
        formatOptions: { ...DEFAULT_EXPORTER_DRAFT.formatOptions, delimiter: '|' },
      })
      expect(screen.getByTestId('file-format-select')).toHaveTextContent('Pipe-delimited')
    })
  })

  describe('Timezone selector', () => {
    it('renders timezone selector', () => {
      renderStep()
      expect(screen.getByTestId('timezone-select')).toBeInTheDocument()
    })

    it('defaults to Pacific/Auckland', () => {
      renderStep()
      expect(screen.getByTestId('timezone-select')).toHaveTextContent('Pacific/Auckland (NZST/NZDT)')
    })

    it('shows selected timezone when draft has different timezone', () => {
      renderStep({
        formatOptions: { ...DEFAULT_EXPORTER_DRAFT.formatOptions, timezone: 'UTC' },
      })
      expect(screen.getByTestId('timezone-select')).toHaveTextContent('UTC')
    })
  })

  describe('Collapsible format options', () => {
    it('renders format options section collapsed by default', () => {
      renderStep()
      // The delimiter select should not be visible when collapsed
      expect(screen.queryByTestId('delimiter-select')).not.toBeInTheDocument()
    })

    it('shows summary text when collapsed', () => {
      renderStep()
      expect(screen.getByText('CSV · Headers on · Pacific/Auckland')).toBeInTheDocument()
    })

    it('expands to show delimiter, header row toggle, and date format when clicked', async () => {
      const user = userEvent.setup()
      renderStep()

      // Click the collapsible trigger using the specific summary text
      const trigger = screen.getByText('CSV · Headers on · Pacific/Auckland')
      await user.click(trigger)

      expect(screen.getByTestId('delimiter-select')).toBeInTheDocument()
      expect(screen.getByTestId('header-row-toggle')).toBeInTheDocument()
      expect(screen.getByTestId('date-format-select')).toBeInTheDocument()
    })

    it('calls onUpdate when header row toggle is changed', async () => {
      const user = userEvent.setup()
      const { onUpdate } = renderStep()

      // Expand the collapsible
      const trigger = screen.getByText('CSV · Headers on · Pacific/Auckland')
      await user.click(trigger)

      // Toggle header row off
      await user.click(screen.getByTestId('header-row-toggle'))

      expect(onUpdate).toHaveBeenCalledWith({
        formatOptions: expect.objectContaining({ includeHeader: false }),
      })
    })

    it('shows "Hide options" text when expanded', async () => {
      const user = userEvent.setup()
      renderStep()

      const trigger = screen.getByText('CSV · Headers on · Pacific/Auckland')
      await user.click(trigger)

      expect(screen.getByText('Hide options')).toBeInTheDocument()
    })
  })

  describe('Filename preview', () => {
    it('renders filename preview section', () => {
      renderStep({ fileNamingPrefix: 'my-export' })
      expect(screen.getByTestId('filename-preview')).toBeInTheDocument()
    })

    it('shows preview with prefix and timestamp format YYYYMMDD-HHmmss', () => {
      renderStep({ fileNamingPrefix: 'my-export' })
      const preview = screen.getByTestId('filename-preview')
      // Preview should match pattern: my-export-YYYYMMDD-HHmmss.csv
      expect(preview.textContent).toMatch(/^my-export-\d{8}-\d{6}\.csv$/)
    })

    it('updates preview when prefix changes', () => {
      const { rerender } = render(
        <OutputConfigStep
          draft={{ ...DEFAULT_EXPORTER_DRAFT, fileNamingPrefix: 'first' }}
          onUpdate={vi.fn()}
        />
      )

      expect(screen.getByTestId('filename-preview').textContent).toMatch(/^first-\d{8}-\d{6}\.csv$/)

      rerender(
        <OutputConfigStep
          draft={{ ...DEFAULT_EXPORTER_DRAFT, fileNamingPrefix: 'second' }}
          onUpdate={vi.fn()}
        />
      )

      expect(screen.getByTestId('filename-preview').textContent).toMatch(/^second-\d{8}-\d{6}\.csv$/)
    })

    it('uses "export" as fallback prefix when prefix is empty', () => {
      renderStep({ fileNamingPrefix: '' })
      const preview = screen.getByTestId('filename-preview')
      expect(preview.textContent).toMatch(/^export-\d{8}-\d{6}\.csv$/)
    })

    it('shows .tsv extension when format is TSV', () => {
      renderStep({
        fileNamingPrefix: 'data',
        formatOptions: {
          ...DEFAULT_EXPORTER_DRAFT.formatOptions,
          delimiter: '\t',
        },
      })
      const preview = screen.getByTestId('filename-preview')
      expect(preview.textContent).toMatch(/^data-\d{8}-\d{6}\.tsv$/)
    })

    it('timestamp portion resolves to YYYYMMDD-HHmmss format', () => {
      renderStep({ fileNamingPrefix: 'test' })
      const preview = screen.getByTestId('filename-preview')
      // Extract the timestamp portion between prefix- and .csv
      const match = preview.textContent?.match(/^test-(\d{8}-\d{6})\.csv$/)
      expect(match).not.toBeNull()
      // Validate the timestamp format: YYYYMMDD-HHmmss
      const timestamp = match![1]
      const [datePart, timePart] = timestamp.split('-')
      // Date part should be 8 digits (YYYYMMDD)
      expect(datePart).toHaveLength(8)
      // Time part should be 6 digits (HHmmss)
      expect(timePart).toHaveLength(6)
    })
  })
})
