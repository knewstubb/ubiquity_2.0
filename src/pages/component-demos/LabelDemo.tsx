import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface LabelDemoProps {
  text?: string
  required?: boolean
  disabled?: boolean
}

export default function LabelDemo({ text, required, disabled }: LabelDemoProps) {
  const hasControls = text !== undefined

  if (hasControls) {
    return (
      <Label className={cn(disabled && 'opacity-50 cursor-not-allowed')}>
        {text}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <div className="grid gap-2">
        <Label htmlFor="email-label">Email address</Label>
        <Input id="email-label" type="email" placeholder="sarah@example.com" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name-label">Full name</Label>
        <Input id="name-label" placeholder="Sarah Chen" />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms-label" />
        <Label htmlFor="terms-label">I agree to the terms of service</Label>
      </div>
    </div>
  )
}
