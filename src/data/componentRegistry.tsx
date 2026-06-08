import { lazy, type LazyExoticComponent, type ComponentType, type ReactNode } from 'react'
import { DownloadSimple, UploadSimple, CloudArrowUp, Folder, Database, Globe, Lightning, Gear } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export type ComponentCategory = 'tokens' | 'atoms' | 'inputs' | 'display' | 'feedback' | 'navigation' | 'compositions' | 'sandboxes'

export type ControlType =
  | 'text' | 'textarea' | 'select' | 'toggle' | 'colour' | 'number' | 'range' | 'radio'
  | 'prefix-input' | 'chip-array' | 'button-pair' | 'counter'

export type ControlValue = string | number | boolean | string[]

export interface PropOption {
  label: string
  value: string
}

export interface VisibleWhenCondition {
  controlName: string
  values: (string | number | boolean)[]
}

export interface PropDefinition {
  name: string
  label: string
  controlType: ControlType
  defaultValue: string | number | boolean | string[]
  options?: PropOption[]
  min?: number
  max?: number
  step?: number
  section?: string
  visibleWhen?: VisibleWhenCondition
  prefix?: string
  labels?: [string, string]
  maxItems?: number
  /** For counter controls: 'active' shows green circle when value > min */
  variant?: 'default' | 'active'
}

export interface UsedInLink {
  label: string
  route: string
}

export interface DesignGuidanceSection {
  heading: string
  content: string | string[]
}

export interface ComponentEntry {
  name: string
  slug: string
  category: ComponentCategory
  description: string
  searchTerms?: string[]
  component: LazyExoticComponent<ComponentType>
  propControls?: PropDefinition[]
  usesComponents?: string[]
  usedIn?: UsedInLink[]
  renderControls?: (
    values: Record<string, ControlValue>,
    setValue: (name: string, value: ControlValue) => void
  ) => ReactNode
  designGuidance?: DesignGuidanceSection[]
  /** When 'full-bleed', the demo fills the preview area with no padding/border/centering */
  demoLayout?: 'default' | 'full-bleed'
}

