import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ScheduleStep } from './ScheduleStep'
import { DEFAULT_EXPORTER_DRAFT } from '../../models/wizard'
import type { ExporterWizardDraft } from '../../models/wizard'

function renderStep(overrides: Partial<ExporterWizardDraft> = {}) {
  const draft: ExporterWizardDraft = { ...DEFAULT_EXPORTER_DRAFT, ...overrides }
  const onUpdate = vi.fn()
  const result = render(<ScheduleStep draft={draft} onUpdate={onUpdate} />)
  return { ...result, draft, onUpdate }
}

describe('ScheduleStep', () => {
  it('renders frequency selector with hourly/daily/weekly/monthly options', () => {
    renderStep()
    expect(screen.getByRole('radio', { name: 'Hourly' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Daily' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Weekly' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Monthly' })).toBeInTheDocument()
  })

  it('shows daily as the default frequency', () => {
    renderStep()
    expect(screen.getByRole('radio', { name: 'Daily' })).toHaveAttribute('aria-checked', 'true')
  })

  it('does not render time-of-day input', () => {
    renderStep()
    expect(screen.queryByLabelText(/time/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /time/i })).not.toBeInTheDocument()
  })

  it('shows info note about automatic execution time', () => {
    renderStep()
    expect(
      screen.getByText(/execution time is assigned automatically/i)
    ).toBeInTheDocument()
  })

  it('hides day pickers for hourly frequency', () => {
    renderStep({ schedule: { frequency: 'hourly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] } })
    expect(screen.queryByLabelText(/Monday/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Day 1/)).not.toBeInTheDocument()
  })

  it('hides day pickers for daily frequency', () => {
    renderStep({ schedule: { frequency: 'daily', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] } })
    expect(screen.queryByLabelText(/Monday/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Day 1/)).not.toBeInTheDocument()
  })

  it('shows day-of-week picker for weekly frequency', () => {
    renderStep({ schedule: { frequency: 'weekly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] } })
    expect(screen.getByLabelText('Monday')).toBeInTheDocument()
    expect(screen.getByLabelText('Tuesday')).toBeInTheDocument()
    expect(screen.getByLabelText('Wednesday')).toBeInTheDocument()
    expect(screen.getByLabelText('Thursday')).toBeInTheDocument()
    expect(screen.getByLabelText('Friday')).toBeInTheDocument()
    expect(screen.getByLabelText('Saturday')).toBeInTheDocument()
    expect(screen.getByLabelText('Sunday')).toBeInTheDocument()
  })

  it('shows day-of-month grid (1–28) for monthly frequency', () => {
    renderStep({ schedule: { frequency: 'monthly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] } })
    for (let day = 1; day <= 28; day++) {
      expect(screen.getByLabelText(`Day ${day}`)).toBeInTheDocument()
    }
    // Should not have day 29+
    expect(screen.queryByLabelText('Day 29')).not.toBeInTheDocument()
  })

  it('calls onUpdate with schedule patch when frequency changes', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderStep()

    await user.click(screen.getByRole('radio', { name: 'Weekly' }))

    expect(onUpdate).toHaveBeenCalledWith({
      schedule: {
        ...DEFAULT_EXPORTER_DRAFT.schedule,
        frequency: 'weekly',
      },
    })
  })

  it('calls onUpdate when weekly days are toggled', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderStep({
      schedule: { frequency: 'weekly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] },
    })

    await user.click(screen.getByLabelText('Monday'))

    expect(onUpdate).toHaveBeenCalledWith({
      schedule: {
        frequency: 'weekly',
        weeklyDays: [true, false, false, false, false, false, false],
        monthlyDays: [],
      },
    })
  })

  it('calls onUpdate when monthly days are toggled on', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderStep({
      schedule: { frequency: 'monthly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] },
    })

    await user.click(screen.getByLabelText('Day 15'))

    expect(onUpdate).toHaveBeenCalledWith({
      schedule: {
        frequency: 'monthly',
        weeklyDays: [false, false, false, false, false, false, false],
        monthlyDays: [15],
      },
    })
  })

  it('calls onUpdate when monthly days are toggled off', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderStep({
      schedule: { frequency: 'monthly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [5, 15] },
    })

    await user.click(screen.getByLabelText('Day 5 selected'))

    expect(onUpdate).toHaveBeenCalledWith({
      schedule: {
        frequency: 'monthly',
        weeklyDays: [false, false, false, false, false, false, false],
        monthlyDays: [15],
      },
    })
  })

  it('shows validation message when no days selected for weekly', () => {
    renderStep({
      schedule: { frequency: 'weekly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] },
    })
    expect(screen.getByText('Select at least one day')).toBeInTheDocument()
  })

  it('hides validation message when a weekly day is selected', () => {
    renderStep({
      schedule: { frequency: 'weekly', weeklyDays: [true, false, false, false, false, false, false], monthlyDays: [] },
    })
    expect(screen.queryByText('Select at least one day')).not.toBeInTheDocument()
  })

  it('shows validation message when no days selected for monthly', () => {
    renderStep({
      schedule: { frequency: 'monthly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [] },
    })
    expect(screen.getByText('Select at least one day')).toBeInTheDocument()
  })

  it('hides validation message when a monthly day is selected', () => {
    renderStep({
      schedule: { frequency: 'monthly', weeklyDays: [false, false, false, false, false, false, false], monthlyDays: [10] },
    })
    expect(screen.queryByText('Select at least one day')).not.toBeInTheDocument()
  })
})
