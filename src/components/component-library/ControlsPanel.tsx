import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { isVisible } from '@/lib/useControlValues'
import { Button } from '@/components/ui/button'
import { TextControl } from './controls/TextControl'
import { TextareaControl } from './controls/TextareaControl'
import { SelectControl } from './controls/SelectControl'
import { ToggleControl } from './controls/ToggleControl'
import { ColourControl } from './controls/ColourControl'
import { NumberControl } from './controls/NumberControl'
import { RangeControl } from './controls/RangeControl'
import { PrefixInputControl } from './controls/PrefixInputControl'
import { ChipArrayControl } from './controls/ChipArrayControl'
import { ButtonPairControl } from './controls/ButtonPairControl'
import { CounterControl } from './controls/CounterControl'
import type { PropDefinition, UsedInLink, ControlValue } from '@/data/componentRegistry'

export interface SectionGroup {
  section: string | null
  controls: PropDefinition[]
}

/**
 * Groups PropDefinitions by their `section` property.
 * - Ungrouped controls (no section) appear first, in declaration order.
 * - Sectioned groups appear in first-occurrence order.
 * - Controls within each group preserve their relative declaration order.
 * - Section strings exceeding 40 characters are truncated.
 */
export function groupBySection(propControls: PropDefinition[]): SectionGroup[] {
  const ungrouped: PropDefinition[] = []
  const sectionMap = new Map<string, PropDefinition[]>()
  const sectionOrder: string[] = []

  for (const ctrl of propControls) {
    if (!ctrl.section) {
      ungrouped.push(ctrl)
    } else {
      const sectionKey = ctrl.section.length > 40
        ? ctrl.section.slice(0, 40)
        : ctrl.section

      if (sectionMap.has(sectionKey)) {
        sectionMap.get(sectionKey)!.push(ctrl)
      } else {
        sectionMap.set(sectionKey, [ctrl])
        sectionOrder.push(sectionKey)
      }
    }
  }

  const groups: SectionGroup[] = []

  if (ungrouped.length > 0) {
    groups.push({ section: null, controls: ungrouped })
  }

  for (const section of sectionOrder) {
    groups.push({ section, controls: sectionMap.get(section)! })
  }

  return groups
}

interface ControlsPanelProps {
  propControls: PropDefinition[]
  values: Record<string, ControlValue>
  onChange: (name: string, value: ControlValue) => void
  onReset: () => void
  isDirty: boolean
  usedIn?: UsedInLink[]
  renderControls?: (
    values: Record<string, ControlValue>,
    setValue: (name: string, value: ControlValue) => void
  ) => ReactNode
  /** Gap between sections — defaults to 'space-y-4' */
  sectionSpacing?: string
  /** Whether to show horizontal dividers between sections */
  showDividers?: boolean
}

export function ControlsPanel({
  propControls,
  values,
  onChange,
  onReset,
  isDirty,
  usedIn,
  renderControls,
  sectionSpacing = 'space-y-4',
  showDividers = true,
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
            hideLabel={!!prop.visibleWhen}
          />
        )
      case 'textarea':
        return (
          <TextareaControl
            key={prop.name}
            label={prop.label}
            value={value as string}
            onChange={(v) => onChange(prop.name, v)}
            hideLabel={!!prop.visibleWhen}
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
            inline={!!prop.section}
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
          <SelectControl
            key={prop.name}
            label={prop.label}
            value={value as string}
            onChange={(v) => onChange(prop.name, v)}
            options={prop.options ?? []}
          />
        )
      case 'prefix-input':
        return (
          <PrefixInputControl
            key={prop.name}
            label={prop.label}
            value={value as string}
            onChange={(v) => onChange(prop.name, v)}
            prefix={prop.prefix ?? ''}
          />
        )
      case 'chip-array':
        return (
          <ChipArrayControl
            key={prop.name}
            label={prop.label}
            value={value as string[]}
            onChange={(v) => onChange(prop.name, v)}
            maxItems={prop.maxItems ?? 10}
          />
        )
      case 'button-pair':
        return (
          <ButtonPairControl
            key={prop.name}
            label={prop.label}
            value={value as number | string}
            onChange={(v) => onChange(prop.name, v)}
            labels={prop.labels ?? ['−', '+']}
            min={prop.min}
            max={prop.max}
            step={prop.step}
            options={prop.options?.map(o => o.value)}
          />
        )
      case 'counter':
        return (
          <CounterControl
            key={prop.name}
            label={prop.label}
            value={value as number}
            onChange={(v) => onChange(prop.name, v)}
            min={prop.min ?? 0}
            max={prop.max ?? 100}
            step={prop.step ?? 1}
          />
        )
      default:
        return null
    }
  }

  const sections = groupBySection(propControls)

  // "General" header rule:
  // - If all controls are ungrouped (no named sections), don't show any header
  // - If there are named sections, show "General" for the first ungrouped group only
  const hasNamedSections = sections.some((g) => g.section !== null)

  const hasTextInput = propControls.some(
    (p) => p.controlType === 'text' || p.controlType === 'textarea' || p.controlType === 'prefix-input'
  )
  const panelWidth = hasTextInput ? 'w-64' : 'w-56'

  const customSlot = renderControls ? renderControls(values, onChange) : null

  return (
    <div className={cn("shrink-0 bg-secondary rounded-lg p-4", panelWidth)}>
      {/* Controls — grouped by section */}
      <div className={sectionSpacing}>
        {sections.map((group, groupIndex) => (
          <div key={group.section ?? `ungrouped-${groupIndex}`} className={cn(groupIndex > 0 && showDividers && 'pt-3 mt-3 border-t border-border')}>
            {/* Show section header: named sections always, "General" only when other named sections exist */}
            {(group.section !== null || (group.section === null && hasNamedSections)) && (
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {group.section ?? 'General'}
              </h4>
            )}
            <div className="space-y-2">
              {group.controls
                .filter((prop) => isVisible(prop, values, propControls))
                .map((prop) => renderControl(prop))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom render slot */}
      {customSlot != null && (
        <div className="space-y-4 pt-3 border-t border-border mt-3">
          {customSlot}
        </div>
      )}

      {/* View in context */}
      {usedIn && usedIn.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Used in</span>
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

      {/* Reset button — always visible, disabled when clean */}
      <div className="mt-3 pt-3 border-t border-border">
        <Button
          variant="secondary"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={onReset}
          disabled={!isDirty}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
