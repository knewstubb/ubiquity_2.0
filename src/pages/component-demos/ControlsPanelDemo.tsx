import { ControlsPanel } from '@/components/component-library/ControlsPanel'
import { useControlValues } from '@/lib/useControlValues'
import type { PropDefinition } from '@/data/componentRegistry'

const SAMPLE_CONTROLS: PropDefinition[] = [
  { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Hello World' },
  { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'primary', options: [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Outline', value: 'outline' },
  ]},
  { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
  { name: 'opacity', label: 'Opacity', controlType: 'range', defaultValue: 100, min: 0, max: 100, step: 5 },
  { name: 'colour', label: 'Colour', controlType: 'colour', defaultValue: '#14B88A' },
  { name: 'count', label: 'Count', controlType: 'counter', defaultValue: 3, min: 0, max: 10, step: 1 },
  { name: 'prefix-url', label: 'URL', controlType: 'prefix-input', defaultValue: 'example.com', prefix: 'https://' },
  { name: 'tags', label: 'Tags', controlType: 'chip-array', defaultValue: ['react', 'typescript'], maxItems: 5 },
  { name: 'step', label: 'Step', controlType: 'button-pair', defaultValue: 0, labels: ['Back', 'Next'], min: 0, max: 4, step: 1 },
]

const SECTIONED_CONTROLS: PropDefinition[] = [
  { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Button', section: 'Content' },
  { name: 'icon', label: 'Show Icon', controlType: 'toggle', defaultValue: false, section: 'Content' },
  { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'primary', section: 'Appearance', options: [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Ghost', value: 'secondaryGhost' },
  ]},
  { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'md', section: 'Appearance', options: [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ]},
  { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false, section: 'State' },
  { name: 'loading', label: 'Loading', controlType: 'toggle', defaultValue: false, section: 'State' },
]

const CONDITIONAL_CONTROLS: PropDefinition[] = [
  { name: 'type', label: 'Type', controlType: 'select', defaultValue: 'text', options: [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Select', value: 'select' },
  ]},
  { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'Enter text...', visibleWhen: { controlName: 'type', values: ['text'] } },
  { name: 'min', label: 'Min', controlType: 'number', defaultValue: 0, min: -100, max: 100, step: 1, visibleWhen: { controlName: 'type', values: ['number'] } },
  { name: 'max', label: 'Max', controlType: 'number', defaultValue: 100, min: -100, max: 1000, step: 1, visibleWhen: { controlName: 'type', values: ['number'] } },
  { name: 'multi', label: 'Multi-select', controlType: 'toggle', defaultValue: false, visibleWhen: { controlName: 'type', values: ['select'] } },
]

const SPACING_MAP: Record<string, string> = {
  '8px': 'space-y-2',
  '12px': 'space-y-3',
  '16px': 'space-y-4',
  '20px': 'space-y-5',
  '24px': 'space-y-6',
}

interface ControlsPanelDemoProps {
  mode?: string
  'show-used-in'?: boolean
  spacing?: string
  'show-dividers'?: boolean
}

export default function ControlsPanelDemo(props: ControlsPanelDemoProps) {
  const mode = (props.mode ?? 'sectioned') as 'all-controls' | 'sectioned' | 'conditional'
  const showUsedIn = props['show-used-in'] ?? true
  const sectionSpacing = SPACING_MAP[props.spacing ?? '16px'] ?? 'space-y-4'
  const showDividers = props['show-dividers'] ?? true

  const controlSet = mode === 'sectioned'
    ? SECTIONED_CONTROLS
    : mode === 'conditional'
      ? CONDITIONAL_CONTROLS
      : SAMPLE_CONTROLS

  const { values, setValue, resetAll, isDirty } = useControlValues(controlSet)

  const usedIn = showUsedIn
    ? [
        { label: 'Component Library', route: '/component-library' },
        { label: 'Button Demo', route: '/component-library/button' },
      ]
    : undefined

  return (
    <div className="flex items-start justify-center w-full h-full p-4">
      <ControlsPanel
        propControls={controlSet}
        values={values}
        onChange={setValue}
        onReset={resetAll}
        isDirty={isDirty}
        usedIn={usedIn}
        sectionSpacing={sectionSpacing}
        showDividers={showDividers}
      />
    </div>
  )
}
