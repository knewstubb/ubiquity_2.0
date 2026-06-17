import { useState } from 'react'
import { SpinnerInput } from '@/components/ui/spinner-input'

export default function SpinnerInputDemo(props: Record<string, unknown>) {
  const min = (props.min as number) ?? 0
  const max = (props.max as number) ?? 100
  const step = (props.step as number) ?? 1
  const disabled = (props.disabled as boolean) ?? false
  const label = (props.label as string) ?? ''

  const [value, setValue] = useState(2)

  return (
    <div className="w-full max-w-xs">
      <SpinnerInput
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        label={label || undefined}
        placeholder="Enter number..."
      />
    </div>
  )
}
