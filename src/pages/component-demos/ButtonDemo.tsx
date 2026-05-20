import { Button } from '@/components/ui/button'
import { EnvelopeSimple, Plus, SpinnerGap, Trash, PencilSimple, ArrowRight } from '@phosphor-icons/react'

interface ButtonDemoProps {
  label?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'secondaryOutline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}

export default function ButtonDemo({ label, variant, size, disabled }: ButtonDemoProps) {
  // If controls are active (any prop passed), render just the interactive button
  const hasControls = label !== undefined

  if (hasControls) {
    return (
      <Button variant={variant} size={size} disabled={disabled}>
        {size === 'icon' ? <Plus weight="bold" /> : label}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Variants */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondaryOutline">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Plus weight="bold" /></Button>
        </div>
      </section>

      {/* With Icons */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">With Icons</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button><EnvelopeSimple weight="bold" /> Send Email</Button>
          <Button variant="secondaryOutline"><Plus weight="bold" /> New Campaign</Button>
          <Button variant="destructive"><Trash weight="bold" /> Delete</Button>
          <Button variant="ghost"><PencilSimple weight="bold" /> Edit</Button>
          <Button>Continue <ArrowRight weight="bold" /></Button>
        </div>
      </section>

      {/* Icon Only */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Icon Only</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="icon"><Plus weight="bold" /></Button>
          <Button size="icon" variant="secondaryOutline"><PencilSimple weight="bold" /></Button>
          <Button size="icon" variant="destructive"><Trash weight="bold" /></Button>
          <Button size="icon" variant="ghost"><EnvelopeSimple weight="bold" /></Button>
        </div>
      </section>

      {/* Disabled States */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Disabled</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Primary Disabled</Button>
          <Button variant="secondaryOutline" disabled>Secondary Disabled</Button>
          <Button variant="destructive" disabled>Destructive Disabled</Button>
          <Button variant="ghost" disabled>Ghost Disabled</Button>
        </div>
      </section>

      {/* Loading State */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Loading</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled><SpinnerGap className="animate-spin" weight="bold" /> Loading...</Button>
          <Button variant="secondaryOutline" disabled><SpinnerGap className="animate-spin" weight="bold" /> Saving...</Button>
        </div>
      </section>
    </div>
  )
}
