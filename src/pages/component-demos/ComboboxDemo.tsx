import { useState } from 'react'
import { Combobox } from '@/components/ui/combobox'

/* ── Types ── */

interface ComboboxDemoProps {
  placeholder?: string
  status?: 'normal' | 'warning' | 'error'
  disabled?: boolean
}

/* ── Sample data ── */

const sampleOptions = [
  { value: 'customer_id', label: 'customer_id' },
  { value: 'email_address', label: 'email_address' },
  { value: 'first_name', label: 'first_name' },
  { value: 'last_name', label: 'last_name' },
  { value: 'phone', label: 'phone' },
  { value: 'membership_tier', label: 'membership_tier' },
  { value: 'join_date', label: 'join_date' },
]

/* ── Component ── */

export default function ComboboxDemo({
  placeholder = 'Select a field…',
  status = 'normal',
  disabled = false,
}: ComboboxDemoProps) {
  const [controlledValue, setControlledValue] = useState('')

  // When controls are present (hasControls pattern), render a single interactive Combobox
  const hasControls = placeholder !== undefined

  if (hasControls) {
    return (
      <div className="w-64">
        <Combobox
          value={controlledValue}
          onValueChange={setControlledValue}
          options={sampleOptions}
          placeholder={placeholder}
          status={status}
          disabled={disabled}
        />
      </div>
    )
  }

  // Fallback: show examples of various states
  return <ComboboxExamples />
}

/* ── Examples (no controls) ── */

function ComboboxExamples() {
  const [val1, setVal1] = useState('')
  const [val2, setVal2] = useState('email_address')
  const [val3, setVal3] = useState('')
  const [val4, setVal4] = useState('')

  return (
    <div className="flex flex-col gap-6 w-64">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Default</span>
        <Combobox
          value={val1}
          onValueChange={setVal1}
          options={sampleOptions}
          placeholder="Select a field…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">With value selected</span>
        <Combobox
          value={val2}
          onValueChange={setVal2}
          options={sampleOptions}
          placeholder="Select a field…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Warning status</span>
        <Combobox
          value={val3}
          onValueChange={setVal3}
          options={sampleOptions}
          placeholder="no match found"
          status="warning"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Error status</span>
        <Combobox
          value={val4}
          onValueChange={setVal4}
          options={sampleOptions}
          placeholder="Select a field…"
          status="error"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Disabled</span>
        <Combobox
          value=""
          onValueChange={() => {}}
          options={sampleOptions}
          placeholder="Select a field…"
          disabled
        />
      </div>
    </div>
  )
}
