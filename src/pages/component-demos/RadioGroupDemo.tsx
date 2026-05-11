import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export default function RadioGroupDemo() {
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
