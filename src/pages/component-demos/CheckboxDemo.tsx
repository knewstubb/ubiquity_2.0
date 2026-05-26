import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { CheckedState } from '@radix-ui/react-checkbox'

interface CheckboxDemoProps {
  label?: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  indeterminate?: boolean
}

export default function CheckboxDemo({ label, variant, disabled, indeterminate }: CheckboxDemoProps) {
  const [checked, setChecked] = useState<CheckedState>(false)
  const hasControls = label !== undefined

  if (hasControls) {
    const displayState: CheckedState = indeterminate ? 'indeterminate' : checked

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id="controlled"
          variant={variant ?? 'primary'}
          checked={displayState}
          onCheckedChange={(v) => {
            if (!indeterminate) setChecked(v)
          }}
          disabled={disabled}
        />
        <Label htmlFor="controlled" className={cn('text-foreground', disabled && 'opacity-50')}>{label}</Label>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Primary</p>
        <div className="flex items-center space-x-2">
          <Checkbox id="primary-unchecked" variant="primary" />
          <Label htmlFor="primary-unchecked" className="text-foreground">Unchecked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="primary-checked" variant="primary" defaultChecked />
          <Label htmlFor="primary-checked" className="text-foreground">Checked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="primary-indeterminate" variant="primary" checked="indeterminate" />
          <Label htmlFor="primary-indeterminate" className="text-foreground">Indeterminate</Label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Secondary</p>
        <div className="flex items-center space-x-2">
          <Checkbox id="secondary-unchecked" variant="secondary" />
          <Label htmlFor="secondary-unchecked" className="text-foreground">Unchecked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="secondary-checked" variant="secondary" defaultChecked />
          <Label htmlFor="secondary-checked" className="text-foreground">Checked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="secondary-indeterminate" variant="secondary" checked="indeterminate" />
          <Label htmlFor="secondary-indeterminate" className="text-foreground">Indeterminate</Label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Disabled</p>
        <div className="flex items-center space-x-2">
          <Checkbox id="disabled" disabled />
          <Label htmlFor="disabled" className="text-foreground opacity-50">Disabled unchecked</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="disabled-checked" disabled defaultChecked />
          <Label htmlFor="disabled-checked" className="text-foreground opacity-50">Disabled checked</Label>
        </div>
      </div>
    </div>
  )
}
