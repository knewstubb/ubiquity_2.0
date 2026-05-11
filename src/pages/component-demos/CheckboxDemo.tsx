import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function CheckboxDemo() {
  const [checked, setChecked] = useState(true)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
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

      <p className="text-sm text-muted-foreground">
        First checkbox is {checked ? 'checked' : 'unchecked'}
      </p>
    </div>
  )
}
