import { useState } from 'react'
import { Chip } from '@/components/composed/chip'
import { EnvelopeSimple, Tag, User } from '@phosphor-icons/react'

const SAMPLE_CHIPS = ['Email', 'Customer ID', 'First Name', 'Last Name', 'Phone']

interface ChipDemoProps {
  variant?: string
  size?: string
  'show-icon'?: boolean
  selectable?: boolean
  used?: boolean
  disabled?: boolean
}

export default function ChipDemo(props: ChipDemoProps) {
  const [chips, setChips] = useState(SAMPLE_CHIPS)
  const [selectedChips, setSelectedChips] = useState<string[]>([])

  const hasControls = props.variant !== undefined

  const variant = (props.variant ?? 'default') as 'default' | 'outline' | 'mint' | 'red' | 'insertable'
  const size = (props.size ?? 'default') as 'sm' | 'default'
  const showIcon = props['show-icon'] ?? false
  const selectable = props.selectable ?? false
  const used = props.used ?? false
  const disabled = props.disabled ?? false

  function handleDismiss(chip: string) {
    setChips((prev) => prev.filter((c) => c !== chip))
  }

  function handleSelect(chip: string) {
    if (!selectable) return
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    )
  }

  const iconMap: Record<string, React.ReactNode> = {
    Email: <EnvelopeSimple size={12} />,
    'Customer ID': <Tag size={12} />,
    'First Name': <User size={12} />,
    'Last Name': <User size={12} />,
    Phone: <EnvelopeSimple size={12} />,
  }

  if (hasControls) {
    // Insertable variant — uses onClick, not onDismiss
    if (variant === 'insertable') {
      return (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={`{${chip.toLowerCase().replace(/\s/g, '_')}}`}
              variant="insertable"
              used={used}
              size={size}
              disabled={disabled}
              onClick={() => {}}
            />
          ))}
        </div>
      )
    }

    return (
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="bg-transparent border-none p-0 cursor-pointer"
            onClick={() => handleSelect(chip)}
          >
            <Chip
              label={chip}
              onDismiss={() => handleDismiss(chip)}
              variant={variant}
              size={size}
              selected={selectedChips.includes(chip)}
              disabled={disabled}
              icon={showIcon ? iconMap[chip] : undefined}
            />
          </button>
        ))}
        {chips.length === 0 && (
          <span className="text-sm text-muted-foreground">All chips dismissed</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Default */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Default</h3>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_CHIPS.map((chip) => (
            <Chip key={chip} label={chip} onDismiss={() => {}} />
          ))}
        </div>
      </section>

      {/* Variants */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Chip label="Default" onDismiss={() => {}} variant="default" />
          <Chip label="Outline" onDismiss={() => {}} variant="outline" />
          <Chip label="Mint" onDismiss={() => {}} variant="mint" />
          <Chip label="Red" onDismiss={() => {}} variant="red" />
        </div>
      </section>

      {/* Sizes */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Sizes</h3>
        <div className="flex flex-wrap gap-2">
          <Chip label="Default size" onDismiss={() => {}} size="default" />
          <Chip label="Small size" onDismiss={() => {}} size="sm" />
        </div>
      </section>

      {/* With Icons */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">With Icons</h3>
        <div className="flex flex-wrap gap-2">
          <Chip label="Email" onDismiss={() => {}} icon={<EnvelopeSimple size={12} />} />
          <Chip label="Tag" onDismiss={() => {}} icon={<Tag size={12} />} />
          <Chip label="User" onDismiss={() => {}} icon={<User size={12} />} />
        </div>
      </section>

      {/* Selectable */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Selectable</h3>
        <div className="flex flex-wrap gap-2">
          <Chip label="Selected" onDismiss={() => {}} selected />
          <Chip label="Not selected" onDismiss={() => {}} selected={false} />
        </div>
      </section>

      {/* Disabled */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Disabled</h3>
        <div className="flex flex-wrap gap-2">
          <Chip label="Disabled" onDismiss={() => {}} disabled />
          <Chip label="Disabled Mint" onDismiss={() => {}} disabled variant="mint" />
        </div>
      </section>
    </div>
  )
}
