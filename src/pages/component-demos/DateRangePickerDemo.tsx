import { useState } from 'react'
import { DateRangePicker, type DateRangePreset } from '@/components/composed/date-range-picker'
import { useControlValues } from '@/lib/useControlValues'

const SAMPLE_PRESETS: DateRangePreset[] = [
  { label: 'Today', start: '2026-05-22', end: '2026-05-22' },
  { label: 'Current Billing Cycle', start: '2026-04-26', end: '2026-05-25' },
  { label: 'March 2026', start: '2026-02-26', end: '2026-03-25' },
  { label: 'February 2026', start: '2026-01-26', end: '2026-02-25' },
  { label: 'January 2026', start: '2025-12-26', end: '2026-01-25' },
  { label: 'December 2025', start: '2025-11-26', end: '2025-12-25' },
  { label: 'November 2025', start: '2025-10-26', end: '2025-11-25' },
  { label: 'October 2025', start: '2025-09-26', end: '2025-10-25' },
  { label: 'September 2025', start: '2025-08-26', end: '2025-09-25' },
  { label: 'August 2025', start: '2025-07-26', end: '2025-08-25' },
]

export default function DateRangePickerDemo({ controls }: { controls?: Record<string, unknown> }) {
  const values = useControlValues(controls)
  const showPresets = (values['showPresets'] as boolean) ?? true
  const presetCount = (values['presetCount'] as number) ?? 5

  const [startDate, setStartDate] = useState('2026-04-26')
  const [endDate, setEndDate] = useState('2026-05-25')

  const presets = showPresets ? SAMPLE_PRESETS.slice(0, presetCount) : []

  return (
    <div className="flex items-start justify-center p-8">
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        presets={presets}
      />
    </div>
  )
}
