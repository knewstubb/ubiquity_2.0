import { type ReactNode } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { CardSelector } from '@/components/composed/card-selector'
import { ModalFooter } from '@/components/composed/modal-footer'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChooserOption {
  id: string
  icon: ReactNode
  label: string
}

export interface ChooserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: ReactNode
  title: string
  description: string
  options: ChooserOption[]
  selectedId: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChooserModal({
  open,
  onOpenChange,
  icon,
  title,
  description,
  options,
  selectedId,
  onSelect,
  onConfirm,
  onCancel,
  confirmLabel = 'Next',
  cancelLabel = 'Cancel',
  confirmDisabled,
}: ChooserModalProps) {
  // Derived
  const gridCols =
    options.length === 2
      ? 'grid-cols-2'
      : options.length === 3
        ? 'grid-cols-3'
        : 'grid-cols-2'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 gap-0">
        {/* Accessible title/description (visually hidden — we render our own) */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>

        {/* Body */}
        <div className="px-8 py-8 text-center">
          {/* Icon */}
          <div className="flex items-center justify-center text-primary [&_svg]:size-20">
            {icon}
          </div>

          {/* Title */}
          <h2 className="mt-4 text-2xl font-bold text-foreground">{title}</h2>

          {/* Description */}
          <p className="mx-auto mt-2 max-w-[320px] text-sm text-muted-foreground">
            {description}
          </p>

          {/* Card selector grid */}
          <div className={cn('mt-8 grid gap-3', gridCols)}>
            {options.map((option) => (
              <CardSelector
                key={option.id}
                icon={option.icon}
                label={option.label}
                selected={selectedId === option.id}
                onClick={() => onSelect(option.id)}
                className="py-6"
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <ModalFooter
          primaryAction={{
            label: confirmLabel,
            onClick: onConfirm,
            disabled: confirmDisabled,
          }}
          secondaryAction={{
            label: cancelLabel,
            onClick: onCancel,
            variant: 'secondaryGhost',
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
