import { useState } from 'react'
import { SegmentedToggle } from '@/components/ui/segmented-toggle'

interface SegmentedToggleDemoProps {
  'label-left'?: string
  'label-right'?: string
  'max-width'?: number
  disabled?: boolean
}

export default function SegmentedToggleDemo(props: SegmentedToggleDemoProps) {
  const [value, setValue] = useState('option-a')

  const labelLeft = props['label-left'] || 'Create new'
  const labelRight = props['label-right'] || 'Skip missing'
  const maxWidth = props['max-width'] ?? 100
  const disabled = props.disabled ?? false

  const options: [{ value: string; label: string }, { value: string; label: string }] = [
    { value: 'option-a', label: labelLeft },
    { value: 'option-b', label: labelRight },
  ]

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full" style={{ maxWidth: `${maxWidth}%` }}>
        <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
          <SegmentedToggle
            value={value}
            onValueChange={setValue}
            options={options}
          />
        </div>
      </div>
    </div>
  )
}
