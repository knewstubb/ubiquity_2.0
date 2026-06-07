import { RadioCard } from '@/components/composed/radio-card'
import { Input } from '@/components/ui/input'

export default function RadioCardDemo(props: Record<string, unknown>) {
  const label = (props.label as string) ?? 'Option one'
  const selected = (props.selected as boolean) ?? true
  const disabled = (props.disabled as boolean) ?? false
  const showChildren = (props['show-children'] as boolean) ?? true

  return (
    <RadioCard label={label} selected={selected} onSelect={() => {}} disabled={disabled}>
      {showChildren && <Input placeholder="Additional input..." />}
    </RadioCard>
  )
}
