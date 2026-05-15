import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Chip } from '@/components/composed/chip'
import { MagnifyingGlass, EnvelopeSimple, WarningCircle, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'default' | 'lg'
type ValidationState = 'none' | 'error' | 'success'

const SIZE_CLASSES = {
  sm: 'h-8',
  default: 'h-9',
  lg: 'h-10',
}

interface InputDemoProps {
  placeholder?: string
  size?: string
  prefix?: string
  suffix?: string
  'leading-icon'?: boolean
  'trailing-icon'?: boolean
  chips?: boolean
  disabled?: boolean
  'read-only'?: boolean
  'validation-state'?: string
  'validation-message'?: string
}

export default function InputDemo(props: InputDemoProps) {
  const [chipValues, setChipValues] = useState(['Tag 1', 'Tag 2'])

  // Determine if controls are active (props passed from panel)
  const hasControls = props.placeholder !== undefined

  // Use props from controls panel when active, otherwise use defaults for showcase
  const placeholder = props.placeholder ?? 'Enter value…'
  const size = (props.size ?? 'default') as Size
  const prefix = props.prefix ?? ''
  const suffix = props.suffix ?? ''
  const leadingIcon = props['leading-icon'] ?? false
  const trailingIcon = props['trailing-icon'] ?? false
  const showChips = props.chips ?? false
  const disabled = props.disabled ?? false
  const readOnly = props['read-only'] ?? false
  const validationState = (props['validation-state'] ?? 'none') as ValidationState
  const validationMessage = props['validation-message'] ?? ''

  const hasPrefix = !!prefix
  const hasSuffix = !!suffix
  const isError = validationState === 'error'
  const isSuccess = validationState === 'success'
  const hasValidation = validationState !== 'none' && !!validationMessage

  // Reset chips when the chips toggle is turned on
  function handleDismissChip(chip: string) {
    setChipValues((prev) => prev.filter((c) => c !== chip))
  }

  // If controls are active, render just the interactive preview
  if (hasControls) {
    return (
      <div className="w-full max-w-sm space-y-1.5">
        <Label htmlFor="controlled-input" className={cn(isError && 'text-destructive')}>
          Field Label
        </Label>
        <div
          className={cn(
            'flex items-center w-full rounded-md border bg-background transition-colors overflow-hidden',
            'not-focus-within:hover:border-border-strong',
            'focus-within:border-ring focus-within:shadow-[--ring-shadow]',
            SIZE_CLASSES[size],
            isError && 'border-destructive hover:border-destructive focus-within:border-destructive focus-within:shadow-[--ring-shadow-destructive]',
            isSuccess && 'border-success hover:border-success focus-within:border-success focus-within:shadow-[--ring-shadow]',
            !isError && !isSuccess && 'border-input',
            disabled && 'opacity-50 cursor-not-allowed not-focus-within:hover:border-input',
          )}
        >
          {/* Prefix */}
          {hasPrefix && (
            <span className="shrink-0 text-muted-foreground text-sm select-none bg-secondary px-3 self-stretch flex items-center border-r border-input">{prefix}</span>
          )}

          {/* Leading icon */}
          {leadingIcon && (
            <span className="shrink-0 text-muted-foreground pl-3">
              <MagnifyingGlass size={16} />
            </span>
          )}

          {/* Chips */}
          {showChips && chipValues.length > 0 && (
            <div className="flex items-center gap-1 shrink-0 pl-2">
              {chipValues.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  size="sm"
                  onDismiss={() => handleDismissChip(chip)}
                />
              ))}
            </div>
          )}

          {/* Input */}
          <input
            id="controlled-input"
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              'flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground',
              'text-foreground px-3 py-0 text-sm',
              disabled && 'cursor-not-allowed',
            )}
          />

          {/* Trailing icon */}
          {trailingIcon && (
            <span className="shrink-0 text-muted-foreground pr-3">
              <EnvelopeSimple size={16} />
            </span>
          )}

          {/* Suffix */}
          {hasSuffix && (
            <span className="shrink-0 text-muted-foreground text-sm select-none bg-secondary px-3 self-stretch flex items-center border-l border-input">{suffix}</span>
          )}
        </div>

        {/* Validation message */}
        {hasValidation && (
          <div className={cn(
            'flex items-center gap-1 text-xs',
            isError && 'text-destructive',
            isSuccess && 'text-success',
          )}>
            {isError && <WarningCircle size={14} weight="fill" />}
            {isSuccess && <CheckCircle size={14} weight="fill" />}
            <span>{validationMessage}</span>
          </div>
        )}
      </div>
    )
  }

  // Full showcase when no controls are active
  return (
    <div className="flex flex-col gap-8 w-full max-w-lg">
      {/* Default */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Default</h3>
        <div className="space-y-1.5">
          <Label htmlFor="demo-default">Email</Label>
          <div className="flex items-center w-full rounded-md border border-input bg-background h-10 overflow-hidden focus-within:border-ring focus-within:shadow-[--ring-shadow]">
            <input
              id="demo-default"
              type="text"
              placeholder="Enter your email..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-sm"
            />
          </div>
        </div>
      </section>

      {/* With Icons */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">With Icons</h3>
        <div className="space-y-1.5">
          <Label htmlFor="demo-icons">Search</Label>
          <div className="flex items-center w-full rounded-md border border-input bg-background h-10 overflow-hidden focus-within:border-ring focus-within:shadow-[--ring-shadow]">
            <span className="shrink-0 text-muted-foreground pl-3">
              <MagnifyingGlass size={16} />
            </span>
            <input
              id="demo-icons"
              type="text"
              placeholder="Search..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-sm"
            />
            <span className="shrink-0 text-muted-foreground pr-3">
              <EnvelopeSimple size={16} />
            </span>
          </div>
        </div>
      </section>

      {/* With Prefix/Suffix */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Prefix & Suffix</h3>
        <div className="space-y-1.5">
          <Label htmlFor="demo-prefix">Website</Label>
          <div className="flex items-center w-full rounded-md border border-input bg-background h-10 overflow-hidden focus-within:border-ring focus-within:shadow-[--ring-shadow]">
            <span className="shrink-0 text-muted-foreground text-sm select-none bg-secondary px-3 self-stretch flex items-center border-r border-input">https://</span>
            <input
              id="demo-prefix"
              type="text"
              placeholder="example.com"
              className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-sm"
            />
            <span className="shrink-0 text-muted-foreground text-sm select-none bg-secondary px-3 self-stretch flex items-center border-l border-input">.co.nz</span>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Sizes</h3>
        <div className="space-y-3">
          <div className="flex items-center w-full rounded-md border border-input bg-background h-8 overflow-hidden focus-within:border-ring focus-within:shadow-[--ring-shadow]">
            <input type="text" placeholder="Small" className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-xs" />
          </div>
          <div className="flex items-center w-full rounded-md border border-input bg-background h-10 overflow-hidden focus-within:border-ring focus-within:shadow-[--ring-shadow]">
            <input type="text" placeholder="Default" className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-sm" />
          </div>
          <div className="flex items-center w-full rounded-md border border-input bg-background h-12 overflow-hidden focus-within:border-ring focus-within:shadow-[--ring-shadow]">
            <input type="text" placeholder="Large" className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-base" />
          </div>
        </div>
      </section>

      {/* Validation States */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Validation</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-destructive">Error state</Label>
            <div className="flex items-center w-full rounded-md border border-destructive bg-background h-10 overflow-hidden">
              <input type="text" placeholder="Invalid input" className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-sm" />
            </div>
            <div className="flex items-center gap-1 text-xs text-destructive">
              <WarningCircle size={14} weight="fill" />
              <span>This field is required.</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Success state</Label>
            <div className="flex items-center w-full rounded-md border border-success bg-background h-10 overflow-hidden">
              <input type="text" defaultValue="Valid input" className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-sm" />
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <CheckCircle size={14} weight="fill" />
              <span>Looks good!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disabled */}
      <section className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-foreground">Disabled</h3>
        <div className="flex items-center w-full rounded-md border border-input bg-background h-10 overflow-hidden opacity-50 cursor-not-allowed">
          <input type="text" placeholder="Disabled input" disabled className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground px-3 py-0 text-sm cursor-not-allowed" />
        </div>
      </section>
    </div>
  )
}
