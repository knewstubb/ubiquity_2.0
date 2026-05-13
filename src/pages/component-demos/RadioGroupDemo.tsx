import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface RadioGroupDemoProps {
  'option-count'?: number
  orientation?: string
  disabled?: boolean
}

export default function RadioGroupDemo(props: RadioGroupDemoProps) {
  const optionCount = props['option-count']
  const orientation = props.orientation
  const disabled = props.disabled

  const hasControls = optionCount !== undefined

  if (hasControls) {
    const options = Array.from({ length: optionCount }, (_, i) => ({
      value: `option-${i + 1}`,
      label: `Option ${i + 1}`,
      id: `radio-${i + 1}`,
    }))

    return (
      <RadioGroup
        defaultValue="option-1"
        disabled={disabled}
        className={orientation === 'horizontal' ? 'flex flex-row gap-4' : 'flex flex-col gap-2'}
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={opt.id} />
            <Label htmlFor={opt.id} className={disabled ? 'opacity-50' : ''}>{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <p className="text-sm font-medium">Select a notification preference:</p>
        <RadioGroup defaultValue="email">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="r1" />
            <Label htmlFor="r1">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sms" id="r2" />
            <Label htmlFor="r2">SMS notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="push" id="r3" />
            <Label htmlFor="r3">Push notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="r4" disabled />
            <Label htmlFor="r4" className="opacity-50">None (disabled)</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
