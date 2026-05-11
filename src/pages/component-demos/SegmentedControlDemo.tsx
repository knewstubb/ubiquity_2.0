import { useState } from 'react'
import { SegmentedControl } from '@/components/composed/segmented-control'

const defaultOptions = [
  { label: 'Contacts', value: 'contacts' },
  { label: 'Transactional', value: 'transactional' },
  { label: 'Combined', value: 'combined' },
  { label: 'Custom', value: 'custom' },
  { label: 'Advanced', value: 'advanced' },
]

interface SegmentedControlDemoProps {
  'option-count'?: number
  'fit-to-text'?: boolean
  'max-width'?: number
  'label-0'?: string
  'label-1'?: string
  'label-2'?: string
  'label-3'?: string
  'label-4'?: string
}

export default function SegmentedControlDemo(props: SegmentedControlDemoProps) {
  const [value, setValue] = useState('contacts')

  const optionCount = props['option-count'] ?? 3
  const fitToText = props['fit-to-text'] ?? false
  const maxWidth = props['max-width'] ?? 100

  const options = Array.from({ length: optionCount }, (_, i) => ({
    label: props[`label-${i}` as keyof SegmentedControlDemoProps] as string ?? defaultOptions[i]?.label ?? `Option ${i + 1}`,
    value: defaultOptions[i]?.value ?? `option-${i}`,
  }))

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full" style={{ maxWidth: `${maxWidth}%` }}>
        <SegmentedControl
          options={options}
          value={value}
          onValueChange={setValue}
          fitToText={fitToText}
        />
      </div>
    </div>
  )
}
