import { SelectorCard } from '@/components/molecules/selector-card'
import { Input } from '@/components/atoms/input'

export default function RadioCardDemo(props: Record<string, unknown>) {
  const label = (props.label as string) ?? 'Option one'
  const selected = (props.selected as boolean) ?? true
  const disabled = (props.disabled as boolean) ?? false
  const showChildren = (props['show-children'] as boolean) ?? true

  return (
    <SelectorCard variant="radio" label={label} selected={selected} onSelect={() => {}} disabled={disabled}>
      {showChildren && <Input placeholder="Additional input..." />}
    </SelectorCard>
  )
}
