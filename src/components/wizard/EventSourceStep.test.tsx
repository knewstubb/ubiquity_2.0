import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { EventSourceStep } from './EventSourceStep'
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard'
import type { ExporterWizardDraft } from '../../models/wizard'

function renderStep(overrides: Partial<ExporterWizardDraft> = {}) {
  const draft: ExporterWizardDraft = { ...DEFAULT_EXPORTER_DRAFT, ...overrides }
  const onUpdate = vi.fn()
  const result = render(<EventSourceStep draft={draft} onUpdate={onUpdate} />)
  return { ...result, draft, onUpdate }
}

describe('EventSourceStep', () => {
  it('renders all three event source options', () => {
    renderStep()
    expect(screen.getByRole('checkbox', { name: 'Mailouts from this send' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'All event channels from this campaign' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'All failed sends from this send' })).toBeInTheDocument()
  })

  it('renders none selected by default', () => {
    renderStep()
    expect(screen.getByRole('checkbox', { name: 'Mailouts from this send' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('checkbox', { name: 'All event channels from this campaign' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('checkbox', { name: 'All failed sends from this send' })).toHaveAttribute('aria-checked', 'false')
  })

  it('shows selected state when draft has event sources', () => {
    renderStep({ selectedEventSources: ['mailout_sends', 'failed_sends'] })
    expect(screen.getByRole('checkbox', { name: 'Mailouts from this send' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('checkbox', { name: 'All event channels from this campaign' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('checkbox', { name: 'All failed sends from this send' })).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onUpdate with added source when toggling on', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderStep()

    await user.click(screen.getByRole('checkbox', { name: 'Mailouts from this send' }))

    expect(onUpdate).toHaveBeenCalledWith({
      selectedEventSources: ['mailout_sends'],
    })
  })

  it('calls onUpdate with removed source when toggling off', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderStep({ selectedEventSources: ['mailout_sends', 'campaign_events'] })

    await user.click(screen.getByRole('checkbox', { name: 'Mailouts from this send' }))

    expect(onUpdate).toHaveBeenCalledWith({
      selectedEventSources: ['campaign_events'],
    })
  })

  it('does not show validation message before interaction', () => {
    renderStep()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows validation message when no source selected after interaction', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    const { rerender } = render(
      <EventSourceStep
        draft={{ ...DEFAULT_EXPORTER_DRAFT, selectedEventSources: ['mailout_sends'] }}
        onUpdate={onUpdate}
      />,
    )

    // Toggle off the only selected source — this triggers touched state
    await user.click(screen.getByRole('checkbox', { name: 'Mailouts from this send' }))

    expect(onUpdate).toHaveBeenCalledWith({ selectedEventSources: [] })

    // Re-render with empty selection to see validation
    rerender(
      <EventSourceStep
        draft={{ ...DEFAULT_EXPORTER_DRAFT, selectedEventSources: [] }}
        onUpdate={onUpdate}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('At least one event source is required')
  })

  it('hides validation message when a source is selected', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    const { rerender } = render(
      <EventSourceStep
        draft={{ ...DEFAULT_EXPORTER_DRAFT, selectedEventSources: ['mailout_sends'] }}
        onUpdate={onUpdate}
      />,
    )

    // Toggle off to trigger touched state
    await user.click(screen.getByRole('checkbox', { name: 'Mailouts from this send' }))

    // Re-render with empty to show validation
    rerender(
      <EventSourceStep
        draft={{ ...DEFAULT_EXPORTER_DRAFT, selectedEventSources: [] }}
        onUpdate={onUpdate}
      />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Re-render with a selection — validation should hide
    rerender(
      <EventSourceStep
        draft={{ ...DEFAULT_EXPORTER_DRAFT, selectedEventSources: ['campaign_events'] }}
        onUpdate={onUpdate}
      />,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
