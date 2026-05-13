import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'

interface InputOTPDemoProps {
  length?: number
  'show-separator'?: boolean
  disabled?: boolean
}

export default function InputOTPDemo({ length, 'show-separator': showSeparator, disabled }: InputOTPDemoProps) {
  const hasControls = length !== undefined

  if (hasControls) {
    const totalSlots = length
    const midpoint = Math.ceil(totalSlots / 2)
    const firstGroup = Array.from({ length: midpoint }, (_, i) => i)
    const secondGroup = Array.from({ length: totalSlots - midpoint }, (_, i) => midpoint + i)

    return (
      <InputOTP maxLength={totalSlots} disabled={disabled}>
        <InputOTPGroup>
          {firstGroup.map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
        {showSeparator && <InputOTPSeparator />}
        <InputOTPGroup>
          {secondGroup.map((i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Enter verification code</p>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to your email.
        </p>
      </div>
    </div>
  )
}
