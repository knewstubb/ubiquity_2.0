import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface SwitchDemoProps {
  label?: string
  checked?: boolean
  disabled?: boolean
  scale?: number
}

export default function SwitchDemo({ label, checked, disabled, scale }: SwitchDemoProps) {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const hasControls = label !== undefined

  if (hasControls) {
    return (
      <div className="flex items-center gap-3">
        <div style={scale ? { transform: `scale(${scale / 100})`, transformOrigin: 'left center' } : undefined}>
          <Switch checked={checked} disabled={disabled} />
        </div>
        <Label className={disabled ? 'opacity-50' : ''}>{label}</Label>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="email-notifications"
          checked={emailEnabled}
          onCheckedChange={setEmailEnabled}
        />
        <Label htmlFor="email-notifications">Email notifications</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="sms-notifications"
          checked={smsEnabled}
          onCheckedChange={setSmsEnabled}
        />
        <Label htmlFor="sms-notifications">SMS notifications</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="disabled-switch" disabled />
        <Label htmlFor="disabled-switch" className="opacity-50">Disabled</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="disabled-checked" disabled checked />
        <Label htmlFor="disabled-checked" className="opacity-50">Disabled (on)</Label>
      </div>

      <p className="text-sm text-muted-foreground">
        Email: {emailEnabled ? 'On' : 'Off'} · SMS: {smsEnabled ? 'On' : 'Off'}
      </p>
    </div>
  )
}
