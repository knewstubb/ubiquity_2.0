import { Link } from 'react-router-dom'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { TextControl } from './controls/TextControl'
import { SelectControl } from './controls/SelectControl'
import { ToggleControl } from './controls/ToggleControl'
import { ColourControl } from './controls/ColourControl'
import { NumberControl } from './controls/NumberControl'
import { RangeControl } from './controls/RangeControl'
import { RadioControl } from './controls/RadioControl'
import type { PropDefinition, UsedInLink } from '../../data/componentRegistry'

interface ControlsPanelProps {
  propControls: PropDefinition[]
  values: Record<string, string | number | boolean>
  onChange: (name: string, value: string | number | boolean) => void
  onReset: () => void
  isDirty: boolean
  usedIn?: UsedInLink[]
}

export function ControlsPanel({
  propControls,
  values,
  onChange,
  onReset,
  isDirty,
  usedIn,
}: ControlsPanelProps) {
  function renderControl(prop: PropDefinition) {
    const value = values[prop.name]

    switch (prop.controlType) {
      case 'text':
        return (
          <TextControl
            key={prop.name}
            label={prop.label}
            value={value as string}
            onChange={(v) => onChange(prop.name, v)}
          />
        )
      case 'select':
        return (
          <SelectControl
            key={prop.name}
            label={prop.label}
            value={value as string}
            onChange={(v) => onChange(prop.name, v)}
            options={prop.options ?? []}
          />
        )
      case 'toggle':
        return (
          <ToggleControl
            key={prop.name}
            label={prop.label}
            value={value as boolean}
            onChange={(v) => onChange(prop.name, v)}
          />
        )
      case 'colour':
        return (
          <ColourControl
            key={prop.name}
            label={prop.label}
            value={value as string}
            onChange={(v) => onChange(prop.name, v)}
          />
        )
      case 'number':
        return (
          <NumberControl
            key={prop.name}
            label={prop.label}
            value={value as number}
            onChange={(v) => onChange(prop.name, v)}
            min={prop.min}
            max={prop.max}
            step={prop.step}
          />
        )
      case 'range':
        return (
          <RangeControl
            key={prop.name}
            label={prop.label}
            value={value as number}
            onChange={(v) => onChange(prop.name, v)}
            min={prop.min}
            max={prop.max}
            step={prop.step}
          />
        )
      case 'radio':
        return (
          <RadioControl
            key={prop.name}
            label={prop.label}
            value={value as string}
            onChange={(v) => onChange(prop.name, v)}
            options={prop.options ?? []}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'border border-border rounded-lg bg-muted/30 p-3',
        'overflow-y-auto max-h-[300px]'
      )}
    >
      {/* Header with Reset */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Controls</h3>
        {isDirty && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>

      {/* Controls — compact 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {propControls.map((prop) => renderControl(prop))}
      </div>

      {/* View in context */}
      {usedIn && usedIn.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground">Used in:</span>
            {usedIn.map((link) => (
              <Link
                key={link.route}
                to={link.route}
                className={cn(
                  'inline-flex items-center gap-1 text-xs text-primary',
                  'hover:underline'
                )}
              >
                <ArrowSquareOut size={12} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