export const componentRegistry: ComponentEntry[] = [
  // Tokens (design token sub-pages)
  {
    name: 'Colours',
    slug: 'colours',
    category: 'tokens',
    description: 'Semantic colour tokens, palettes, and status colours with dark mode support.',
    searchTerms: ['palette', 'theme', 'color system', 'brand colours', 'tokens', 'swatches', 'hues'],
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Typography',
    slug: 'typography',
    category: 'tokens',
    description: 'Font families, sizes, weights, and text styles used across the system.',
    searchTerms: ['fonts', 'text styles', 'headings', 'type scale', 'font size', 'line height', 'weight'],
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Shadows',
    slug: 'shadows',
    category: 'tokens',
    description: 'Elevation levels using Tailwind shadow utilities.',
    searchTerms: ['elevation', 'depth', 'drop shadow', 'box shadow', 'layers'],
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Spacing',
    slug: 'spacing',
    category: 'tokens',
    description: 'Spacing scale mapped to Tailwind gap/space-y classes with usage context.',
    searchTerms: ['gap', 'padding', 'margin', 'whitespace', 'layout spacing', 'grid gap'],
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Radius',
    slug: 'radius',
    category: 'tokens',
    description: 'Border radius tokens for corners and rounded elements.',
    searchTerms: ['rounded', 'border radius', 'corner radius', 'curves'],
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Sizing & Borders',
    slug: 'sizing',
    category: 'tokens',
    description: 'Component heights, container widths, and semantic border colours.',
    searchTerms: ['height', 'width', 'border colour', 'container size', 'dimensions'],
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Icons',
    slug: 'icons',
    category: 'tokens',
    description: 'Phosphor icon library browser with search and category filtering.',
    searchTerms: ['phosphor', 'icon set', 'glyphs', 'symbols', 'icon search'],
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },

  // Inputs
  {
    name: 'Button',
    slug: 'shadcn-button',
    category: 'inputs',
    description: 'Accessible button with variants: default, destructive, destructiveOutline, outline, secondary, secondaryOutline, ghost, link.',
    searchTerms: ['action', 'click', 'submit', 'cta', 'primary action', 'trigger'],
    component: lazy(() => import('../pages/component-demos/ButtonDemo')),
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Click me' },
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Destructive Outline', value: 'destructiveOutline' },
        { label: 'Outline', value: 'outline' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Secondary Outline', value: 'secondaryOutline' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Link', value: 'link' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Compact (h-8 / 32px)', value: 'sm' },
        { label: 'Default (h-9 / 36px)', value: 'default' },
        { label: 'Large (h-10 / 40px)', value: 'lg' },
        { label: 'Icon (h-9 / 36px)', value: 'icon' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    usedIn: [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Campaigns', route: '/automations/campaigns' },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'Any clickable action that is not a navigation link',
        'Form submissions, modal triggers, toolbar actions, inline actions',
      ]},
      { heading: 'When NOT to use', content: [
        'Navigation between pages — use a Link or anchor instead (or Button with asChild wrapping a Link)',
        'Toggle states — use a Toggle or SegmentedControl',
      ]},
      { heading: 'States', content: [
        'default (teal solid): Primary CTA — one per section max',
        'destructive (red solid): Irreversible or dangerous actions (delete, remove)',
        'destructiveOutline (red border): Secondary destructive — inline remove buttons',
        'outline (teal border): Prominent secondary — "Add new", "Export"',
        'secondary (dark solid): Strong secondary alongside a primary',
        'secondaryOutline (border-strong): Low-emphasis — cancel, filter toggles, toolbar actions',
        'ghost (no bg until hover): Minimal — icon-only buttons, inline actions',
        'link (underline on hover): Inline text links styled as buttons',
        'Disabled: stripped colour with uniform opacity across all variants',
        'Active: solid variants use scale-95 press, outline uses translate-y-px',
      ]},
      { heading: 'Accessibility', content: [
        'Uses Radix Slot for polymorphic rendering via asChild',
        'Supports aria-label for icon-only buttons',
        'Focus-visible ring for keyboard navigation',
      ]},
    ],
  },
  {
    name: 'Close Button',
    slug: 'close-button',
    category: 'atoms',
    description: 'Accessible close/dismiss button with size variants, used for modals, panels, banners, and dialogs.',
    searchTerms: ['dismiss', 'x button', 'close icon', 'exit', 'remove'],
    component: lazy(() => import('../pages/component-demos/CloseButtonDemo')),
    propControls: [
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Extra Small (20px)', value: 'xs' },
        { label: 'Small (24px)', value: 'sm' },
        { label: 'Default (28px)', value: 'default' },
        { label: 'Large (32px)', value: 'lg' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
      { name: 'ariaLabel', label: 'Aria Label', controlType: 'text', defaultValue: 'Close' },
    ],
    usesComponents: [],
    usedIn: [
      { label: 'Sheet', route: '/admin/components/feedback/sheet' },
      { label: 'AlertDialog', route: '/admin/components/feedback/alert-dialog' },
      { label: 'Modal', route: '/admin/components/feedback/modal' },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'Dismissing containers: modals, sheets, panels, banners, toasts',
        'Position with className (e.g. "absolute right-4 top-4") — no built-in positioning',
      ]},
      { heading: 'When NOT to use', content: [
        'Chip remove buttons or field clear buttons — different semantics',
        '"Cancel" actions that need a visible label — use Button variant="ghost" instead',
      ]},
      { heading: 'States', content: [
        'xs (20×20px, 14px icon): Compact inline banners, dense UI',
        'sm (24×24px, 16px icon): Modal headers via ModalHeader component',
        'default (28×28px, 18px icon): Standard panels, sheets, validation summaries',
        'lg (32×32px, 22px icon): Large modals, slide-out panels',
        'Disabled: muted, no interaction',
        'Hover: background accent for affordance',
      ]},
    ],
  },
  {
    name: 'Calendar',
    slug: 'calendar',
    category: 'inputs',
    description: 'Date picker calendar grid with month navigation.',
    searchTerms: ['date picker', 'date selector', 'month view', 'day selection', 'schedule'],
    usesComponents: ['Button'],
    component: lazy(() => import('../pages/component-demos/CalendarDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Date selection in forms — single date or date range',
        'Scheduling interfaces where users pick specific days',
        'Filtering by date in reports or data views',
      ]},
      { heading: 'When NOT to use', content: [
        'Selecting a relative time period (e.g. "Last 7 days") — use DateRangePicker with presets instead',
        'Time-only selection — use a time input',
        'Day-of-week recurring selection — use DayPicker instead',
      ]},
      { heading: 'States', content: [
        'Default: neutral grid with hover highlights',
        'Selected (single): filled primary circle on chosen date',
        'Selected (range): filled endpoints with accent background span',
        'Today: subtle ring indicator',
        'Disabled dates: muted text, no pointer events',
      ]},
    ],
    propControls: [
      { name: 'mode', label: 'Mode', controlType: 'select', defaultValue: 'single', options: [
        { label: 'Single', value: 'single' },
        { label: 'Range', value: 'range' },
      ]},
      { name: 'caption-layout', label: 'Caption Layout', controlType: 'select', defaultValue: 'label', options: [
        { label: 'Label', value: 'label' },
        { label: 'Dropdown', value: 'dropdown' },
      ]},
      { name: 'months', label: 'Months', controlType: 'counter', defaultValue: 1, min: 1, max: 3 },
    ],
  },
  {
    name: 'Checkbox',
    slug: 'shadcn-checkbox',
    category: 'inputs',
    description: 'Accessible checkbox with indeterminate state support.',
    searchTerms: ['tick', 'check', 'boolean', 'multi select', 'checkmark', 'agree'],
    usesComponents: ['Label'],
    component: lazy(() => import('../pages/component-demos/CheckboxDemo')),
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Accept terms and conditions' },
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'primary', options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
      { name: 'indeterminate', label: 'Indeterminate', controlType: 'toggle', defaultValue: false },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'Binary choices in forms (agree/disagree, opt-in/out)',
        'Multi-select lists where items can be toggled independently',
        'Bulk selection controls (select all / partial selection)',
      ]},
      { heading: 'When NOT to use', content: [
        'Mutually exclusive choices — use Radio Group instead',
        'Toggling a live setting on/off — use Switch instead',
        'Single binary action with immediate effect — use Switch instead',
      ]},
      { heading: 'States', content: [
        'Checked: filled primary background with checkmark icon',
        'Unchecked: empty border, clickable',
        'Indeterminate: bold minus icon — used for partial "select all" states',
        'Disabled: reduced opacity, no pointer events',
        'primary variant: teal border and fill — standard form checkboxes, filters',
        'secondary variant: dark neutral border and fill — destructive dialogs, table header select-all',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix UI Checkbox primitive with full keyboard support',
        'Always pair with a Label component linked via htmlFor',
        'Supports aria-checked including "mixed" for indeterminate state',
      ]},
    ],
  },
  {
    name: 'Input',
    slug: 'input',
    category: 'inputs',
    description: 'Text input field with consistent styling and focus ring.',
    searchTerms: ['text field', 'type', 'form field', 'entry', 'text box', 'field'],
    component: lazy(() => import('../pages/component-demos/InputDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Single-line text entry in forms (names, emails, URLs)',
        'Fields with prefix/suffix adornments or leading/trailing icons',
        'Inline editing and search fields',
      ]},
      { heading: 'When NOT to use', content: [
        'Multi-line text — use Textarea instead',
        'Selection from a list — use Select or Combobox',
        'Numeric-only with small ranges — use NumberStepper or Slider',
      ]},
      { heading: 'States', content: [
        'Default: border-input background with placeholder text',
        'Focused: ring + border-ring styling',
        'Error: red border and focus ring with validation message below',
        'Success: green border and focus ring with validation message below',
        'Disabled: reduced opacity, no interaction',
        'Read-only: visually similar to disabled but selectable text',
      ]},
    ],
    propControls: [
      { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'Enter text...' },
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Compact (h-8 / 32px)', value: 'sm' },
        { label: 'Default (h-9 / 36px)', value: 'default' },
        { label: 'Large (h-10 / 40px)', value: 'lg' },
      ]},
      { name: 'prefix', label: 'Prefix', controlType: 'text', defaultValue: '' },
      { name: 'suffix', label: 'Suffix', controlType: 'text', defaultValue: '' },
      { name: 'leading-icon', label: 'Leading Icon', controlType: 'toggle', defaultValue: false },
      { name: 'trailing-icon', label: 'Trailing Icon', controlType: 'toggle', defaultValue: false },
      { name: 'chips', label: 'Chips', controlType: 'toggle', defaultValue: false },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
      { name: 'read-only', label: 'Read Only', controlType: 'toggle', defaultValue: false },
      { name: 'validation-state', label: 'Validation State', controlType: 'select', defaultValue: 'none', options: [
        { label: 'None', value: 'none' },
        { label: 'Error', value: 'error' },
        { label: 'Success', value: 'success' },
      ]},
      { name: 'validation-message', label: 'Validation Message', controlType: 'text', defaultValue: 'Validation message', visibleWhen: { controlName: 'validation-state', values: ['error', 'success'] } },
    ],
  },
  {
    name: 'InputOTP',
    slug: 'input-otp',
    category: 'inputs',
    description: 'One-time password input with individual character slots.',
    searchTerms: ['verification code', 'pin', 'otp', 'two factor', 'mfa', 'code entry'],
    component: lazy(() => import('../pages/component-demos/InputOTPDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Two-factor authentication code entry',
        'Email/SMS verification flows',
        'PIN entry for secure operations',
      ]},
      { heading: 'When NOT to use', content: [
        'General text input — use Input instead',
        'Long alphanumeric codes — use a standard Input with paste support',
      ]},
      { heading: 'States', content: [
        'Empty: individual bordered slots awaiting input',
        'Active: focused slot highlighted with caret',
        'Filled: character displayed in slot',
        'Disabled: muted appearance, no interaction',
      ]},
      { heading: 'Accessibility', content: [
        'Auto-advances focus to next slot on input',
        'Supports paste of full code across all slots',
        'Backspace navigates to previous slot',
      ]},
    ],
    propControls: [
      { name: 'length', label: 'Length', controlType: 'counter', defaultValue: 6, min: 4, max: 8 },
      { name: 'show-separator', label: 'Show Separator', controlType: 'toggle', defaultValue: true },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'Label',
    slug: 'label',
    category: 'atoms',
    description: 'Accessible form label with required indicator support.',
    searchTerms: ['form label', 'field label', 'caption', 'required marker'],
    component: lazy(() => import('../pages/component-demos/LabelDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Labelling form inputs (Input, Select, Textarea, Checkbox)',
        'Any interactive control that needs a visible accessible name',
      ]},
      { heading: 'When NOT to use', content: [
        'Decorative text near inputs — use a plain span or paragraph',
        'Section headings above groups of fields — use heading elements or SectionDivider',
      ]},
      { heading: 'Accessibility', content: [
        'Renders as <label> element with htmlFor binding',
        'Clicking the label focuses/activates the linked control',
        'Required indicator (*) is aria-hidden to avoid screen reader noise',
      ]},
    ],
    propControls: [
      { name: 'text', label: 'Text', controlType: 'text', defaultValue: 'Email address' },
      { name: 'required', label: 'Required', controlType: 'toggle', defaultValue: false },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'RadioGroup',
    slug: 'radio-group',
    category: 'inputs',
    description: 'Radio button group for single-choice selection.',
    searchTerms: ['radio', 'single select', 'one of many', 'exclusive choice', 'option group'],
    usesComponents: ['Label'],
    component: lazy(() => import('../pages/component-demos/RadioGroupDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Mutually exclusive choices where all options should be visible',
        '2–5 options that benefit from being scannable without opening a dropdown',
        'Settings or configuration where seeing all choices helps comparison',
      ]},
      { heading: 'When NOT to use', content: [
        'More than 5–6 options — use Select or Combobox instead',
        'Multi-select scenarios — use Checkbox group',
        'Binary on/off — use Switch instead',
        'Visual/icon-based choices — use CardSelector',
      ]},
      { heading: 'States', content: [
        'Unselected: empty circle border',
        'Selected: filled primary inner circle',
        'Disabled: muted, no pointer events',
        'Focus: ring on the focused radio item',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix RadioGroup — full arrow-key navigation between items',
        'Always pair each item with a Label for click-to-select',
      ]},
    ],
    propControls: [
      { name: 'option-count', label: 'Options', controlType: 'counter', defaultValue: 3, min: 2, max: 5 },
      { name: 'orientation', label: 'Orientation', controlType: 'select', defaultValue: 'vertical', options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'RadioCard',
    slug: 'radio-card',
    category: 'inputs',
    description: 'Selectable radio-style card with label, radio indicator, and optional child content revealed on selection.',
    searchTerms: ['radio', 'single select card', 'option card', 'filter option', 'radio button card'],
    component: lazy(() => import('../pages/component-demos/RadioCardDemo')),
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Option one' },
      { name: 'selected', label: 'Selected', controlType: 'toggle', defaultValue: true },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
      { name: 'show-children', label: 'Show Children', controlType: 'toggle', defaultValue: true },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'Single-select options with progressive disclosure (filter types, configuration modes)',
        'Vertical lists of 2–7 mutually exclusive choices',
      ]},
      { heading: 'When NOT to use', content: [
        'Grid-based icon selections — use CardSelector',
        'Multi-select — use CheckboxCard',
        'More than 7 options — use Select or Combobox',
      ]},
      { heading: 'States', content: [
        'Unselected: border-border, bg-background',
        'Selected: border-primary, bg-accent',
        'Disabled: opacity-50, cursor-not-allowed',
        'Focus: ring-2 ring-ring',
      ]},
    ],
  },
  {
    name: 'Select',
    component: lazy(() => import('../pages/component-demos/SelectDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Single-value selection from a bounded list of 3–7 options',
        'Form fields where space is constrained and a dropdown is appropriate',
        'Grouped options with visual separators',
      ]},
      { heading: 'When NOT to use', content: [
        'More than 7 options that benefit from search filtering — use Combobox instead',
        'Multi-select — use ChipInput or a checkbox list',
        'Only 2 mutually exclusive options — use SegmentedControl or RadioGroup',
      ]},
      { heading: 'States', content: [
        'Default: closed trigger with placeholder text',
        'Open: floating dropdown with scrollable option list',
        'Selected: chosen value displayed in trigger',
        'Disabled: muted trigger, no interaction',
        'Focused: ring styling on trigger',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix Select — full keyboard navigation (arrow keys, type-ahead)',
        'Escape closes, Enter/Space selects',
      ]},
    ],
    propControls: [
      { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'Select a segment' },
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Compact (h-8 / 32px)', value: 'sm' },
        { label: 'Default (h-9 / 36px)', value: 'default' },
        { label: 'Large (h-10 / 40px)', value: 'lg' },
      ]},
      { name: 'option-count', label: 'Options', controlType: 'counter', defaultValue: 3, min: 2, max: 6, section: 'Content' },
      { name: 'show-groups', label: 'Show Groups', controlType: 'toggle', defaultValue: true, section: 'Content' },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false, section: 'State' },
    ],
  },
  {
    name: 'Combobox',
    slug: 'combobox',
    category: 'inputs',
    description: 'Searchable select with type-to-filter dropdown.',
    searchTerms: ['searchable dropdown', 'autocomplete', 'typeahead', 'field with dropdown options', 'filterable select'],
    component: lazy(() => import('../pages/component-demos/ComboboxDemo')),
    propControls: [
      { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'Select a field…' },
      { name: 'status', label: 'Status', controlType: 'select', defaultValue: 'normal', options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'Option list exceeds ~7 items and benefits from search filtering',
        'Field mapping dropdowns where users pick from 20+ database columns',
        'Timezone, country, or category selectors with searchable lists',
      ]},
      { heading: 'When NOT to use', content: [
        'Short lists (≤7 items) without search need — use Select instead',
        'Multi-select scenarios — use a multi-select or tag input',
        'Free-text input with suggestions — use an autocomplete/typeahead',
      ]},
      { heading: 'States', content: [
        'Normal: default border with standard focus ring',
        'Warning: amber border and focus ring — validation hint',
        'Error: red border and focus ring — validation failure',
        'Open: popover with filtered list, check icon on selected item',
        'Empty results: "No results found" placeholder',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix Popover with search input — keyboard navigable',
        'Controlled only (value + onValueChange) — no uncontrolled mode',
        'Search resets on close to avoid stale filter state',
      ]},
    ],
  },
  {
    name: 'Slider',
    slug: 'slider',
    category: 'inputs',
    description: 'Range input for selecting numeric values.',
    searchTerms: ['range', 'scrubber', 'value slider', 'numeric range', 'drag to select'],
    component: lazy(() => import('../pages/component-demos/SliderDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Approximate numeric selection where relative position matters more than exact value',
        'Bounded ranges with continuous values (volume, opacity, percentage)',
        'Range selection with two thumbs (min/max filtering)',
      ]},
      { heading: 'When NOT to use', content: [
        'Exact numeric entry — use Input type="number" or NumberStepper',
        'Small discrete ranges (1–5) — use NumberStepper',
        'Unbounded values — use Input instead',
      ]},
      { heading: 'States', content: [
        'Default: track with filled section and draggable thumb',
        'Hover: thumb scales slightly for affordance',
        'Dragging: thumb active with tooltip showing current value',
        'Disabled: muted track and thumb, no interaction',
        'Range mode: two thumbs defining a min/max span',
      ]},
    ],
    propControls: [
      { name: 'range-mode', label: 'Range Mode', controlType: 'toggle', defaultValue: false, section: 'General' },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false, section: 'General' },
      { name: 'show-tooltip', label: 'Show Tooltip', controlType: 'toggle', defaultValue: true, section: 'Display' },
      { name: 'value-position', label: 'Value Position', controlType: 'select', defaultValue: 'right', section: 'Display', options: [
        { label: 'Right', value: 'right' },
        { label: 'Above', value: 'above' },
        { label: 'Below', value: 'below' },
        { label: 'Hidden', value: 'hidden' },
      ]},
      { name: 'show-steps', label: 'Show Steps', controlType: 'toggle', defaultValue: false, section: 'Display' },
      { name: 'step-count', label: 'Step Count', controlType: 'counter', defaultValue: 5, min: 2, max: 50, section: 'Display', visibleWhen: { controlName: 'show-steps', values: [true] } },
      { name: 'min', label: 'Min', controlType: 'number', defaultValue: 0, min: 0, max: 100, section: 'Range' },
      { name: 'max', label: 'Max', controlType: 'number', defaultValue: 100, min: 0, max: 1000, section: 'Range' },
    ],
  },
  {
    name: 'Switch',
    slug: 'switch',
    category: 'inputs',
    description: 'Toggle switch for boolean on/off states. Three sizes: default, small, and extra-small.',
    searchTerms: ['toggle', 'on off', 'boolean', 'enable disable', 'flip'],
    usesComponents: ['Label'],
    component: lazy(() => import('../pages/component-demos/SwitchDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Binary on/off states where the result is immediate (no submit button needed)',
        'Prefer over Checkbox when the toggle takes effect immediately',
        'Settings pages, feature toggles, and inline enable/disable controls',
      ]},
      { heading: 'When NOT to use', content: [
        'Form fields requiring explicit submission — use Checkbox instead',
        'Multi-select scenarios — use Checkbox group',
        'More than 2 options — use SegmentedControl or RadioGroup',
      ]},
      { heading: 'States', content: [
        'Off: muted track with thumb at left',
        'On: primary-filled track with thumb at right',
        'Disabled: reduced opacity, no interaction',
        'Default (h-6 w-11): standard forms and settings pages',
        'Small (h-5 w-9): controller panels, compact settings, table rows',
        'XS (h-4 w-7): inline toggles in very tight spaces',
      ]},
    ],
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Airplane Mode' },
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default (h-6)', value: 'default' },
        { label: 'Small (h-5)', value: 'sm' },
        { label: 'XS (h-4)', value: 'xs' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    usedIn: [
      { label: 'Settings', route: '/settings' },
    ],
  },
  {
    name: 'Textarea',
    slug: 'textarea',
    category: 'inputs',
    description: 'Multi-line text input with auto-resize support.',
    searchTerms: ['multiline', 'text area', 'paragraph input', 'long text', 'description field'],
    component: lazy(() => import('../pages/component-demos/TextareaDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Multi-line text entry (descriptions, notes, comments)',
        'Form fields expecting more than one sentence of input',
        'Content editing where line breaks are meaningful',
      ]},
      { heading: 'When NOT to use', content: [
        'Single-line values (names, emails) — use Input instead',
        'Rich text editing with formatting — use a rich text editor',
      ]},
      { heading: 'States', content: [
        'Default: bordered area with placeholder text',
        'Focused: ring + border-ring styling',
        'Disabled: muted, no interaction',
        'Read-only: visually similar to disabled but text is selectable',
      ]},
    ],
    propControls: [
      { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'Enter text...' },
      { name: 'rows', label: 'Rows', controlType: 'counter', defaultValue: 4, min: 2, max: 10 },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
      { name: 'read-only', label: 'Read Only', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'Toggle',
    slug: 'shadcn-toggle',
    category: 'atoms',
    description: 'Pressable toggle button with on/off states.',
    searchTerms: ['press button', 'toggle button', 'active state', 'on off button'],
    component: lazy(() => import('../pages/component-demos/ToggleDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Toolbar-style buttons that toggle a state (bold, italic, alignment)',
        'Single on/off controls that look like buttons rather than checkboxes',
      ]},
      { heading: 'When NOT to use', content: [
        'Live on/off settings — use Switch instead',
        'Selecting from multiple options — use ToggleGroup or SegmentedControl',
        'Navigation actions — use Button or Link',
      ]},
      { heading: 'States', content: [
        'Unpressed: ghost-like appearance (default variant) or outlined (outline variant)',
        'Pressed: accent background fill indicating active state',
        'Disabled: muted, no interaction',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
        { label: 'Large', value: 'lg' },
      ]},
      { name: 'pressed', label: 'Pressed', controlType: 'toggle', defaultValue: false },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'ToggleGroup',
    slug: 'toggle-group',
    category: 'inputs',
    description: 'Group of toggle buttons for single or multi-select.',
    searchTerms: ['button group', 'multi toggle', 'option buttons', 'segmented toggle'],
    usesComponents: ['Toggle'],
    component: lazy(() => import('../pages/component-demos/ToggleGroupDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Multi-select button groups where multiple options can be active simultaneously',
        'Toolbar-style formatting controls (bold + italic + underline)',
        'Single-select where the Radix Toggle primitives are needed directly',
      ]},
      { heading: 'When NOT to use', content: [
        'Single-select with a segmented control feel — use SegmentedControl instead',
        'More than 5–6 options — use a Select or Checkbox group',
        'Options that need descriptive labels — use RadioGroup or CardSelector',
      ]},
      { heading: 'States', content: [
        'Inactive items: ghost-like appearance',
        'Active items: accent background fill',
        'Disabled: entire group or individual items muted',
      ]},
    ],
    propControls: [
      { name: 'type', label: 'Type', controlType: 'select', defaultValue: 'single', options: [
        { label: 'Single', value: 'single' },
        { label: 'Multiple', value: 'multiple' },
      ]},
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
      ]},
      { name: 'item-count', label: 'Items', controlType: 'counter', defaultValue: 4, min: 2, max: 6 },
    ],
  },
  {
    name: 'Form',
    slug: 'form',
    category: 'inputs',
    description: 'Form wrapper with validation, error messages, and field state management.',
    searchTerms: ['form layout', 'validation', 'field group', 'submit', 'form builder'],
    component: lazy(() => import('../pages/component-demos/FormDemo')),
    usesComponents: ['Input', 'Label', 'Button', 'Checkbox', 'Select', 'Textarea'],
    designGuidance: [
      { heading: 'When to use', content: [
        'Any data entry flow requiring validation feedback',
        'Multi-field forms with section grouping',
        'Wizard steps with per-field error states',
      ]},
      { heading: 'When NOT to use', content: [
        'Single inline inputs (search bars, inline edits) — use Input directly',
        'Display-only data — use a description list or table',
      ]},
      { heading: 'Layout', content: [
        'Follow the three-tier form rhythm: intra-field (8px), inter-field (12px), inter-section (20–24px)',
        'Section headings own their fields — tight gap below, larger gap above',
        'Use SectionDivider between logical groups in single-step modals',
      ]},
    ],
    propControls: [
      { name: 'section-count', label: 'Sections', controlType: 'counter', defaultValue: 1, min: 1, max: 3, section: 'Structure' },
      { name: 'field-count', label: 'Fields Per Section', controlType: 'counter', defaultValue: 2, min: 1, max: 4, section: 'Structure' },
      { name: 'input-types', label: 'Input Types', controlType: 'select', defaultValue: 'text-only', section: 'Structure', options: [
        { label: 'Text Only', value: 'text-only' },
        { label: 'Mixed (Text + Select + Checkbox)', value: 'mixed' },
        { label: 'All Types', value: 'all-types' },
      ]},
      { name: 'show-section-headers', label: 'Show Section Headers', controlType: 'toggle', defaultValue: true, section: 'Display' },
      { name: 'max-width', label: 'Max Width', controlType: 'range', defaultValue: 100, min: 40, max: 100, step: 5, section: 'Display' },
      { name: 'validation', label: 'Validation', controlType: 'select', defaultValue: 'none', section: 'Validation', options: [
        { label: 'None', value: 'none' },
        { label: 'Error', value: 'error' },
        { label: 'Success', value: 'success' },
      ]},
    ],
  },

  // Display
  {
    name: 'Avatar',
    slug: 'avatar',
    category: 'atoms',
    description: 'User profile image with fallback initials.',
    searchTerms: ['profile picture', 'user image', 'initials', 'photo circle', 'user icon'],
    component: lazy(() => import('../pages/component-demos/AvatarDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Representing users in lists, cards, or headers',
        'Showing assignees, authors, or team members',
        'Anywhere a person needs a visual identity marker',
      ]},
      { heading: 'When NOT to use', content: [
        'Generic icons or logos — use an icon or image directly',
        'Status indicators — use Badge instead',
      ]},
      { heading: 'States', content: [
        'Image: displays user photo in circular frame',
        'Neutral (Mint): initials on mint background — default when no image',
        'Coloured: initials on hashed-colour background — distinguishes multiple users',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'neutral', options: [
        { label: 'Neutral (Mint)', value: 'neutral' },
        { label: 'Coloured', value: 'coloured' },
        { label: 'Image', value: 'image' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Small (h-8 / 32px)', value: 'sm' },
        { label: 'Default (h-10 / 40px)', value: 'default' },
        { label: 'Large (h-14 / 56px)', value: 'lg' },
      ]},
      { name: 'initials', label: 'Initials', controlType: 'text', defaultValue: 'BK' },
    ],
  },
  {
    name: 'Badge',
    slug: 'badge',
    category: 'atoms',
    description: 'Small label for status, counts, or categories.',
    searchTerms: ['tag', 'label', 'pill', 'chip', 'status indicator', 'count'],
    component: lazy(() => import('../pages/component-demos/BadgeDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Status indicators (Active, Draft, Error) in tables and cards',
        'Count labels on tabs or nav items',
        'Category or type labels for content items',
      ]},
      { heading: 'When NOT to use', content: [
        'Interactive removable tags — use Chip instead',
        'Action buttons — use Button regardless of size',
        'Large blocks of text — use Alert or a callout',
      ]},
      { heading: 'States', content: [
        'Semantic mode: colour derived from semantic tokens (primary, destructive, warning, info, success, neutral)',
        'Non-semantic mode: arbitrary hex colour for branding or categorisation',
        'Outline variant: transparent fill with coloured border — lighter weight',
        'Clickable: hover brightness change when onClick is provided',
      ]},
    ],
    propControls: [
      { name: 'text', label: 'Text', controlType: 'text', defaultValue: 'Badge' },
      { name: 'mode', label: 'Mode', controlType: 'select', defaultValue: 'semantic', options: [
        { label: 'Semantic', value: 'semantic' },
        { label: 'Non Semantic', value: 'non-semantic' },
      ]},
      { name: 'semantic-colour', label: 'Colour', controlType: 'colour', defaultValue: 'var(--primary)', visibleWhen: { controlName: 'mode', values: ['semantic'] }, options: [
        { label: 'Accent (Primary)', value: 'var(--primary)' },
        { label: 'Negative (Destructive)', value: 'var(--destructive)' },
        { label: 'Notice (Warning)', value: 'var(--warning)' },
        { label: 'Informative (Info)', value: 'var(--info)' },
        { label: 'Positive (Success)', value: 'var(--success)' },
        { label: 'Neutral', value: 'var(--muted-foreground)' },
      ]},
      { name: 'non-semantic-colour', label: 'Colour', controlType: 'colour', defaultValue: '#14B88A', visibleWhen: { controlName: 'mode', values: ['non-semantic'] }, options: [
        { label: 'Mint', value: '#14B88A' },
        { label: 'Teal', value: '#14B8A6' },
        { label: 'Indigo', value: '#6366F1' },
        { label: 'Purple', value: '#A855F7' },
        { label: 'Fuchsia', value: '#D946EF' },
        { label: 'Pink', value: '#EC4899' },
        { label: 'Yellow', value: '#EAB308' },
        { label: 'Zinc', value: '#71717A' },
        { label: 'Red', value: '#EF4444' },
        { label: 'Orange', value: '#F97316' },
        { label: 'Lime', value: '#84CC16' },
        { label: 'Green', value: '#22C55E' },
        { label: 'Cyan', value: '#06B6D4' },
        { label: 'Blue', value: '#3B82F6' },
        { label: 'Sky', value: '#0EA5E9' },
      ]},
      { name: 'outline', label: 'Outline', controlType: 'toggle', defaultValue: false },
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'default' },
        { label: 'Large', value: 'lg' },
      ]},
      { name: 'show-icon', label: 'Show Icon', controlType: 'toggle', defaultValue: false },
      { name: 'clickable', label: 'Clickable', controlType: 'toggle', defaultValue: false },
    ],
    usedIn: [
      { label: 'Segments', route: '/audiences/segments' },
    ],
  },
  {
    name: 'Card',
    slug: 'card',
    category: 'display',
    description: 'Container with header, content, and footer sections.',
    searchTerms: ['panel', 'container', 'box', 'content card', 'surface'],
    component: lazy(() => import('../pages/component-demos/CardDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Grouping related content with a clear boundary (settings panels, metric tiles)',
        'Content that benefits from elevation or separation from its surroundings',
        'Structured layouts with optional header and footer sections',
      ]},
      { heading: 'When NOT to use', content: [
        'Full-width page sections — use border-b separators or plain containers',
        'Simple lists — use Table or a flat list without card wrappers',
        'Modal content — use Dialog or Sheet which provides its own surface',
      ]},
      { heading: 'States', content: [
        'Default: subtle border with rounded corners',
        'Outline variant: stronger border for standalone cards',
        'With/without header, description, and footer — all sections optional',
      ]},
    ],
    propControls: [
      { name: 'showHeader', label: 'Show Header', controlType: 'toggle', defaultValue: true },
      { name: 'showFooter', label: 'Show Footer', controlType: 'toggle', defaultValue: true },
      { name: 'showDescription', label: 'Show Description', controlType: 'toggle', defaultValue: true },
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
      ]},
    ],
  },
  {
    name: 'Separator',
    slug: 'separator',
    category: 'atoms',
    description: 'Visual divider between content sections, horizontal or vertical.',
    searchTerms: ['divider', 'line', 'hr', 'horizontal rule', 'section break'],
    component: lazy(() => import('../pages/component-demos/SeparatorDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Visually separating content sections without a label',
        'Vertical dividers between inline elements (e.g. toolbar sections)',
        'Replacing <hr> with proper semantics and styling',
      ]},
      { heading: 'When NOT to use', content: [
        'Labelled section breaks — use SectionDivider instead',
        'Spacing-only separation — use margin/padding utilities',
      ]},
    ],
    propControls: [
      { name: 'orientation', label: 'Orientation', controlType: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ]},
      { name: 'decorative', label: 'Decorative', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'Skeleton',
    slug: 'skeleton',
    category: 'atoms',
    description: 'Loading placeholder with pulse animation.',
    searchTerms: ['loading', 'placeholder', 'shimmer', 'ghost element', 'content loader'],
    component: lazy(() => import('../pages/component-demos/SkeletonDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Content loading states to prevent layout shift (cards, lists, profiles)',
        'Indicating that data is being fetched without blocking the UI',
        'Placeholder for async-loaded images, text blocks, or data fields',
      ]},
      { heading: 'When NOT to use', content: [
        'Button or action loading — use a spinner inside the button instead',
        'Full-page initial load — use Suspense with a page-level fallback',
        'Progress indication with known completion — use Progress bar',
      ]},
      { heading: 'States', content: [
        'Line: rectangular pulse for text content',
        'Circle: circular pulse for avatars or icons',
        'Card: rectangular pulse for card-shaped content',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'line', options: [
        { label: 'Line', value: 'line' },
        { label: 'Circle', value: 'circle' },
        { label: 'Card', value: 'card' },
      ]},
      { name: 'count', label: 'Count', controlType: 'counter', defaultValue: 3, min: 1, max: 5 },
    ],
  },
  {
    name: 'Table',
    slug: 'table',
    category: 'display',
    description: 'Structured data table with header, body, and footer sections.',
    searchTerms: ['grid', 'data grid', 'rows', 'columns', 'tabular', 'spreadsheet'],
    component: lazy(() => import('../pages/component-demos/TableDemo')),
    usesComponents: [],
    designGuidance: [
      { heading: 'When to use', content: [
        'Custom or hierarchical tables where DataTable column-driven API does not fit',
        'Tree/expandable rows, key-value layouts, or nested sub-tables',
      ]},
      { heading: 'When NOT to use', content: [
        'Standard data-driven tables with sorting and selection — use DataTable instead',
        'Simple key-value display — use a description list',
        'Card-based layouts — use Card or a grid',
      ]},
      { heading: 'States', content: [
        'Selected rows: data-state="selected" applies bg-accent/30 fill',
        'Overflow: wrapper provides overflow-x-auto for horizontal scroll',
        'Sticky headers: wrap in height-restricted container with overflow-y-auto',
      ]},
    ],
  },
  {
    name: 'Table Sandbox',
    slug: 'table-sandbox',
    category: 'sandboxes',
    description: 'Interactive sandbox for exploring table design language — density, borders, containers, selection, striping, and hover states.',
    searchTerms: ['table playground', 'table explorer', 'data table options', 'table styling'],
    component: lazy(() => import('../pages/component-demos/TableSandboxDemo')),
    usesComponents: ['Table', 'Badge', 'Checkbox'],
    designGuidance: [
      { heading: 'When to use', content: [
        'Exploring and standardising table styling across the product',
        'Comparing different table configurations (density, borders, selection)',
      ]},
      { heading: 'When NOT to use', content: [
        'Production pages — use DataTable or Table components directly',
        'This is a design exploration sandbox, not a reusable component',
      ]},
    ],
    propControls: [],
  },
  {
    name: 'Reorderable List',
    slug: 'reorderable-list',
    category: 'sandboxes',
    description: 'Interactive sandbox for reorderable checkbox lists — drag to reorder selected items, toggle selection, with configurable drag indicators and styling.',
    searchTerms: ['drag and drop', 'sortable list', 'reorder', 'drag list', 'field ordering'],
    component: lazy(() => import('../pages/component-demos/ReorderableListSandboxDemo')),
    usesComponents: ['Checkbox', 'Badge'],
    designGuidance: [
      { heading: 'When to use', content: [
        'Field selection with drag-to-reorder for the selected subset',
        'Exporter field mapping, column visibility, form builder field ordering',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple checkbox lists without reordering — use a Checkbox group',
        'Production pages — use the pattern directly, this is for exploration',
      ]},
    ],
    propControls: [],
  },
  {
    name: 'Card List',
    slug: 'card-list',
    category: 'sandboxes',
    description: 'Interactive sandbox for expandable card list patterns — rich list items with icons, metadata, actions, and nested content.',
    searchTerms: ['expandable list', 'nested list', 'parent child list', 'rich list'],
    component: lazy(() => import('../pages/component-demos/CardListSandboxDemo')),
    usesComponents: ['Badge', 'Switch'],
    designGuidance: [
      { heading: 'When to use', content: [
        'Rich list items that are more than a table row but less than a full card grid',
        'Expandable parent/child patterns (connectors with nested automations)',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple tabular data — use DataTable instead',
        'Full card grids with uniform items — use Card in a CSS grid',
        'Production pages — use the pattern directly, this is for exploration',
      ]},
    ],
    propControls: [],
  },
  {
    name: 'Progress',
    slug: 'progress',
    category: 'atoms',
    description: 'Progress bar showing completion percentage.',
    searchTerms: ['loading bar', 'percentage', 'completion', 'progress indicator', 'bar fill'],
    component: lazy(() => import('../pages/component-demos/ProgressDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Determinate progress with a known completion percentage (file uploads, import jobs)',
        'Visual indication of how far along a process is',
      ]},
      { heading: 'When NOT to use', content: [
        'Indeterminate loading — use Skeleton or a spinner',
        'Multi-step workflows — use Stepper instead',
        'Content loading placeholders — use Skeleton',
      ]},
      { heading: 'States', content: [
        'In progress: filled portion of track (0–100%)',
        'Complete: fully filled track',
        'With label: percentage text shown alongside',
      ]},
    ],
    propControls: [
      { name: 'value', label: 'Value', controlType: 'range', defaultValue: 50, min: 0, max: 100, step: 5 },
      { name: 'showLabel', label: 'Show Label', controlType: 'toggle', defaultValue: true },
    ],
  },

  // Feedback
  {
    name: 'Alert',
    slug: 'alert',
    category: 'feedback',
    description: 'Callout for important messages with icon, title, and description.',
    searchTerms: ['banner', 'notification', 'message', 'info box', 'warning', 'callout'],
    component: lazy(() => import('../pages/component-demos/AlertDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Persistent inline messages that remain visible (not dismissible toasts)',
        'Page-level or section-level warnings, errors, or information banners',
        'Validation summaries above forms',
      ]},
      { heading: 'When NOT to use', content: [
        'Transient feedback after an action — use Sonner toast instead',
        'Blocking confirmations — use AlertDialog instead',
        'Inline field-level validation — use input error states',
      ]},
      { heading: 'States', content: [
        'Default: neutral styling for general information',
        'Destructive: red accent for errors or critical issues',
        'Warning: amber accent for caution messages',
        'Info: blue accent for informational callouts',
        'Success: green accent for positive confirmations',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
      ]},
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Heads up!' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'You can add components to your app using the CLI.' },
      { name: 'show-icon', label: 'Show Icon', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'AlertDialog',
    slug: 'alert-dialog',
    category: 'feedback',
    description: 'Confirmation dialog with neutral, warning, and destructive intent variants and tiered confirmation guards.',
    searchTerms: ['confirm', 'confirmation', 'destructive modal', 'are you sure', 'delete confirm'],
    usesComponents: ['Button', 'Input', 'Checkbox', 'Label', 'Close Button'],
    component: lazy(() => import('../pages/component-demos/AlertDialogDemo')),
    propControls: [
      { name: 'object-name', label: 'Object name', controlType: 'text', defaultValue: '' },
      { name: 'confirmation-guard', label: 'Confirmation guard', controlType: 'select', defaultValue: 'none', options: [
        { label: 'None', value: 'none' },
        { label: 'Checkbox', value: 'checkbox' },
        { label: 'Type to confirm', value: 'type-to-confirm' },
      ]},
      { name: 'input-text', label: 'Input text', controlType: 'text', defaultValue: 'DELETE', visibleWhen: { controlName: 'confirmation-guard', values: ['type-to-confirm'] } },
      { name: 'loading', label: 'Simulate loading', controlType: 'toggle', defaultValue: false },
      { name: 'loading-label', label: 'Loading label', controlType: 'text', defaultValue: 'Deleting...', visibleWhen: { controlName: 'loading', values: [true] } },
    ],
    designGuidance: [
      {
        heading: 'When to use',
        content: [
          'Any action that cannot be undone (delete, purge, remove permanently)',
          'Actions with significant side effects (editing a connection that affects linked automations)',
          'Discarding unsaved work (close wizard without saving, abandon form changes)',
          'Informational alerts that require acknowledgement before continuing',
        ],
      },
      {
        heading: 'When NOT to use',
        content: [
          'Inline confirmations where a toast or undo pattern is sufficient',
          'Form validation — use inline error messages instead',
          'Success feedback — use Sonner toast instead',
          'Complex multi-step flows — use a Dialog or Sheet with form content',
          'Non-blocking information — use a banner or callout instead',
        ],
      },
      {
        heading: 'States',
        content: [
          'Neutral intent: no top accent, teal confirm button — routine confirmations',
          'Warning intent: amber top accent + Warning icon — actions with side effects',
          'Destructive intent: red top accent, red confirm button, swapped button order — irreversible actions',
          'Loading: spinner on confirm button, both buttons disabled, dismissal blocked',
          'Single-action: showCancel={false} for acknowledgement-only dialogs',
        ],
      },
      {
        heading: 'Accessibility',
        content: [
          'Built on Radix AlertDialog — traps focus, Escape to dismiss',
          'Title is linked to aria-labelledby for screen readers',
          'Confirmation guards (checkbox, type-to-confirm) prevent accidental activation',
        ],
      },
    ],
  },
  {
    name: 'AlertDialogComposed',
    slug: 'alert-dialog-composed',
    category: 'feedback',
    description: 'Pre-composed alert dialog with intent variants (neutral, warning, destructive), optional type-to-confirm guard, and async loading state.',
    searchTerms: ['confirmation', 'confirm dialog', 'destructive dialog', 'delete confirm', 'warning dialog', 'type to confirm'],
    component: lazy(() => import('../pages/component-demos/AlertDialogComposedDemo')),
    propControls: [
      { name: 'intent', label: 'Intent', controlType: 'select', defaultValue: 'destructive', options: [
        { label: 'Neutral', value: 'neutral' },
        { label: 'Warning', value: 'warning' },
        { label: 'Destructive', value: 'destructive' },
      ]},
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Delete this item?' },
      { name: 'confirm-label', label: 'Confirm Label', controlType: 'text', defaultValue: 'Delete' },
      { name: 'requires-checkbox', label: 'Requires Checkbox', controlType: 'toggle', defaultValue: false },
      { name: 'requires-input', label: 'Type to Confirm', controlType: 'text', defaultValue: '' },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'Destructive confirmations (delete, discard)',
        'Billing confirmations (activate)',
        'Any action that needs explicit user consent',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple informational messages — use Alert or Toast',
        'Non-destructive confirmations — use Dialog directly',
      ]},
      { heading: 'States', content: [
        'Neutral (default button): routine confirmations',
        'Warning (secondary button): amber top accent, side-effect actions',
        'Destructive (destructive button): red top accent, irreversible actions',
        'Loading (spinner on confirm): async operations in progress',
        'Type-to-confirm (input guard): catastrophic actions requiring typed confirmation',
      ]},
    ],
  },
  {
    name: 'Dialog',
    slug: 'dialog',
    category: 'feedback',
    description: 'Accessible modal dialog built on Radix UI with structured Header → Body → Footer layout and blurred overlay.',
    searchTerms: ['modal', 'popup', 'overlay', 'confirmation', 'alert', 'lightbox'],
    usesComponents: ['Button', 'Input', 'Close Button'],
    component: lazy(() => import('../pages/component-demos/DialogDemo')),
    propControls: [
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Edit Profile' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Make changes to your profile here.' },
      { name: 'show-footer', label: 'Show Footer', controlType: 'toggle', defaultValue: true },
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Small (360px)', value: 'sm' },
        { label: 'Default (425px)', value: 'default' },
        { label: 'Large (560px)', value: 'lg' },
      ]},
    ],
    designGuidance: [
      {
        heading: 'When to use',
        content: [
          'Confirmations and short decision prompts',
          'Focused forms (edit profile, rename, quick settings)',
          'Single-action acknowledgements',
          'Any interaction that needs to block the page and return a result',
        ],
      },
      {
        heading: 'When NOT to use',
        content: [
          'Multi-step wizards or complex flows — use a wider custom modal or Sheet',
          'Non-blocking feedback — use Sonner toast instead',
          'Destructive confirmations with guards — use AlertDialog instead',
          'Long scrollable content — consider a Sheet or dedicated page',
        ],
      },
      {
        heading: 'Layout',
        content: [
          'DialogHeader — horizontal flex (items-center, justify-between), px-6 pt-6. Title left, close button right.',
          'DialogBody — padded content area (px-6 py-4). Forms, messages, or main content.',
          'DialogFooter — right-aligned button row (px-6 py-4, gap-3). Cancel left, primary right.',
          'Sections are optional — omit any without leftover whitespace.',
          'Default max-width 460px. Override via className for wider dialogs.',
        ],
      },
    ],
  },
  {
    name: 'Sheet',
    slug: 'sheet',
    category: 'feedback',
    description: 'Slide-out panel from screen edge for secondary content or forms.',
    searchTerms: ['drawer', 'slide panel', 'side panel', 'flyout', 'slide out'],
    usesComponents: ['Button', 'Close Button'],
    component: lazy(() => import('../pages/component-demos/SheetDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Secondary content that doesn\'t warrant a full page (detail panels, filters)',
        'Long forms or configuration panels that slide in from the side',
        'Context panels that overlay without losing page context',
      ]},
      { heading: 'When NOT to use', content: [
        'Short confirmations — use Dialog or AlertDialog instead',
        'Quick notifications — use Sonner toast',
        'Primary page content — use a dedicated route/page',
      ]},
      { heading: 'States', content: [
        'Closed: hidden off-screen',
        'Open: slides in from configured edge (top, right, bottom, left) with overlay',
        'With/without footer: optional action buttons at bottom',
      ]},
    ],
    propControls: [
      { name: 'side', label: 'Side', controlType: 'select', defaultValue: 'right', options: [
        { label: 'Top', value: 'top' },
        { label: 'Right', value: 'right' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
      ]},
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Sheet Title' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Sheet description text.' },
      { name: 'show-footer', label: 'Show Footer', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'Sonner',
    slug: 'sonner',
    category: 'feedback',
    description: 'Toast notification system with stacking and auto-dismiss.',
    searchTerms: ['toast', 'snackbar', 'notification', 'flash message', 'pop up message'],
    component: lazy(() => import('../pages/component-demos/SonnerDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Transient success/error feedback after user actions (save, delete, send)',
        'Non-blocking informational messages that auto-dismiss',
        'Any feedback that doesn\'t require user acknowledgement',
      ]},
      { heading: 'When NOT to use', content: [
        'Persistent messages the user must read — use Alert instead',
        'Confirmations before actions — use AlertDialog',
        'Inline validation — use field-level error states',
      ]},
      { heading: 'States', content: [
        'Default: neutral styling',
        'Success: green accent for positive outcomes',
        'Error: red accent for failures',
        'Info: blue accent for informational messages',
        'Warning: amber accent for caution',
      ]},
    ],
    propControls: [
      { name: 'type', label: 'Type', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
      ]},
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Event has been created' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Monday, January 3rd at 6:00pm' },
    ],
  },
  {
    name: 'Tooltip',
    slug: 'tooltip',
    category: 'feedback',
    description: 'Hover-triggered informational popup with configurable placement.',
    searchTerms: ['hint', 'hover text', 'help text', 'info bubble', 'title attribute'],
    usesComponents: [],
    designGuidance: [
      {
        heading: 'When to use',
        content: [
          'Short, non-interactive labels for icon buttons or truncated text',
          'Explaining abbreviated values or adding context to unlabelled controls',
        ],
      },
      {
        heading: 'When NOT to use',
        content: [
          'Rich or interactive content — use Popover or HoverCard instead',
          'Essential information users must see — use inline text or Alert',
          'Touch-only interfaces — tooltips require hover',
        ],
      },
    ],
    component: lazy(() => import('../pages/component-demos/TooltipDemo')),
    propControls: [
      { name: 'content', label: 'Content', controlType: 'text', defaultValue: 'Add to library' },
      { name: 'side', label: 'Side', controlType: 'select', defaultValue: 'top', options: [
        { label: 'Top', value: 'top' },
        { label: 'Right', value: 'right' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
      ]},
      { name: 'delay', label: 'Delay (ms)', controlType: 'number', defaultValue: 200, min: 0, max: 2000 },
    ],
  },
  {
    name: 'HoverCard',
    slug: 'hover-card',
    category: 'feedback',
    description: 'Hover-triggered card preview for links or user profiles.',
    searchTerms: ['preview card', 'hover preview', 'link preview', 'user card', 'profile popup'],
    usesComponents: ['Avatar', 'Button'],
    component: lazy(() => import('../pages/component-demos/HoverCardDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Preview cards for user profiles, links, or entities on hover',
        'Rich hover content that goes beyond a single-line tooltip',
        'Non-interactive previews that appear on mouse enter',
      ]},
      { heading: 'When NOT to use', content: [
        'Single-line labels — use Tooltip instead',
        'Interactive content (buttons, forms) — use Popover instead',
        'Click-triggered content — use Popover or Dialog',
      ]},
    ],
    propControls: [
      { name: 'open-delay', label: 'Open Delay (ms)', controlType: 'number', defaultValue: 200, min: 0, max: 2000 },
      { name: 'close-delay', label: 'Close Delay (ms)', controlType: 'number', defaultValue: 100, min: 0, max: 1000 },
      { name: 'side', label: 'Side', controlType: 'select', defaultValue: 'bottom', options: [
        { label: 'Top', value: 'top' },
        { label: 'Right', value: 'right' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
      ]},
    ],
  },
  {
    name: 'Popover',
    slug: 'popover',
    category: 'feedback',
    description: 'Click-triggered floating panel for forms or additional content.',
    searchTerms: ['popup', 'things that popup', 'floating', 'dropdown panel', 'floating content'],
    usesComponents: ['Button'],
    component: lazy(() => import('../pages/component-demos/PopoverDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Contextual forms or settings that appear alongside their trigger',
        'Help content or explanations that need more space than a tooltip',
        'Non-modal floating panels with interactive content (buttons, links)',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple text labels on hover — use Tooltip instead',
        'Blocking confirmation flows — use Dialog or AlertDialog',
        'Full forms or lengthy content — use a Sheet or dedicated page',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix Popover — focus managed, Escape to dismiss',
        'Click outside to close, maintains trigger focus on close',
      ]},
    ],
    propControls: [
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'How does UbiQuity link transactions to contacts?', section: 'Content' },
      { name: 'body', label: 'Body', controlType: 'textarea', defaultValue: 'Every transactional record needs to be linked to a contact in UbiQuity. Lookup Mapping tells the system which column in your file identifies the contact that each transaction belongs to.', section: 'Content' },
      { name: 'show-table', label: 'Show Table', controlType: 'toggle', defaultValue: false, section: 'Content' },
      { name: 'show-details', label: 'Additional Details', controlType: 'toggle', defaultValue: true, section: 'Content' },
      { name: 'details-variant', label: 'Details Style', controlType: 'select', defaultValue: 'default', section: 'Content', visibleWhen: { controlName: 'show-details', values: [true] }, options: [
        { label: 'Default (Mint)', value: 'default' },
        { label: 'Destructive (Red)', value: 'destructive' },
        { label: 'Info (Blue)', value: 'info' },
        { label: 'Caution (Amber)', value: 'caution' },
      ]},
      { name: 'show-done-button', label: 'Show Done', controlType: 'toggle', defaultValue: true, section: 'Buttons' },
      { name: 'done-label', label: 'Done Label', controlType: 'text', defaultValue: 'Done', section: 'Buttons', visibleWhen: { controlName: 'show-done-button', values: [true] } },
      { name: 'width', label: 'Width', controlType: 'select', defaultValue: '400px', section: 'Layout', options: [
        { label: 'Narrow (280px)', value: '280px' },
        { label: 'Default (320px)', value: '320px' },
        { label: 'Wide (400px)', value: '400px' },
      ]},
      { name: 'align', label: 'Align', controlType: 'select', defaultValue: 'center', section: 'Layout', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
      ]},
    ],
  },

  // Navigation
  {
    name: 'Accordion',
    slug: 'accordion',
    category: 'navigation',
    description: 'Collapsible content sections with single or multiple open panels.',
    searchTerms: ['expandable', 'collapsible', 'expand collapse', 'faq', 'disclosure'],
    component: lazy(() => import('../pages/component-demos/AccordionDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'FAQ sections or help pages with many expandable answers',
        'Settings or configuration groups that benefit from progressive disclosure',
        'Long content that can be chunked into collapsible sections',
      ]},
      { heading: 'When NOT to use', content: [
        'Navigation menus — use Collapsible sidebar groups or nav menus',
        'Tabbed content where all sections are equally important — use Tabs',
        'Simple show/hide toggle — use Collapsible for single items',
      ]},
      { heading: 'States', content: [
        'Collapsed: only trigger/header visible',
        'Expanded: content revealed with animation',
        'Single mode: only one panel open at a time',
        'Multiple mode: any combination of panels can be open',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix Accordion — proper aria-expanded and keyboard navigation',
        'Enter/Space toggles, arrow keys navigate between items',
      ]},
    ],
    propControls: [
      { name: 'item-count', label: 'Items', controlType: 'counter', defaultValue: 3, min: 1, max: 6 },
      { name: 'type', label: 'Type', controlType: 'select', defaultValue: 'single', options: [
        { label: 'Single', value: 'single' },
        { label: 'Multiple', value: 'multiple' },
      ]},
      { name: 'collapsible', label: 'Collapsible', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'Breadcrumb',
    slug: 'breadcrumb',
    category: 'navigation',
    description: 'Navigation trail showing page hierarchy.',
    searchTerms: ['path', 'trail', 'hierarchy', 'navigation path', 'location'],
    component: lazy(() => import('../pages/component-demos/BreadcrumbDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Pages nested more than one level deep to show location context',
        'Drill-down interfaces where users navigate into detail views',
        'Replacing browser back button with explicit return paths',
      ]},
      { heading: 'When NOT to use', content: [
        'Top-level pages with no parent hierarchy — unnecessary noise',
        'Single-level navigation — the nav bar is sufficient',
        'Within modals or sheets — they have their own close/back patterns',
      ]},
    ],
    propControls: [
      { name: 'item-count', label: 'Items', controlType: 'counter', defaultValue: 3, min: 2, max: 5 },
      { name: 'show-ellipsis', label: 'Show Ellipsis', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'Collapsible',
    slug: 'collapsible',
    category: 'navigation',
    description: 'Expandable/collapsible content section with trigger.',
    searchTerms: ['expand', 'collapse', 'toggle section', 'show hide', 'disclosure'],
    component: lazy(() => import('../pages/component-demos/CollapsibleDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Single collapsible section with custom trigger content',
        'Sidebar navigation groups that expand/collapse',
        'Progressive disclosure of secondary information',
      ]},
      { heading: 'When NOT to use', content: [
        'Multiple related collapsible sections — use Accordion instead',
        'Tab-like content switching — use Tabs',
      ]},
      { heading: 'States', content: [
        'Open: content visible, trigger in expanded state',
        'Closed: content hidden, trigger in collapsed state',
      ]},
    ],
    propControls: [
      { name: 'open', label: 'Open', controlType: 'toggle', defaultValue: false },
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: '@peduarte starred 3 repositories' },
    ],
  },
  {
    name: 'Command',
    slug: 'command',
    category: 'navigation',
    description: 'Combobox/command palette with search filtering and keyboard selection.',
    searchTerms: ['command palette', 'spotlight', 'quick action', 'cmd k', 'keyboard shortcut'],
    component: lazy(() => import('../pages/component-demos/CommandDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Global search / command palette (Cmd+K) for quick navigation',
        'Searchable action lists within dialogs or popovers',
        'Keyboard-driven interfaces with type-to-filter',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple dropdown selection — use Select or Combobox',
        'Form field with autocomplete — use Combobox',
        'Static navigation menus — use DropdownMenu or NavigationMenu',
      ]},
      { heading: 'Accessibility', content: [
        'Full keyboard navigation — arrow keys, Enter to select, Escape to dismiss',
        'Type-ahead filtering with live result announcements',
        'Groups and separators for organized command categories',
      ]},
    ],
    propControls: [
      { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'Type a command or search...' },
      { name: 'show-groups', label: 'Show Groups', controlType: 'toggle', defaultValue: true },
      { name: 'item-count', label: 'Items', controlType: 'counter', defaultValue: 5, min: 2, max: 8 },
    ],
  },
  {
    name: 'ContextMenu',
    slug: 'context-menu',
    category: 'navigation',
    description: 'Right-click menu with items, sub-menus, and separators.',
    searchTerms: ['right click', 'context actions', 'secondary menu', 'action menu'],
    component: lazy(() => import('../pages/component-demos/ContextMenuDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Right-click secondary actions on content items (rows, cards, canvas elements)',
        'Power-user shortcuts that supplement primary UI actions',
      ]},
      { heading: 'When NOT to use', content: [
        'Primary actions that users need to discover — use visible buttons or DropdownMenu',
        'Touch-only interfaces — context menus require right-click',
        'The only way to access an action — always provide a visible alternative',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix ContextMenu — keyboard navigation within menu items',
        'Ensure all context menu actions are also available through visible UI',
      ]},
    ],
    propControls: [
      { name: 'item-count', label: 'Item Count', controlType: 'counter', defaultValue: 4, min: 2, max: 8 },
      { name: 'show-separators', label: 'Show Separators', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'DropdownMenu',
    slug: 'dropdown-menu',
    category: 'navigation',
    description: 'Click-triggered menu with items, separators, and keyboard navigation.',
    searchTerms: ['menu', 'action menu', 'options menu', 'kebab menu', 'more actions'],
    component: lazy(() => import('../pages/component-demos/DropdownMenuDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Overflow or "more actions" menus behind a kebab/dots button',
        'Action lists triggered by clicking a button',
        'Compact UI where multiple actions share one trigger',
      ]},
      { heading: 'When NOT to use', content: [
        'Form selection — use Select or Combobox instead',
        'Navigation with page links — use NavigationMenu',
        'Right-click actions — use ContextMenu',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix DropdownMenu — full keyboard navigation',
        'Arrow keys navigate, Enter/Space select, Escape closes',
        'Supports sub-menus, checkable items, and radio groups',
      ]},
    ],
    propControls: [
      { name: 'item-count', label: 'Item Count', controlType: 'counter', defaultValue: 5, min: 2, max: 8 },
      { name: 'show-icons', label: 'Show Icons', controlType: 'toggle', defaultValue: true },
      { name: 'show-separators', label: 'Show Separators', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'Menubar',
    slug: 'menubar',
    category: 'navigation',
    description: 'Horizontal menu bar with dropdown sub-menus.',
    searchTerms: ['menu strip', 'file menu', 'toolbar menu', 'app menu'],
    component: lazy(() => import('../pages/component-demos/MenubarDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Application-style menu bars with File/Edit/View pattern',
        'Rich desktop-like interfaces with many categorised actions',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple site navigation — use NavigationMenu instead',
        'Single action menus — use DropdownMenu',
        'Mobile-first interfaces — menu bars don\'t translate well to small screens',
      ]},
      { heading: 'Accessibility', content: [
        'Full keyboard navigation — arrow keys between top-level items and within dropdowns',
        'Supports keyboard shortcuts displayed alongside menu items',
      ]},
    ],
    propControls: [
      { name: 'menu-count', label: 'Menus', controlType: 'counter', defaultValue: 3, min: 2, max: 5 },
      { name: 'show-shortcuts', label: 'Show Shortcuts', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'NavigationMenu',
    slug: 'navigation-menu',
    category: 'navigation',
    description: 'Site navigation with links, dropdowns, and viewport animations.',
    searchTerms: ['nav bar', 'site navigation', 'top nav', 'mega menu', 'header nav'],
    usesComponents: ['Button'],
    component: lazy(() => import('../pages/component-demos/NavigationMenuDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Primary site navigation with link items and dropdown sub-menus',
        'Header navigation bars with descriptive dropdown panels',
      ]},
      { heading: 'When NOT to use', content: [
        'Action menus (delete, edit, etc.) — use DropdownMenu',
        'Form selection — use Select or Combobox',
        'In-page section navigation — use Tabs',
      ]},
      { heading: 'Accessibility', content: [
        'Built on Radix NavigationMenu — proper aria roles for navigation',
        'Keyboard navigation between items and into dropdown panels',
      ]},
    ],
    propControls: [
      { name: 'item-count', label: 'Items', controlType: 'counter', defaultValue: 4, min: 2, max: 6 },
      { name: 'dropdown-items', label: 'Dropdown Items', controlType: 'counter', defaultValue: 3, min: 1, max: 5 },
      { name: 'show-descriptions', label: 'Show Descriptions', controlType: 'toggle', defaultValue: false },
      { name: 'orientation', label: 'Orientation', controlType: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ]},
    ],
  },
  {
    name: 'Pagination',
    slug: 'pagination',
    category: 'navigation',
    description: 'Page navigation with previous/next and numbered page links.',
    searchTerms: ['pages', 'page numbers', 'next previous', 'paging', 'page controls'],
    component: lazy(() => import('../pages/component-demos/PaginationDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Paginated data tables or list views with server-side pagination',
        'Search results that span multiple pages',
      ]},
      { heading: 'When NOT to use', content: [
        'Infinite scroll / load-more patterns — use a "Load more" button',
        'Small data sets that fit on one page — pagination adds noise',
        'Within modals — keep content short or use ScrollArea',
      ]},
      { heading: 'States', content: [
        'Active page: highlighted with primary styling',
        'Inactive pages: clickable links',
        'Ellipsis: shown when page range exceeds visible slots',
        'Disabled prev/next: when at first/last page',
      ]},
    ],
    propControls: [
      { name: 'total-pages', label: 'Total Pages', controlType: 'counter', defaultValue: 10, min: 3, max: 20 },
      { name: 'current-page', label: 'Current Page', controlType: 'counter', defaultValue: 1, min: 1, max: 20 },
      { name: 'show-ellipsis', label: 'Show Ellipsis', controlType: 'toggle', defaultValue: true },
    ],
  },
  {
    name: 'ScrollArea',
    slug: 'scroll-area',
    category: 'navigation',
    description: 'Custom scrollbar container with consistent cross-browser styling.',
    searchTerms: ['scrollbar', 'overflow', 'scroll container', 'scrollable', 'scroll pane'],
    component: lazy(() => import('../pages/component-demos/ScrollAreaDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Constrained-height containers that need scrolling (modal bodies, sidebars)',
        'Consistent scrollbar styling across browsers',
        'Horizontal or bidirectional scrolling layouts',
      ]},
      { heading: 'When NOT to use', content: [
        'Full-page scrolling — native scroll is fine',
        'Very short content that won\'t overflow — unnecessary wrapper',
      ]},
    ],
    propControls: [
      { name: 'height', label: 'Height', controlType: 'range', defaultValue: 200, min: 100, max: 400 },
      { name: 'orientation', label: 'Orientation', controlType: 'select', defaultValue: 'vertical', options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Both', value: 'both' },
      ]},
      { name: 'item-count', label: 'Item Count', controlType: 'counter', defaultValue: 20, min: 5, max: 50 },
    ],
  },
  {
    name: 'Tabs',
    slug: 'tabs',
    category: 'navigation',
    description: 'Tabbed interface with pill and underline variants. Pill for content switching, underline for page-level navigation.',
    searchTerms: ['tab bar', 'sections', 'views', 'navigation tabs', 'page tabs'],
    component: lazy(() => import('../pages/component-demos/TabsDemo')),
    usesComponents: [],
    designGuidance: [
      { heading: 'When to use', content: [
        'Switching between views of related content within the same context',
        'Page-level navigation between sub-sections (underline variant)',
        'Content panels within cards or settings pages (pill variant)',
      ]},
      { heading: 'When NOT to use', content: [
        'Sequential steps — use Stepper instead',
        'Expanding/collapsing content — use Accordion',
        'Filtering data — use SegmentedControl or filter buttons',
      ]},
      { heading: 'States', content: [
        'Pill variant: active tab gets white fill + shadow, inactive is transparent',
        'Underline variant: active tab gets bottom border indicator, inactive is transparent',
        'Badge on trigger: count styling reacts to active state via group-data pattern',
        'Vertical orientation: tabs stack vertically with content beside',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'pill', options: [
        { label: 'Pill', value: 'pill' },
        { label: 'Underline', value: 'underline' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Compact', value: 'compact' },
      ]},
      { name: 'tab-count', label: 'Tabs', controlType: 'counter', defaultValue: 3, min: 2, max: 6 },
      { name: 'show-badge', label: 'Show Badge', controlType: 'toggle', defaultValue: false },
      { name: 'orientation', label: 'Orientation', controlType: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ]},
      { name: 'show-content', label: 'Show Content', controlType: 'toggle', defaultValue: true },
    ],
  },

  // Composed → moved to appropriate categories

  // Inputs (selection/interaction controls)
  {
    name: 'CardSelector',
    slug: 'card-selector',
    category: 'inputs',
    description: 'Selectable card with icon, label, and checkmark badge for single/multi-choice selections.',
    searchTerms: ['card picker', 'option cards', 'visual selector', 'icon cards', 'choice cards'],
    usesComponents: [],
    designGuidance: [
      { heading: 'When to use', content: [
        '2–6 option selections where each option benefits from an icon',
        'Categorical choices (e.g. importer vs exporter, connection type)',
        'Wizard steps where the user picks a direction before proceeding',
      ]},
      { heading: 'When NOT to use', content: [
        'Long lists (7+) — use a radio group or select dropdown',
        'Text-only options without icons — use SegmentedControl or radio buttons',
        'Binary yes/no — use Switch or a single checkbox',
      ]},
      { heading: 'States', content: [
        'Unselected: neutral border, bg-background, muted text, description in muted-foreground',
        'Selected: teal border, bg-accent, shadow-md, checkmark badge, description in teal (text-primary)',
        'Hover (unselected): teal border, teal text, bg-accent/25',
        'Hover (selected): shadow deepens to shadow-lg',
        'Disabled: native HTML disabled attribute (no pointer events)',
      ]},
    ],
    component: lazy(() => import('../pages/component-demos/CardSelectorDemo')),
    propControls: [
      { name: 'card-count', label: 'Cards', controlType: 'counter', defaultValue: 3, min: 2, max: 6 },
      { name: 'rows', label: 'Rows', controlType: 'counter', defaultValue: 1, min: 1, max: 3 },
      { name: 'max-width', label: 'Max Width', controlType: 'range', defaultValue: 100, min: 30, max: 100, step: 5 },
      { name: 'show-description', label: 'Show Description', controlType: 'toggle', defaultValue: false },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    renderControls: (values, setValue) => {
      const cardCount = (values['card-count'] as number) ?? 3
      const defaultLabels = ['Importer', 'Exporter', 'Sync', 'Custom', 'Advanced', 'Archive']
      const defaultIcons = ['DownloadSimple', 'UploadSimple', 'CloudArrowUp', 'Folder', 'Database', 'Globe']
      const iconMap: Record<string, Icon> = { DownloadSimple, UploadSimple, CloudArrowUp, Folder, Database, Globe, Lightning, Gear }
      const iconOptions = [
        { value: 'DownloadSimple', label: '↓ Download' },
        { value: 'UploadSimple', label: '↑ Upload' },
        { value: 'CloudArrowUp', label: '☁ Cloud' },
        { value: 'Folder', label: '📁 Folder' },
        { value: 'Database', label: '⊞ Database' },
        { value: 'Globe', label: '⊕ Globe' },
        { value: 'Lightning', label: '⚡ Lightning' },
        { value: 'Gear', label: '⚙ Gear' },
      ]

      return (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Card Labels & Icons</span>
          {Array.from({ length: 6 }).map((_, i) => {
            const labelKey = `card-${i}-label`
            const iconKey = `card-${i}-icon`
            const label = (values[labelKey] as string) ?? defaultLabels[i]
            const currentIcon = (values[iconKey] as string) ?? defaultIcons[i]
            const isDisabled = i >= cardCount
            const CurrentIconComp = iconMap[currentIcon] ?? DownloadSimple

            return (
              <div key={i} className={`flex gap-1.5 ${isDisabled ? 'opacity-40' : ''}`}>
                <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden flex-1 focus-within:border-ring focus-within:shadow-ring">
                  <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">{i + 1}</span>
                  <input
                    value={label}
                    onChange={(e) => setValue(labelKey, e.target.value)}
                    disabled={isDisabled}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2 disabled:cursor-not-allowed"
                    placeholder={`Card ${i + 1}`}
                  />
                </div>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    const currentIdx = iconOptions.findIndex(o => o.value === currentIcon)
                    const nextIdx = (currentIdx + 1) % iconOptions.length
                    setValue(iconKey, iconOptions[nextIdx].value)
                  }}
                  className={`h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed`}
                  title="Click to cycle icon"
                >
                  <CurrentIconComp size={14} weight="regular" />
                </button>
              </div>
            )
          })}
        </div>
      )
    },
  },
  {
    name: 'MetricCard',
    slug: 'metric-card',
    category: 'display',
    description: 'Dashboard metric card with value, label, and trend indicator.',
    searchTerms: ['stat', 'kpi', 'number card', 'dashboard stat', 'metric tile', 'data point'],
    usesComponents: ['Card'],
    component: lazy(() => import('../pages/component-demos/MetricCardDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Dashboard KPI displays (total contacts, revenue, conversion rate)',
        'Summary statistics at the top of report pages',
        'Any numeric value that benefits from a trend indicator',
      ]},
      { heading: 'When NOT to use', content: [
        'Detailed data requiring tables — use DataTable',
        'Multiple data points in one view — use a chart or graph',
        'Non-numeric content — use Card directly',
      ]},
      { heading: 'States', content: [
        'With trend: shows up/down arrow with percentage change',
        'Without trend: value and label only',
        'Trend up: green indicator for positive change',
        'Trend down: red indicator for negative change',
      ]},
    ],
    propControls: [
      { name: 'showTrend', label: 'Show Trend', controlType: 'toggle', defaultValue: true },
      { name: 'trendDirection', label: 'Trend Direction', controlType: 'select', defaultValue: 'up', options: [
        { label: 'Up', value: 'up' },
        { label: 'Down', value: 'down' },
      ]},
    ],
  },
  {
    name: 'DataTable',
    slug: 'data-table',
    category: 'display',
    description: 'Generic sortable data table with density control, container styles, selection, striping, and empty state handling.',
    searchTerms: ['sortable table', 'data grid', 'list view', 'records', 'database table'],
    usesComponents: ['Table', 'Checkbox'],
    designGuidance: [
      { heading: 'When to use', content: [
        'Structured tabular data with optional column sorting (billing reports, user lists, audit logs)',
        'Data-driven tables where columns are defined programmatically',
        'Tables needing built-in selection, density, and sorting support',
      ]},
      { heading: 'When NOT to use', content: [
        'Tree/hierarchical data — use Table primitives directly',
        'Simple key-value display — use a description list',
        'Card-based layouts — use Card grid',
      ]},
      { heading: 'States', content: [
        'Density: compact (tight), default (standard), relaxed (generous spacing)',
        'Container: borderless (flush), bordered (visible boundary), card (elevated)',
        'Selectable: checkbox column with select-all/indeterminate, bulk action bar appears',
        'Sortable columns: asc → desc → unsorted cycle with direction arrow',
        'Empty: placeholder message when no data matches filters',
      ]},
    ],
    component: lazy(() => import('../pages/component-demos/DataTableDemo')),
  },
  {
    name: 'Toast',
    slug: 'toast',
    category: 'feedback',
    description: 'Notification helper using Sonner with UDS styling and variants.',
    searchTerms: ['notification', 'snackbar', 'flash', 'alert toast', 'success message'],
    component: lazy(() => import('../pages/component-demos/ToastDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Transient notifications after user actions (create, update, delete)',
        'Auto-dismissing feedback that doesn\'t require interaction',
      ]},
      { heading: 'When NOT to use', content: [
        'Critical errors that need acknowledgement — use Alert or AlertDialog',
        'Persistent information banners — use Alert',
        'Inline validation — use field-level error states',
      ]},
      { heading: 'States', content: [
        'Default: neutral toast notification',
        'Success: green accent — positive outcomes',
        'Error: red accent — failures',
        'Warning: amber accent — caution messages',
        'Info: blue accent — informational',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
      ]},
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Notification' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Something happened.' },
    ],
  },
  {
    name: 'Modal',
    slug: 'modal',
    category: 'feedback',
    description: 'Modal dialog pattern with ModalHeader (title + close) and ModalFooter (button slots) composed on shadcn Dialog.',
    searchTerms: ['dialog header', 'modal title', 'overlay header', 'modal footer', 'modal buttons', 'action bar'],
    usesComponents: ['Dialog', 'Button', 'Input', 'Label', 'Close Button'],
    component: lazy(() => import('../pages/component-demos/ModalDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Standard modals needing consistent header (title + close) and footer (action buttons) layout',
        'Always pair ModalHeader and ModalFooter inside a Dialog for consistent structure',
        'Forms, confirmation flows, or focused tasks that block the page',
      ]},
      { heading: 'When NOT to use', content: [
        'Destructive confirmations with guards — use AlertDialog',
        'Simple non-blocking feedback — use Sonner toast',
        'Side panels or slide-out content — use Sheet',
      ]},
      { heading: 'Layout', content: [
        'ModalFooter supports up to 3 action slots: primary (right CTA), secondary (cancel beside primary), tertiary (left-aligned, pushed with mr-auto)',
        'Returns null when no actions provided — safe to include unconditionally',
        'Dialog content wrapper has zero padding — each section manages its own spacing',
      ]},
    ],
    propControls: [
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'New Segment', section: 'Header' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Create a new audience segment.', section: 'Header' },
      { name: 'field-count', label: 'Form Fields', controlType: 'counter', defaultValue: 2, min: 1, max: 5, section: 'Body' },
      { name: 'show-footer', label: 'Show Footer', controlType: 'toggle', defaultValue: true, section: 'Footer' },
      { name: 'primary-label', label: 'Primary Button', controlType: 'text', defaultValue: 'Create', section: 'Footer' },
      { name: 'show-cancel', label: 'Show Cancel', controlType: 'toggle', defaultValue: true, section: 'Footer' },
      { name: 'primary-variant', label: 'Primary Variant', controlType: 'select', defaultValue: 'default', section: 'Footer', options: [
        { label: 'Default', value: 'default' },
        { label: 'Destructive', value: 'destructive' },
      ]},
    ],
  },
  {
    name: 'ModalFooter',
    slug: 'modal-footer',
    category: 'feedback',
    description: 'Standardised modal footer with primary, secondary, and optional tertiary action buttons in consistent right-aligned layout.',
    searchTerms: ['dialog footer', 'modal buttons', 'action bar', 'modal actions', 'footer buttons'],
    usesComponents: ['Button'],
    component: lazy(() => import('../pages/component-demos/ModalFooterDemo')),
    propControls: [
      { name: 'intent', label: 'Intent', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default (Green CTA)', value: 'default' },
        { label: 'Warning (Grey CTA)', value: 'warning' },
        { label: 'Destructive (Flipped — Red left)', value: 'destructive' },
      ]},
      { name: 'primary-label', label: 'Primary Label', controlType: 'text', defaultValue: 'Save' },
      { name: 'show-secondary', label: 'Show Cancel', controlType: 'toggle', defaultValue: true },
      { name: 'secondary-label', label: 'Cancel Label', controlType: 'text', defaultValue: 'Cancel' },
      { name: 'show-tertiary', label: 'Show Tertiary (left)', controlType: 'toggle', defaultValue: false },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'All modals/dialogs that need action buttons (confirm, cancel, etc.)',
      ]},
      { heading: 'When NOT to use', content: [
        'Full-page forms — use inline buttons',
        'Wizard footers — use WizardNavButtons',
      ]},
      { heading: 'States', content: [
        'Primary can be any Button variant',
        'Secondary defaults to ghost',
        'Tertiary aligns left (mr-auto)',
      ]},
    ],
  },
  {
    name: 'ModalHeader',
    slug: 'modal-header',
    category: 'feedback',
    description: 'Standardised modal header with title, optional description, and close button.',
    searchTerms: ['dialog header', 'modal title', 'overlay header', 'modal heading'],
    component: lazy(() => import('../pages/component-demos/ModalHeaderDemo')),
    propControls: [
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Modal Title' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Optional description text' },
      { name: 'show-close', label: 'Show Close', controlType: 'toggle', defaultValue: true },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'All modals/dialogs as the first child of DialogContent',
      ]},
      { heading: 'When NOT to use', content: [
        'Inline sections or page headers — use PageShell or section headings',
      ]},
      { heading: 'States', content: [
        'Default with close button',
        'Without close button (onClose omitted)',
      ]},
    ],
  },
  // Compositions (multi-component patterns that orchestrate flows)
  {
    name: 'Stepper',
    slug: 'stepper',
    category: 'compositions',
    description: 'Sequential step indicator with vertical and horizontal orientations.',
    searchTerms: ['progress', 'steps', 'wizard progress', 'multi-step', 'step indicator'],
    component: lazy(() => import('../pages/component-demos/StepperDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Multi-step wizard flows showing progress through sequential stages',
        'Checkout or onboarding processes with distinct phases',
        'Any flow where users need to know where they are and what comes next',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple progress with a percentage — use Progress bar',
        'Non-linear navigation — use Tabs instead',
        'Chronological event history — use Timeline',
      ]},
      { heading: 'States', content: [
        'Completed steps: checkmark icon with success styling',
        'Current step: highlighted as active',
        'Upcoming steps: muted/inactive styling',
        'Horizontal: steps flow left to right',
        'Vertical: steps flow top to bottom with optional descriptions',
      ]},
    ],
    propControls: [
      { name: 'orientation', label: 'Orientation', controlType: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ]},
      { name: 'max-width', label: 'Max Width', controlType: 'range', defaultValue: 100, min: 10, max: 100, step: 5 },
      { name: 'descriptions', label: 'Descriptions', controlType: 'toggle', defaultValue: true },
    ],
    renderControls: (values, setValue) => {
      const currentStep = (values['current-step'] as number) ?? 0
      const stepCount = 4
      const labels = Array.from({ length: stepCount }, (_, i) =>
        (values[`step-${i}-label`] as string) ?? ['Details', 'Configuration', 'Review', 'Complete'][i]
      )

      return (
        <>
          {/* Step navigation */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Step {currentStep + 1} of {stepCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setValue('current-step', Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setValue('current-step', Math.min(stepCount - 1, currentStep + 1))}
                disabled={currentStep === stepCount - 1}
                className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Label editors */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Labels</span>
            <div className="space-y-2">
              {labels.map((label, i) => (
                <div key={i} className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-ring">
                  <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">{i + 1}</span>
                  <input
                    value={label}
                    onChange={(e) => setValue(`step-${i}-label`, e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )
    },
  },
  {
    name: 'SplitButton',
    slug: 'split-button',
    category: 'inputs',
    description: 'Button with primary action and dropdown menu for secondary actions.',
    searchTerms: ['dropdown button', 'button menu', 'action dropdown', 'multi action button'],
    usesComponents: ['Button', 'DropdownMenu'],
    component: lazy(() => import('../pages/component-demos/SplitButtonDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'A clear primary action with related alternatives (e.g. "Save" with "Save as draft", "Save and close")',
        'Reducing button clutter when one action dominates but variants exist',
      ]},
      { heading: 'When NOT to use', content: [
        'Unrelated actions grouped together — use separate buttons',
        'Only one action — use a standard Button',
        'Many equal-priority actions — use a DropdownMenu with a single trigger',
      ]},
      { heading: 'States', content: [
        'Default: primary action button + caret dropdown trigger',
        'Dropdown open: menu appears below with secondary actions',
        'Disabled: both sections disabled',
      ]},
    ],
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Save' },
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
      ]},
      { name: 'option-count', label: 'Options', controlType: 'counter', defaultValue: 2, min: 1, max: 4 },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'PageHeader',
    slug: 'page-header',
    category: 'sandboxes',
    description: 'Configurable page header with breadcrumbs, title, status badge, actions, tabs, filters, and bulk actions.',
    searchTerms: ['page title', 'header bar', 'page top', 'title bar', 'filter bar', 'bulk actions'],
    demoLayout: 'full-bleed',
    usesComponents: ['Button', 'Badge', 'Tabs', 'Input', 'Breadcrumb'],
    component: lazy(() => import('../pages/component-demos/PageHeaderDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Exploring and standardising page header layouts across the product',
        'Configuring combinations of breadcrumbs, titles, actions, tabs, and filters',
      ]},
      { heading: 'When NOT to use', content: [
        'Production pages — compose the header directly using individual components',
        'This is a design exploration sandbox, not a reusable component',
      ]},
      { heading: 'Layout', content: [
        'Breadcrumbs → Title row (title + status + actions) → Tabs → Filters → Bulk actions',
        'Spacing between sections is configurable to establish consistent rhythm',
        'Body layout options: dashboard metrics, data table, card list, empty state',
      ]},
    ],
    propControls: [
      { name: 'breadcrumb-count', label: 'Breadcrumbs', controlType: 'counter', defaultValue: 3, min: 0, max: 3, section: 'Structure' },
      { name: 'show-subtitle', label: 'Subtitle', controlType: 'toggle', defaultValue: true, section: 'Structure' },
      { name: 'show-status', label: 'Status Badge', controlType: 'toggle', defaultValue: true, section: 'Structure' },
      { name: 'status', label: 'Status', controlType: 'select', defaultValue: 'Active', section: 'Structure', visibleWhen: { controlName: 'show-status', values: [true] }, options: [
        { label: 'Active', value: 'Active' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Paused', value: 'Paused' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Error', value: 'Error' },
      ]},
      { name: 'show-primary-action', label: 'Primary Action', controlType: 'toggle', defaultValue: true, section: 'Actions' },
      { name: 'show-secondary-action', label: 'Secondary Action', controlType: 'toggle', defaultValue: true, section: 'Actions' },
      { name: 'tab-count', label: 'Tabs', controlType: 'counter', defaultValue: 3, min: 0, max: 5, section: 'Navigation' },
      { name: 'filter-count', label: 'Filters', controlType: 'counter', defaultValue: 3, min: 0, max: 4, section: 'Navigation' },
      { name: 'show-search', label: 'Search', controlType: 'toggle', defaultValue: true, section: 'Navigation' },
      { name: 'bulk-count', label: 'Bulk Selection', controlType: 'counter', defaultValue: 0, min: 0, max: 10, section: 'Navigation' },
      { name: 'body-layout', label: 'Body Layout', controlType: 'select', defaultValue: 'none', section: 'Body', options: [
        { label: 'None', value: 'none' },
        { label: 'Dashboard (Metrics)', value: 'dashboard' },
        { label: 'Data Table', value: 'table' },
        { label: 'Card List', value: 'cards' },
        { label: 'Empty State', value: 'empty' },
      ]},
      { name: 'gap-nav-breadcrumb', label: 'Nav → Breadcrumb', controlType: 'range', defaultValue: 16, min: 0, max: 32, step: 4, section: 'Spacing' },
      { name: 'gap-breadcrumb-title', label: 'Breadcrumb → Title', controlType: 'range', defaultValue: 8, min: 0, max: 24, step: 4, section: 'Spacing' },
      { name: 'gap-title-tabs', label: 'Title → Tabs', controlType: 'range', defaultValue: 16, min: 0, max: 32, step: 4, section: 'Spacing' },
    ],
  },
  {
    name: 'SegmentedControl',
    slug: 'segmented-control',
    category: 'inputs',
    description: 'Single-select toggle with border-separated segments. Active state uses teal text with bottom border accent.',
    searchTerms: ['toggle group', 'button group', 'option toggle', 'switcher', 'segmented buttons'],
    component: lazy(() => import('../pages/component-demos/SegmentedControlDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        '2–5 mutually exclusive text-based options (view modes, filter toggles)',
        'Compact inline selectors where a dropdown is too heavy',
        'Switching between modes or views within a panel',
      ]},
      { heading: 'When NOT to use', content: [
        'More than 5 options — use Select or Tabs instead',
        'Options that need icons or descriptions — use CardSelector',
        'Multi-select — use ToggleGroup or Checkbox group',
      ]},
      { heading: 'States', content: [
        'Active segment: teal text with bottom border accent',
        'Inactive segments: neutral text, clickable',
        'Fit-to-text mode: segments size to content width',
        'Equal-width mode: all segments share available space equally',
      ]},
    ],
    propControls: [
      { name: 'option-count', label: 'Options', controlType: 'range', defaultValue: 3, min: 2, max: 5, step: 1 },
      { name: 'fit-to-text', label: 'Fit to Text', controlType: 'toggle', defaultValue: false },
      { name: 'max-width', label: 'Max Width', controlType: 'range', defaultValue: 100, min: 30, max: 100, step: 5 },
    ],
    renderControls: (values, setValue) => {
      const optionCount = (values['option-count'] as number) ?? 3
      const inputs: ReactNode[] = []
      for (let i = 0; i < 5; i++) {
        const key = `label-${i}`
        const val = (values[key] as string) ?? ''
        inputs.push(
          <div key={i} className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-ring">
            <span className={`shrink-0 text-xs select-none bg-secondary px-2 self-stretch flex items-center border-r border-input ${i < optionCount ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>{i + 1}</span>
            <input
              value={val}
              onChange={(e) => setValue(key, e.target.value)}
              disabled={i >= optionCount}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        )
      }
      return (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Labels</span>
          {inputs}
        </div>
      )
    },
  },
  {
    name: 'NumberStepper',
    slug: 'number-stepper',
    category: 'inputs',
    description: 'Compact numeric input with decrement/value/increment buttons. Toggle variant colours the value teal when active. Plain variant shows neutral numbers.',
    searchTerms: ['counter', 'increment', 'decrement', 'numeric input', 'plus minus', 'quantity'],
    usesComponents: [],
    designGuidance: [
      { heading: 'When to use', content: [
        'Small integer ranges with tight bounds (1–10)',
        'Prefer over a text input when the range is small and predictable',
        'Prefer over a slider when exact values matter more than relative position',
      ]},
      { heading: 'When NOT to use', content: [
        'Large numeric ranges — use Slider instead',
        'Free-form numeric input — use Input type="number"',
        'Continuous values where precision isn\'t needed — use Slider',
      ]},
      { heading: 'States', content: [
        'Plain variant: neutral foreground text — value is always meaningful (column count)',
        'Toggle variant: teal text when value > min, muted at min — 0 = off, 1+ = on',
        'Default (h-9), Small (h-7), XS (h-5) sizes for different contexts',
        'Disabled: muted, no interaction',
        'At bounds: respective button disabled',
      ]},
    ],
    component: lazy(() => import('../pages/component-demos/NumberStepperDemo')),
    propControls: [
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default (h-9 / 36px)', value: 'default' },
        { label: 'Small (h-7 / 28px)', value: 'sm' },
        { label: 'XS (h-5 / 20px)', value: 'xs' },
      ]},
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'plain', options: [
        { label: 'Plain (magnitude)', value: 'plain' },
        { label: 'Toggle (on/off)', value: 'toggle' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    renderControls: (values, setValue) => (
      <>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Bounds</span>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-ring">
            <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Min</span>
            <input
              type="number"
              value={Number(values['bounds-min'] ?? 0)}
              onChange={(e) => setValue('bounds-min', Number(e.target.value))}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
            />
          </div>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-ring">
            <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Max</span>
            <input
              type="number"
              value={Number(values['bounds-max'] ?? 10)}
              onChange={(e) => setValue('bounds-max', Number(e.target.value))}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
            />
          </div>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-ring">
            <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Step</span>
            <input
              type="number"
              value={Number(values['bounds-step'] ?? 1)}
              onChange={(e) => setValue('bounds-step', Math.max(1, Number(e.target.value)))}
              min={1}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
            />
          </div>
        </div>
      </>
    ),
  },
  {
    name: 'Chip',
    slug: 'chip',
    category: 'inputs',
    description: 'Interactive label with optional dismiss button, icon, selectable state, and insertable token variant. Used for tags, filters, multi-select values, and variable insertion.',
    searchTerms: ['tag', 'pill', 'removable tag', 'filter chip', 'token', 'insert variable'],
    usedIn: [{ label: 'ChipInput', route: '/admin/components/inputs/chip-input' }, { label: 'Exporter File Naming', route: '/' }],
    component: lazy(() => import('../pages/component-demos/ChipDemo')),
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Mint', value: 'mint' },
        { label: 'Red', value: 'red' },
        { label: 'Insertable', value: 'insertable' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Small (h-6 / 24px)', value: 'sm' },
        { label: 'Default (h-7 / 28px)', value: 'default' },
      ]},
      { name: 'show-icon', label: 'Show Icon', controlType: 'toggle', defaultValue: false },
      { name: 'selectable', label: 'Selectable', controlType: 'toggle', defaultValue: false },
      { name: 'used', label: 'Used (insertable)', controlType: 'toggle', defaultValue: false, visibleWhen: { controlName: 'variant', values: ['insertable'] } },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    designGuidance: [
      {
        heading: 'When to use',
        content: [
          'Removable tags in multi-select inputs (e.g. selected fields in an importer mapping)',
          'Email address entries in recipient fields with dismiss to remove',
          'Filter pills in filter bars where users toggle criteria on/off',
          'Insertion tokens / merge tags in template builders (variant="insertable")',
          'Status labels where colour semantics communicate meaning (mint = success, red = error)',
        ],
      },
      {
        heading: 'When NOT to use',
        content: [
          'Navigation — use Button or Link instead',
          'Counts or indicators — use Badge component instead',
          'Static labels that cannot be dismissed or selected — use Badge with appropriate variant',
        ],
      },
      {
        heading: 'States',
        content: [
          'Default variant: neutral grey background — general-purpose tags and filters',
          'Outline variant: transparent with border — lighter weight in dense lists',
          'Mint variant: green-tinted — success/positive status',
          'Red variant: red-tinted — error/destructive status',
          'Insertable variant: light mint when available, grey when used, teal fill on hover',
          'Selected: solid fill with white text',
          'Disabled: muted, no pointer events',
          'Default size (h-7): standard usage; Small size (h-6): compact contexts',
        ],
      },
      {
        heading: 'Accessibility',
        content: [
          'Renders as <button> when onClick is provided (keyboard focusable with Enter/Space activation)',
          'Renders as <span> without onClick — selection managed by parent container',
          'Dismiss button has its own aria-label ("Remove {label}") for screen reader clarity',
        ],
      },
    ],
  },
  {
    name: 'ChooserModal',
    slug: 'chooser-modal',
    category: 'compositions',
    description: 'Centred selection modal for picking from 2–4 options before proceeding. Uses CardSelector grid with icon header, title, and description.',
    searchTerms: ['selection modal', 'chooser', 'type picker', 'option selector modal'],
    usesComponents: ['Dialog', 'CardSelector', 'Button'],
    component: lazy(() => import('../pages/component-demos/ChooserModalDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'First step of a wizard where the user picks a type/category before proceeding',
        '2–4 options that benefit from icon + description cards for clarity',
        'Branching flows where the choice determines the next step',
      ]},
      { heading: 'When NOT to use', content: [
        'More than 4 options — use a list or CardSelector on a page instead',
        'Inline selection without blocking — use CardSelector directly',
        'Simple binary choice — use AlertDialog or a radio group',
      ]},
    ],
    propControls: [
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Select Connection Type' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Select the protocol your data source uses to connect with UbiQuity.' },
      { name: 'option-count', label: 'Options', controlType: 'counter', defaultValue: 3, min: 2, max: 4 },
      { name: 'confirm-label', label: 'Confirm Label', controlType: 'text', defaultValue: 'Next' },
    ],
  },
  {
    name: 'Timeline',
    slug: 'timeline',
    category: 'compositions',
    description: 'Vertical timeline with connected entries. Each entry has a coloured icon circle, a connector line to the next entry, and content with a date.',
    searchTerms: ['history', 'audit log', 'events', 'chronological', 'activity feed'],
    usesComponents: [],
    component: lazy(() => import('../pages/component-demos/TimelineDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Chronological event history — audit logs, activity feeds, lifecycle displays',
        'Each entry represents a discrete event with an icon, description, and timestamp',
      ]},
      { heading: 'When NOT to use', content: [
        'Step-by-step progress or wizard flows — use Stepper instead',
        'Non-chronological lists — use a standard list or table',
      ]},
      { heading: 'States', content: [
        'Each entry has a coloured icon circle and connector line to the next entry',
        'Icon colours use semantic meaning: primary for positive, warning for pauses, error for destructive, info for neutral',
        'Optional iconBorder for outline-style entries needing distinction without filled background',
      ]},
    ],
    propControls: [
      { name: 'entryCount', label: 'Entries', controlType: 'counter', defaultValue: 6, min: 1, max: 6 },
    ],
  },
  {
    name: 'Controls Panel',
    slug: 'controls-panel',
    category: 'compositions',
    description: 'Declarative controls panel that renders interactive controls from a PropDefinition array. Supports 11 control types, section grouping, conditional visibility, and custom render slots.',
    searchTerms: ['prop panel', 'settings panel', 'control panel', 'configuration', 'property editor'],
    usesComponents: ['Select', 'Switch', 'Slider', 'Input'],
    component: lazy(() => import('../pages/component-demos/ControlsPanelDemo')),
    usedIn: [{ label: 'All Component Demos', route: '/component-library' }],
    propControls: [
      { name: 'mode', label: 'Mode', controlType: 'select', defaultValue: 'sectioned', options: [
        { label: 'All Controls', value: 'all-controls' },
        { label: 'Sectioned', value: 'sectioned' },
        { label: 'Conditional', value: 'conditional' },
      ]},
      { name: 'show-used-in', label: 'Show Used In', controlType: 'toggle', defaultValue: true },
      { name: 'spacing', label: 'Section Spacing', controlType: 'select', defaultValue: '16px', section: 'Layout', options: [
        { label: '8px (Tight)', value: '8px' },
        { label: '12px (Compact)', value: '12px' },
        { label: '16px (Default)', value: '16px' },
        { label: '20px (Relaxed)', value: '20px' },
        { label: '24px (Spacious)', value: '24px' },
      ]},
      { name: 'show-dividers', label: 'Section Dividers', controlType: 'toggle', defaultValue: true, section: 'Layout' },
    ],
  },
  {
    name: 'SectionDivider',
    slug: 'section-divider',
    category: 'atoms',
    description: 'Labelled horizontal divider for separating logical sections in modals and forms. Supports a centred line variant and a left-aligned heading variant.',
    searchTerms: ['section header', 'form divider', 'group separator', 'labelled line'],
    component: lazy(() => import('../pages/component-demos/SectionDividerDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Separating logical field groups in single-step modals and dialogs',
        '"Line" variant when sections are visually equal (Connection Settings, Authentication)',
        '"Heading" variant for longer forms where sections need stronger left-aligned hierarchy',
      ]},
      { heading: 'When NOT to use', content: [
        'Inside wizard steps — those follow the three-tier form rhythm pattern',
        'Plain line without a label — use the Separator component instead',
        'Page-level section breaks — use heading elements',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'line', options: [
        { label: 'Line (centred)', value: 'line' },
        { label: 'Heading (left-aligned)', value: 'heading' },
      ]},
      { name: 'sections', label: 'Sections', controlType: 'counter', defaultValue: 2, options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ]},
      { name: 'label1', label: 'Label 1', controlType: 'text', defaultValue: 'Connection Settings' },
      { name: 'label2', label: 'Label 2', controlType: 'text', defaultValue: 'Authentication' },
      { name: 'label3', label: 'Label 3', controlType: 'text', defaultValue: 'Notifications', visibleWhen: { prop: 'sections', equals: 3 } },
    ],
  },
  {
    name: 'StatusBadge',
    slug: 'status-badge',
    category: 'atoms',
    description: 'Semantic status indicator badge with predefined colour mappings for common states (active, paused, error, etc.).',
    searchTerms: ['status', 'state indicator', 'active badge', 'error badge', 'status pill', 'automation status'],
    component: lazy(() => import('../pages/component-demos/StatusBadgeDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Indicating entity state (active/paused/error)',
        'Automation run status, connection health',
      ]},
      { heading: 'When NOT to use', content: [
        'Categorisation or tagging — use Badge instead',
        'Counts — use number badge',
      ]},
      { heading: 'States', content: [
        'Active (green): entity is live and operational',
        'Invited (blue): pending acceptance or activation',
        'Inactive (neutral): paused or disabled',
        'Error (red): failed or disconnected',
      ]},
    ],
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'active', options: [
        { label: 'Active', value: 'active' },
        { label: 'Invited', value: 'invited' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Error', value: 'error' },
      ]},
      { name: 'text', label: 'Text', controlType: 'text', defaultValue: 'Active' },
    ],
  },
  {
    name: 'PrefixInput',
    slug: 'prefix-input',
    category: 'inputs',
    description: 'Input field with a non-editable prefix. Used for paths, URLs, or any value with a fixed base.',
    searchTerms: ['url input', 'path input', 'domain input', 'prefixed field', 'base path'],
    usesComponents: ['Input'],
    designGuidance: [
      { heading: 'When to use', content: [
        'Values with a known, non-editable prefix (URL base path, file path root, domain)',
        'Prefer over disabled input + label when the prefix is structural context',
      ]},
      { heading: 'When NOT to use', content: [
        'Editable prefixes or suffixes — use Input with adornments instead',
        'No fixed prefix — use standard Input',
      ]},
    ],
    component: lazy(() => import('../pages/component-demos/PrefixInputDemo')),
    propControls: [
      { name: 'prefix', label: 'Prefix', controlType: 'text', defaultValue: '/company/base-path/' },
      { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'e.g. daily-export' },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'ChipInput',
    slug: 'chip-input',
    category: 'inputs',
    description: 'Multi-value text input. Type and press Enter, Tab, or comma to add chips. Shows a validation pill below the input (green when valid, red when invalid). Supports dropdown selection, clear-all, copy-from-above, and three sizes.',
    searchTerms: ['tag input', 'multi value', 'email input', 'token input', 'multi entry'],
    usesComponents: [],
    designGuidance: [
      { heading: 'When to use', content: [
        'Multi-value free-text entry (emails, tags, keywords)',
        'Constrained multi-select from a predefined list (with options prop)',
        'Prefer over multi-select dropdown when all selected values should remain visible',
      ]},
      { heading: 'When NOT to use', content: [
        'Single-value selection — use Select or Combobox instead',
        'Long option lists where search is important — use Combobox',
        'Static display of tags — use Badge or Chip without input',
      ]},
      { heading: 'States', content: [
        'Empty: bordered container with placeholder text',
        'With chips: pills inside container with inline text input',
        'Validation pill: green when valid, red when invalid — appears below input',
        'Dropdown (optional): absolute list of remaining selectable options',
        'sm (min-h-8), default (min-h-10), lg (min-h-12) sizes',
      ]},
      { heading: 'Accessibility', content: [
        'Enter, Tab, or comma commits current input as a chip',
        'Backspace on empty input removes the last chip',
        'Clear-all button visible when chips exist',
      ]},
    ],
    component: lazy(() => import('../pages/component-demos/ChipInputDemo')),
    propControls: [
      { name: 'placeholder', label: 'Placeholder', controlType: 'text', defaultValue: 'Add email…' },
      { name: 'type', label: 'Input Type', controlType: 'select', defaultValue: 'email', options: [
        { label: 'Email', value: 'email' },
        { label: 'Text', value: 'text' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Default', value: 'default' },
        { label: 'Large', value: 'lg' },
      ]},
      { name: 'validation', label: 'Validation Pill', controlType: 'toggle', defaultValue: true },
      { name: 'dropdown', label: 'Dropdown Options', controlType: 'toggle', defaultValue: false },
      { name: 'copy-from-above', label: 'Copy From Above', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'DateRangePicker',
    slug: 'date-range-picker',
    category: 'inputs',
    description: 'Date range selector combining Calendar (range mode) with preset shortcuts. Uses Popover for the floating panel and Button for the trigger.',
    searchTerms: ['date range', 'period selector', 'from to date', 'date filter', 'range picker'],
    usesComponents: ['Button', 'Calendar', 'Popover'],
    component: lazy(() => import('../pages/component-demos/DateRangePickerDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Date range filters where presets speed up common selections',
        'Pass domain-specific presets (billing cycles, quarters, months)',
        'Reporting and analytics date filtering',
      ]},
      { heading: 'When NOT to use', content: [
        'Single date selection — use Calendar component directly',
        'Relative period selection without calendar (e.g. "Last 7 days" toggle) — use SegmentedControl or Select',
      ]},
      { heading: 'States', content: [
        'Closed: outline Button trigger showing formatted date range',
        'Open: Popover with Calendar (left) + presets list (right)',
        'Range selected: filled teal circles on start/end with accent span between',
        'Active preset: teal text + semibold weight in presets list',
        'Panel auto-closes when a complete range is selected',
      ]},
    ],
    propControls: [
      { name: 'showPresets', label: 'Show Presets', controlType: 'toggle', defaultValue: true },
      { name: 'presetCount', label: 'Preset Count', controlType: 'counter', defaultValue: 5, options: [
        { label: '3', value: '3' },
        { label: '5', value: '5' },
        { label: '10', value: '10' },
      ]},
    ],
  },
  {
    name: 'HelpPopover',
    slug: 'help-popover',
    category: 'feedback',
    description: 'Teal circle with ? that opens a Popover with a title and body. Used inline next to field labels for contextual help.',
    searchTerms: ['info popup', 'help icon', 'question mark', 'contextual help', 'tooltip help'],
    usesComponents: ['Popover'],
    component: lazy(() => import('../pages/component-demos/HelpPopoverDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Contextual help next to field labels or section headings',
        'Explaining concepts that need more than a single-line tooltip',
        'Inline "?" triggers for documentation-style help content',
      ]},
      { heading: 'When NOT to use', content: [
        'Simple one-line hints — use Tooltip instead',
        'Lengthy documentation — link to a help page or documentation',
        'Form validation messages — use inline error/success states',
      ]},
    ],
    propControls: [
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'How does this work?' },
      { name: 'body', label: 'Body', controlType: 'textarea', defaultValue: 'This is a help popover that provides contextual information to the user.' },
      { name: 'side', label: 'Side', controlType: 'select', defaultValue: 'bottom', options: [
        { label: 'Top', value: 'top' },
        { label: 'Right', value: 'right' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
      ]},
      { name: 'align', label: 'Align', controlType: 'select', defaultValue: 'start', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
      ]},
    ],
  },
  {
    name: 'DayPicker',
    slug: 'day-picker',
    category: 'inputs',
    description: 'Seven circular day-of-week toggle buttons (Mon–Sun). Selected days are filled primary, unselected have a 1px primary outline.',
    searchTerms: ['weekday picker', 'day selector', 'schedule days', 'recurring days'],
    component: lazy(() => import('../pages/component-demos/DayPickerDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Selecting recurring days of the week (e.g. schedule automation on Mon/Wed/Fri)',
        'Configuration of weekly schedules or frequency settings',
      ]},
      { heading: 'When NOT to use', content: [
        'Picking a specific calendar date — use Calendar instead',
        'Date range selection — use DateRangePicker',
        'Single day selection from a list — use Select or RadioGroup',
      ]},
      { heading: 'States', content: [
        'Selected: filled primary circle',
        'Unselected: 1px primary outline circle',
        'Disabled: muted, no interaction',
        'Presets: weekdays, weekend, all, none for quick selection',
      ]},
    ],
    propControls: [
      { name: 'preset', label: 'Preset', controlType: 'select', defaultValue: 'custom', options: [
        { label: 'Custom', value: 'custom' },
        { label: 'Weekdays', value: 'weekdays' },
        { label: 'Weekend', value: 'weekend' },
        { label: 'All', value: 'all' },
        { label: 'None', value: 'none' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'CheckboxCard',
    slug: 'checkbox-card',
    category: 'inputs',
    description: 'Selectable card with a checkbox indicator for multi-select patterns. Renders as a button with role="checkbox" for accessibility.',
    searchTerms: ['multi select card', 'selectable card', 'toggle card', 'check card'],
    component: lazy(() => import('../pages/component-demos/CheckboxCardDemo')),
    usesComponents: [],
    usedIn: [{ label: 'Exporter Wizard — Data Source', route: '/' }],
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Option label' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Optional description text' },
      { name: 'selected', label: 'Selected', controlType: 'toggle', defaultValue: false },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    designGuidance: [
      { heading: 'When to use', content: [
        'Multi-select option lists (data sources, permissions, feature toggles)',
        'Any scenario where the user picks one or more items from a bounded set',
      ]},
      { heading: 'When NOT to use', content: [
        'Single-select — use CardSelector or SegmentedControl instead',
        'Simple boolean toggles — use Switch instead',
        'Long lists (10+) — use a Checkbox list or multi-select dropdown',
      ]},
      { heading: 'Visual states', content: [
        'Unselected: border-border, bg-background, hover shows border-primary + bg-accent/25 (border tints teal to hint interactivity)',
        'Selected: border-primary, bg-accent, shadow-sm (subtle tinted fill to reinforce selection). Hover darkens to bg-accent/75 for continued interactivity feedback.',
        'Unselected checkbox: 1px border (lighter visual weight); selected: 2px border + filled primary bg. Checkbox border tints teal on card hover to match the card border hint.',
        'Disabled: 50% opacity, cursor-not-allowed, hover suppressed (text reverts to foreground)',
        'Focus: 2px teal ring with 2px offset (focus-visible only)',
      ]},
      { heading: 'Accessibility', content: [
        'Renders as button with role="checkbox" and aria-checked',
        'aria-label set to the label text for screen readers',
        'Focus ring visible on keyboard navigation only (focus-visible)',
      ]},
      { heading: 'Motion', content: [
        'All colour/border transitions use 150ms duration per docs/ui/motion.md',
      ]},
    ],
  },
]
