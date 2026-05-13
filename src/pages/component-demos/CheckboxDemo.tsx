import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CheckboxDemoProps {
  label?: string
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
}

export default function CheckboxDemo({ label, checked, disabled, indeterminate }: CheckboxDemoProps) {
  const [localChecked, setLocalChecked] = useState(true)
  const hasControls = label !== undefined

  if (hasControls) {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id="controlled"
          checked={indeterminate ? 'indeterminate' : checked}
          disabled={disabled}
        />
        <Label htmlFor="controlled" className={disabled ? 'opacity-50' : ''}>{label}</Label>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={localChecked}
          onCheckedChange={(v) => setLocalChecked(v === true)}
        />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="unchecked" />
        <Label htmlFor="unchecked">Subscribe to newsletter</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled" className="opacity-50">Disabled option</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked" className="opacity-50">Disabled checked</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="indeterminate" checked="indeterminate" />
        <Label htmlFor="indeterminate">Indeterminate state</Label>
      </div>

      <p className="text-sm text-muted-foreground">
        First checkbox is {localChecked ? 'checked' : 'unchecked'}
      </p>
    </div>
  )
}
