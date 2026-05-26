import { useState } from 'react'
import { NumberStepper } from '@/components/composed/number-stepper'

interface NumberStepperDemoProps {
  size?: string
  variant?: string
  disabled?: boolean
  'bounds-min'?: number
  'bounds-max'?: number
  'bounds-step'?: number
}

export default function NumberStepperDemo(props: NumberStepperDemoProps) {
  const [value, setValue] = useState(4)

  const size = (props.size ?? 'default') as 'xs' | 'sm' | 'default'
  const variant = (props.variant ?? 'plain') as 'toggle' | 'plain'
  const disabled = props.disabled ?? false
  const min = Number(props['bounds-min'] ?? 0)
  const max = Number(props['bounds-max'] ?? 10)
  const step = Number(props['bounds-step'] ?? 1)

  return (
    <div className="flex items-center justify-center p-8">
      <NumberStepper
        value={value}
        onValueChange={setValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        size={size}
        variant={variant}
      />
    </div>
  )
}
