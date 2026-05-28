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
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Typography',
    slug: 'typography',
    category: 'tokens',
    description: 'Font families, sizes, weights, and text styles used across the system.',
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Shadows',
    slug: 'shadows',
    category: 'tokens',
    description: 'Elevation levels using Tailwind shadow utilities.',
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Spacing',
    slug: 'spacing',
    category: 'tokens',
    description: 'Spacing scale mapped to Tailwind gap/space-y classes with usage context.',
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Radius',
    slug: 'radius',
    category: 'tokens',
    description: 'Border radius tokens for corners and rounded elements.',
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Sizing & Borders',
    slug: 'sizing',
    category: 'tokens',
    description: 'Component heights, container widths, and semantic border colours.',
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },
  {
    name: 'Icons',
    slug: 'icons',
    category: 'tokens',
    description: 'Phosphor icon library browser with search and category filtering.',
    component: lazy(() => import('../pages/component-demos/TokenSubPage')),
  },

  // Inputs
  {
    name: 'Button',
    slug: 'shadcn-button',
    category: 'inputs',
    description: 'Accessible button with variants: default, destructive, destructiveOutline, outline, secondary, secondaryOutline, ghost, link.',
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
      { heading: 'What', content: 'Primary interactive element for triggering actions. Uses CVA for variant/size composition and Radix Slot for polymorphic rendering via asChild.' },
      { heading: 'When to use', content: [
        'Any clickable action that is not a navigation link',
        'Form submissions, modal triggers, toolbar actions, inline actions',
      ]},
      { heading: 'When NOT to use', content: [
        'Navigation between pages — use a Link or anchor instead (or Button with asChild wrapping a Link)',
        'Toggle states — use a Toggle or SegmentedControl',
      ]},
      { heading: 'Variant guidance', content: [
        'default (teal solid): Primary CTA — one per section max',
        'destructive (red solid): Irreversible or dangerous actions (delete, remove)',
        'destructiveOutline (red border, transparent bg): Destructive action needing less visual weight — "Fix connection", inline remove buttons, secondary destructive alongside a solid primary',
        'outline (teal border, transparent bg): Prominent secondary — "Add new", "Export"',
        'secondary (dark solid): Strong secondary alongside a primary — use sparingly',
        'secondaryOutline (border-strong, transparent bg): Low-emphasis — cancel, filter toggles, toolbar actions. Uses border-strong token for a mid-weight outline that reads clearly against light surfaces without competing with primary teal.',
        'ghost (no bg until hover): Minimal — icon-only buttons, inline actions where a border adds noise',
        'link (underline on hover): Inline text links styled as buttons',
      ]},
      { heading: 'Size guidance', content: [
        'sm (h-8 / 32px): Compact contexts — table rows, filter bars, inline actions',
        'default (h-9 / 36px): Standard usage — forms, modals, page actions',
        'lg (h-10 / 40px): Hero CTAs, modal primary actions, onboarding',
        'icon (h-9 / 36px square): Icon-only buttons — close, settings, overflow menus',
      ]},
      { heading: 'Interaction patterns', content: [
        'Solid variants use active:scale-95 for tactile click feedback',
        'Outline variant uses active:translate-y-px for a subtle press effect',
        'Disabled state strips colour and adds opacity uniformly across all variants',
      ]},
    ],
  },
  {
    name: 'Close Button',
    slug: 'close-button',
    category: 'atoms',
    description: 'Accessible close/dismiss button with size variants, used for modals, panels, banners, and dialogs.',
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
    usedIn: [
      { label: 'Sheet', route: '/admin/components/feedback/sheet' },
      { label: 'AlertDialog', route: '/admin/components/feedback/alert-dialog' },
      { label: 'Modal', route: '/admin/components/feedback/modal' },
    ],
  },
  {
    name: 'Calendar',
    slug: 'calendar',
    category: 'inputs',
    description: 'Date picker calendar grid with month navigation.',
    usesComponents: ['Button'],
    component: lazy(() => import('../pages/component-demos/CalendarDemo')),
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
      { heading: 'What it is', content: 'A controlled checkbox built on Radix UI primitives supporting checked, unchecked, and indeterminate states.' },
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
      { heading: 'Variants', content: [
        'primary (default) — teal border and fill. Use for standard form checkboxes, filters, and preference lists.',
        'secondary — dark neutral border and fill (matches secondary button). Use inside warning/destructive dialogs where teal clashes with the intent colour, or for high-contrast contexts like table header select-all controls.',
      ]},
      { heading: 'Indeterminate state', content: 'Pass checked="indeterminate" for partial-selection indicators. Renders a bold minus icon. Commonly used for "select all" when only some children are checked.' },
      { heading: 'Pairing with Label', content: 'Always pair with a Label component for accessibility. The label should be clickable and linked via htmlFor.' },
    ],
  },
  {
    name: 'Input',
    slug: 'input',
    category: 'inputs',
    description: 'Text input field with consistent styling and focus ring.',
    component: lazy(() => import('../pages/component-demos/InputDemo')),
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
    component: lazy(() => import('../pages/component-demos/InputOTPDemo')),
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
    component: lazy(() => import('../pages/component-demos/LabelDemo')),
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
    usesComponents: ['Label'],
    component: lazy(() => import('../pages/component-demos/RadioGroupDemo')),
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
    name: 'Select',
    slug: 'select',
    category: 'inputs',
    description: 'Accessible select dropdown with search and keyboard navigation.',
    component: lazy(() => import('../pages/component-demos/SelectDemo')),
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
      { heading: 'What', content: 'Searchable single-select dropdown built on Radix Popover. Provides type-ahead filtering for long option lists while matching the standard input height (h-9).' },
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
      { heading: 'Status variants', content: [
        'normal: Default border with standard focus ring',
        'warning: Amber border and focus ring — validation hint (e.g. "recommended but not required")',
        'error: Red border and focus ring — validation failure',
      ]},
      { heading: 'Interaction patterns', content: [
        'Search resets on close to avoid stale filter state on reopen',
        'Popover width matches trigger via --radix-popover-trigger-width',
        'Check icon + font-medium on selected item for clear active indication',
        'Controlled only (value + onValueChange) — no uncontrolled mode',
      ]},
    ],
  },
  {
    name: 'Slider',
    slug: 'slider',
    category: 'inputs',
    description: 'Range input for selecting numeric values.',
    component: lazy(() => import('../pages/component-demos/SliderDemo')),
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
    usesComponents: ['Label'],
    component: lazy(() => import('../pages/component-demos/SwitchDemo')),
    designGuidance: [
      { heading: 'Sizes', content: [
        'Default (h-6 w-11) — standard forms and settings pages',
        'Small (h-5 w-9) — controller panels, compact settings, table rows',
        'XS (h-4 w-7) — inline toggles in very tight spaces',
      ]},
      { heading: 'When to use', content: [
        'Binary on/off states where the result is immediate (no submit button needed)',
        'Prefer over Checkbox when the toggle takes effect immediately',
        'Prefer Checkbox when the change requires a form submission',
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
    component: lazy(() => import('../pages/component-demos/TextareaDemo')),
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
    component: lazy(() => import('../pages/component-demos/ToggleDemo')),
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
    usesComponents: ['Toggle'],
    component: lazy(() => import('../pages/component-demos/ToggleGroupDemo')),
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
    component: lazy(() => import('../pages/component-demos/FormDemo')),
    usesComponents: ['Input', 'Label', 'Button', 'Checkbox', 'Select', 'Textarea'],
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
    component: lazy(() => import('../pages/component-demos/AvatarDemo')),
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
    component: lazy(() => import('../pages/component-demos/BadgeDemo')),
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
    component: lazy(() => import('../pages/component-demos/CardDemo')),
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
    component: lazy(() => import('../pages/component-demos/SeparatorDemo')),
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
    component: lazy(() => import('../pages/component-demos/SkeletonDemo')),
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
    component: lazy(() => import('../pages/component-demos/TableDemo')),
    usesComponents: [],
    designGuidance: [
      { heading: 'What', content: 'Low-level table primitives — thin wrappers around native HTML table elements with consistent spacing, border, and typography tokens.' },
      { heading: 'When to use', content: [
        'Custom or hierarchical tables where DataTable column-driven API does not fit',
        'Tree/expandable rows, key-value layouts, or nested sub-tables',
        'For standard data-driven tables with sorting and selection, prefer DataTable instead',
      ]},
      { heading: 'Overflow', content: 'The Table wrapper provides overflow-x-auto for horizontal scroll. For sticky headers, wrap in a height-restricted container with overflow-y-auto.' },
      { heading: 'Selection', content: 'Apply data-state="selected" to TableRow for selected styling (bg-accent/30). Selection logic lives in the consumer.' },
    ],
  },
  {
    name: 'Table Sandbox',
    slug: 'table-sandbox',
    category: 'sandboxes',
    description: 'Interactive sandbox for exploring table design language — density, borders, containers, selection, striping, and hover states.',
    component: lazy(() => import('../pages/component-demos/TableSandboxDemo')),
    usesComponents: ['Table', 'Badge', 'Checkbox'],
    designGuidance: [
      { heading: 'Purpose', content: 'Use this sandbox to explore and standardise table styling across the product. Toggle options to find the right combination for each use case.' },
      { heading: 'Variants to consider', content: [
        'Basic data table — simple list pages (Forms, Campaigns)',
        'Sortable data table — column sorting with indicators',
        'Selectable table — checkbox column + bulk action bar',
        'Tree/expandable table — hierarchical data (Billing, Accounts)',
        'Checkbox list — field selection, permission toggles',
        'Key-value table — settings display, review summaries',
      ]},
    ],
    propControls: [],
  },
  {
    name: 'Reorderable List',
    slug: 'reorderable-list',
    category: 'sandboxes',
    description: 'Interactive sandbox for reorderable checkbox lists — drag to reorder selected items, toggle selection, with configurable drag indicators and styling.',
    component: lazy(() => import('../pages/component-demos/ReorderableListSandboxDemo')),
    usesComponents: ['Checkbox', 'Badge'],
    designGuidance: [
      { heading: 'Purpose', content: 'Use this sandbox to explore reorderable list patterns — field selection with drag-to-reorder for the selected subset.' },
      { heading: 'Pattern', content: [
        'Selected items at the top — draggable, with drag handle + index number + teal left border',
        'Unselected items below — not draggable, just checkboxes',
        'Drag to reorder within the selected section only',
        'Select All row at the top for bulk selection',
      ]},
      { heading: 'Use cases', content: [
        'Exporter field mapping — select and order export columns',
        'Permission assignment — select and prioritise roles',
        'Column visibility — choose and order table columns',
        'Form builder — select and order form fields',
      ]},
    ],
    propControls: [],
  },
  {
    name: 'Card List',
    slug: 'card-list',
    category: 'sandboxes',
    description: 'Interactive sandbox for expandable card list patterns — rich list items with icons, metadata, actions, and nested content.',
    component: lazy(() => import('../pages/component-demos/CardListSandboxDemo')),
    usesComponents: ['Badge', 'Switch'],
    designGuidance: [
      { heading: 'Purpose', content: 'Use this sandbox to explore card list patterns — rich list items that are more than a table row but less than a full card grid.' },
      { heading: 'Pattern', content: [
        'Parent rows with icon + protocol + name + status + actions',
        'Expandable to reveal nested child items',
        'Error state with red left border accent',
        'Nested items with toggle switches and metadata',
      ]},
      { heading: 'Use cases', content: [
        'Connectors page — connections with nested automations',
        'Integration list — services with nested configurations',
        'Account hierarchy — parent accounts with children',
        'Journey list — journeys with nested steps/branches',
      ]},
    ],
    propControls: [],
  },
  {
    name: 'Progress',
    slug: 'progress',
    category: 'atoms',
    description: 'Progress bar showing completion percentage.',
    component: lazy(() => import('../pages/component-demos/ProgressDemo')),
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
    component: lazy(() => import('../pages/component-demos/AlertDemo')),
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
        heading: 'What is AlertDialog?',
        content: 'A modal confirmation dialog that interrupts the user before a significant action. It communicates severity through three intent variants (neutral, warning, destructive) and supports tiered confirmation guards based on the impact of the action.',
      },
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
        heading: 'Intent variants',
        content: [
          'Neutral — no top accent, teal confirm button. Routine confirmations like "Discard changes?" or "Close without saving?".',
          'Warning — amber top accent with Warning icon in title, secondary confirm button. Actions with side effects that the user should think twice about.',
          'Destructive — red top accent, red confirm button, swapped button order (confirm left, cancel right). Irreversible actions.',
        ],
      },
      {
        heading: 'Confirmation guards',
        content: [
          'requiresCheckbox — "I understand" checkbox. Destructive-only. Use for significant-impact actions (e.g. delete a campaign, remove a segment).',
          'requiresInput — type-to-confirm input. Works with ALL intents. Use for any action needing explicit typed confirmation (e.g. "DELETE" for account removal, "RESET" for config reset on a warning dialog). The input focus ring colour matches the dialog intent (amber for warning, red for destructive, default for neutral) to reinforce severity context.',
          'inputLabel — custom instruction text for the type-to-confirm input. Overrides the default "Type {x} to confirm" label. Use when the default phrasing doesn\'t fit the context (e.g. "Type RESET to confirm factory reset").',
          'Neither — no guard. Use for low-impact confirmations where the dialog itself is sufficient friction.',
          'When both are provided, requiresInput takes precedence (checkbox is hidden).',
        ],
      },
      {
        heading: 'Object names in titles',
        content: 'When an action relates to a specific object, include its name in the title. E.g. "Delete \'Summer Sale\'?" not just "Delete campaign?". This gives users confidence they are acting on the right thing. Titles asking the user to perform an action always end with a question mark.',
      },
      {
        heading: 'Microcopy (Yifrah framework)',
        content: [
          'Tell users what happens next, not what they did — "This will permanently remove all data" not "You are about to delete"',
          'Never use "are you sure" — state the consequence directly instead',
          'Titles that ask the user to perform an action must end with a question mark — "Delete \'Summer Sale\'?" not "Delete \'Summer Sale\'"',
          'Button labels are actions — "Delete campaign" not "OK" or "Yes"',
          'Be specific about consequences — "3 automations will stop running" not "This may affect other items"',
          'Loading labels describe the action in progress — "Deleting..." or "Saving..." not "Please wait"',
        ],
      },
      {
        heading: 'Loading state',
        content: 'When onConfirm returns a Promise, the confirm button shows a spinner alongside text like "Deleting..." or "Saving...". Both buttons disable and all dismissal paths are blocked until the Promise resolves or rejects.',
      },
      {
        heading: 'Custom icons',
        content: 'Pass an icon prop (ReactNode) to render a custom icon inline with the title. For warning intent this overrides the default Warning icon; for neutral/destructive it adds an icon where none exists by default. Use for domain-specific context — e.g. a CurrencyDollar icon for billing confirmations or a Trash icon for clear-history dialogs.',
      },
      {
        heading: 'Single-action dialogs',
        content: 'Set showCancel={false} for informational alerts that only need an acknowledgement button (e.g. "Mapping incomplete" with an "OK" button). The X close button remains available.',
      },
    ],
  },
  {
    name: 'Dialog',
    slug: 'dialog',
    category: 'feedback',
    description: 'Accessible modal dialog built on Radix UI with structured Header → Body → Footer layout and blurred overlay.',
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
        heading: 'What is Dialog?',
        content: 'A modal overlay built on Radix UI Dialog that uses a three-section layout: DialogHeader (title row), DialogBody (main content), and DialogFooter (action buttons). The content wrapper has zero padding — each section manages its own spacing independently.',
      },
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
        heading: 'Structure',
        content: [
          'DialogHeader — horizontal flex (items-center, justify-between), px-6 pt-6. Place title on the left, optional close button on the right.',
          'DialogBody — padded content area (px-6 py-4). Use for form fields, messages, or any main content.',
          'DialogFooter — right-aligned button row (px-6 py-4, gap-3). Place Cancel on the left, primary action on the right.',
          'Sections are optional — omit any section and no leftover whitespace appears.',
        ],
      },
      {
        heading: 'Sizing',
        content: 'Default max-width is 460px. Override via className on DialogContent for wider dialogs (e.g. max-w-lg, max-w-2xl). Keep dialogs as narrow as the content requires.',
      },
      {
        heading: 'Overlay behaviour',
        content: 'Uses backdrop-blur-xs with 50% black opacity at z-[150] — high enough to stack above nav bars, dropdowns, and tooltips without conflicting with Tailwind\'s default z-50 scale. Clicking the overlay closes the dialog by default (Radix behaviour). Escape key also dismisses.',
      },
    ],
  },
  {
    name: 'Sheet',
    slug: 'sheet',
    category: 'feedback',
    description: 'Slide-out panel from screen edge for secondary content or forms.',
    usesComponents: ['Button', 'Close Button'],
    component: lazy(() => import('../pages/component-demos/SheetDemo')),
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
    component: lazy(() => import('../pages/component-demos/SonnerDemo')),
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
    usesComponents: [],
    designGuidance: [
      {
        heading: 'Visual style',
        content: 'Dedicated tooltip tokens (bg-tooltip / text-tooltip-foreground) for independent theming. Built-in arrow always rendered using fill-tooltip. 4px radius, text-sm (14px). Padding (px-1.5 py-1.5) applied to an inner span so it doesn\'t affect arrow positioning.',
      },
      {
        heading: 'When to use',
        content: 'Short, non-interactive labels for icon buttons, truncated text, or abbreviated values. For richer content or interactive elements, use Popover or HoverCard instead.',
      },
      {
        heading: 'Placement',
        content: 'Supports top, right, bottom, left via the side prop. 4px sideOffset by default. Arrow auto-points toward the trigger.',
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
    usesComponents: ['Avatar', 'Button'],
    component: lazy(() => import('../pages/component-demos/HoverCardDemo')),
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
    usesComponents: ['Button'],
    component: lazy(() => import('../pages/component-demos/PopoverDemo')),
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
    component: lazy(() => import('../pages/component-demos/AccordionDemo')),
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
    component: lazy(() => import('../pages/component-demos/BreadcrumbDemo')),
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
    component: lazy(() => import('../pages/component-demos/CollapsibleDemo')),
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
    component: lazy(() => import('../pages/component-demos/CommandDemo')),
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
    component: lazy(() => import('../pages/component-demos/ContextMenuDemo')),
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
    component: lazy(() => import('../pages/component-demos/DropdownMenuDemo')),
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
    component: lazy(() => import('../pages/component-demos/MenubarDemo')),
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
    usesComponents: ['Button'],
    component: lazy(() => import('../pages/component-demos/NavigationMenuDemo')),
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
    component: lazy(() => import('../pages/component-demos/PaginationDemo')),
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
    component: lazy(() => import('../pages/component-demos/ScrollAreaDemo')),
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
    component: lazy(() => import('../pages/component-demos/TabsDemo')),
    usesComponents: [],
    designGuidance: [
      { heading: 'Variants', content: [
        'Pill (default) — grey background container, active tab gets white fill + shadow. Use inside cards/panels for content switching.',
        'Underline — transparent background, bottom border indicator. Use for page-level navigation or data filtering.',
      ]},
      { heading: 'Badge', content: 'TabsTrigger accepts an optional badge prop for count indicators (e.g. filter counts, item totals). Badge styling reacts to active state via the group-data-[state=active] pattern — no extra props needed.' },
      { heading: 'Variant inheritance', content: 'Set variant on TabsList — TabsTrigger reads it via context. No need to pass variant to each trigger.' },
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
    usesComponents: ['Card'],
    component: lazy(() => import('../pages/component-demos/MetricCardDemo')),
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
    usesComponents: ['Table', 'Checkbox'],
    designGuidance: [
      { heading: 'What', content: 'Data-driven table built on shadcn Table primitives. Accepts typed columns and renders headers, sorting, selection, and density automatically.' },
      { heading: 'When to use', content: [
        'Structured tabular data with optional column sorting (billing reports, user lists, audit logs)',
        'Prefer over manual Table composition when columns are data-driven',
        'For tree/hierarchical data, use Table primitives directly',
        'For simple key-value display, use a description list instead',
      ]},
      { heading: 'Density', content: [
        'compact: Tight padding (py-1.5 px-3, text-xs) — dense data like logs or audit trails',
        'default: Standard padding (py-3 px-4, text-sm) — most tables',
        'relaxed: Generous padding (py-4 px-4, text-sm) — sparse data or dashboard cards',
      ]},
      { heading: 'Container', content: [
        'borderless: No wrapper styling — table sits flush in its parent',
        'bordered: 1px border + rounded-md — standalone table with clear boundary',
        'card: Border + rounded-lg + shadow-sm — elevated card-style presentation',
      ]},
      { heading: 'Selection', content: 'Enable selectable prop to add checkbox column with select-all/indeterminate support. Selected rows get bg-accent/30 fill. A bulk action bar appears below the table showing count and clear button.' },
      { heading: 'Sorting', content: 'Columns opt-in via sortable flag. Sort cycles asc → desc → unsorted (three-state). Only the active column shows a direction arrow. Sortable headers get hover:text-primary for affordance.' },
      { heading: 'Alignment', content: 'Use align: "right" for numeric columns (applies tabular-nums automatically). Use align: "center" sparingly for status badges.' },
      { heading: 'Custom cells', content: 'Use the render function on a column to display badges, icons, or formatted values instead of raw text.' },
    ],
    component: lazy(() => import('../pages/component-demos/DataTableDemo')),
  },
  {
    name: 'Toast',
    slug: 'toast',
    category: 'feedback',
    description: 'Notification helper using Sonner with UDS styling and variants.',
    component: lazy(() => import('../pages/component-demos/ToastDemo')),
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
    usesComponents: ['Dialog', 'Button', 'Input', 'Label', 'Close Button'],
    component: lazy(() => import('../pages/component-demos/ModalDemo')),
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
  // Compositions (multi-component patterns that orchestrate flows)
  {
    name: 'Stepper',
    slug: 'stepper',
    category: 'compositions',
    description: 'Sequential step indicator with vertical and horizontal orientations.',
    component: lazy(() => import('../pages/component-demos/StepperDemo')),
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
    usesComponents: ['Button', 'DropdownMenu'],
    component: lazy(() => import('../pages/component-demos/SplitButtonDemo')),
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
    demoLayout: 'full-bleed',
    usesComponents: ['Button', 'Badge', 'Tabs', 'Input', 'Breadcrumb'],
    component: lazy(() => import('../pages/component-demos/PageHeaderDemo')),
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
    component: lazy(() => import('../pages/component-demos/SegmentedControlDemo')),
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
    usesComponents: [],
    designGuidance: [
      { heading: 'Variants', content: [
        'Plain (default) — neutral foreground text, no state change. Use when value is always meaningful (column count, row count).',
        'Toggle — value text turns teal (text-primary) when value > min, muted when at min. Use when 0 = off and 1+ = on (nesting depth, border radius).',
      ]},
      { heading: 'Sizes', content: [
        'Default (h-9) — standard forms and panels',
        'Small (h-7) — controller panels and compact UI',
        'XS (h-5) — inline or very tight spaces',
      ]},
      { heading: 'When to use', content: [
        'Small integer ranges with tight bounds (1-10)',
        'Prefer over a text input when the range is small and predictable',
        'Prefer over a slider when exact values matter more than relative position',
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
        heading: 'What is a Chip?',
        content: 'A pill-shaped interactive label used to represent discrete values — tags, filter selections, multi-select entries, or insertion tokens. Renders as a <span> by default, switching to a <button> when onClick is provided for proper keyboard accessibility.',
      },
      {
        heading: 'When to use',
        content: [
          'Removable tags in multi-select inputs (e.g. selected fields in an importer mapping)',
          'Email address entries in recipient fields (e.g. "brad@example.com" with dismiss to remove)',
          'Filter pills in filter bars where users toggle criteria on/off',
          'Insertion tokens / merge tags in template builders (use variant="insertable" with onClick and used)',
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
        heading: 'Variants',
        content: [
          'Default — neutral grey background. General-purpose tags and filters with no semantic meaning.',
          'Outline — transparent with border. Lighter visual weight, good for dense lists or inside inputs where background contrast matters.',
          'Mint — green-tinted. Communicates success or positive status (e.g. "Active", "Verified", "Matched").',
          'Red — red-tinted. Communicates error or destructive status (e.g. "Failed", "Blocked", "Unmatched").',
          'Insertable — token insertion chip. Light mint background when available, grey when used. Teal fill on hover with scale feedback on click. Uses monospace font to signal variable/token content.',
        ],
      },
      {
        heading: 'Sizes',
        content: [
          'Default (28px / h-7) — standard usage in filter bars, tag lists, and form fields.',
          'Small (24px / h-6) — compact contexts like inside input fields or dense filter bars where vertical space is constrained.',
        ],
      },
      {
        heading: 'Click behaviour',
        content: 'When onClick is provided, the chip renders as a <button> element with focus-visible ring for keyboard accessibility. Without onClick, it renders as a <span> and selection is managed by the parent container. When selected, the chip fills with a solid colour and switches to white text.',
      },
      {
        heading: 'Insertable behaviour',
        content: 'The insertable variant tracks a "used" state. Available tokens show a light mint background with teal text; used tokens switch to grey background with muted text. Both remain clickable (for re-insertion). Hover fills with solid teal for clear affordance.',
      },
      {
        heading: 'Dismiss behaviour',
        content: 'When onDismiss is provided, a small X button renders inside the chip. It uses stopPropagation to prevent triggering the parent\'s click handler. The dismiss button has its own aria-label ("Remove {label}") for screen reader clarity.',
      },
    ],
  },
  {
    name: 'ChooserModal',
    slug: 'chooser-modal',
    category: 'compositions',
    description: 'Centred selection modal for picking from 2–4 options before proceeding. Uses CardSelector grid with icon header, title, and description.',
    usesComponents: ['Dialog', 'CardSelector', 'Button'],
    component: lazy(() => import('../pages/component-demos/ChooserModalDemo')),
    propControls: [
      { name: 'title', label: 'Title', controlType: 'text', defaultValue: 'Select Connection Type' },
      { name: 'description', label: 'Description', controlType: 'text', defaultValue: 'Select the protocol your data source uses to connect with UbiQuity.' },
      { name: 'option-count', label: 'Options', controlType: 'counter', defaultValue: 3, min: 2, max: 4 },
      { name: 'confirm-label', label: 'Confirm Label', controlType: 'text', defaultValue: 'Next' },
    ],
  },
  {
    name: 'Controls Panel',
    slug: 'controls-panel',
    category: 'compositions',
    description: 'Declarative controls panel that renders interactive controls from a PropDefinition array. Supports 11 control types, section grouping, conditional visibility, and custom render slots.',
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
    component: lazy(() => import('../pages/component-demos/SectionDividerDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Use to separate logical field groups in single-step modals and dialogs.',
        'Use "line" variant when sections are visually equal (e.g. Connection Settings, Authentication).',
        'Use "heading" variant for longer forms where sections need stronger left-aligned hierarchy.',
        'Do NOT use inside wizard steps — those follow the three-tier form rhythm pattern.',
        'For a plain line without a label, use the Separator component instead.',
      ]},
      { heading: 'Spacing', content: 'The component applies a negative bottom margin so the label visually "owns" the section below it. Let the parent container handle the gap above.' },
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
    name: 'PrefixInput',
    slug: 'prefix-input',
    category: 'inputs',
    description: 'Input field with a non-editable prefix. Used for paths, URLs, or any value with a fixed base.',
    usesComponents: ['Input'],
    designGuidance: [
      { heading: 'When to use', content: [
        'Use when a value always starts with a known, non-editable prefix (URL base path, file path root, domain).',
        'Prefer over a disabled input + label when the prefix is structural context, not user-entered data.',
        'For editable prefixes or suffixes, use a standard Input with adornments instead.',
      ]},
      { heading: 'Anatomy', content: [
        'Outer container: flex row, h-9, border, rounded-md, overflow-hidden.',
        'Prefix span: bg-secondary, border-r, non-interactive, select-none.',
        'Inner Input: flex-1, border-0, rounded-none — inherits height from container.',
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
    usesComponents: [],
    designGuidance: [
      { heading: 'When to use', content: [
        'Use for multi-value free-text entry (emails, tags, keywords).',
        'Use with options prop for constrained multi-select from a predefined list.',
        'Prefer over multi-select dropdown when all selected values should remain visible.',
        'For single-value selection, use a standard Select or Combobox instead.',
      ]},
      { heading: 'Anatomy', content: [
        'Container: bordered box with chips + inline text input.',
        'Chips: pill-shaped (rounded-full) with primary border and X remove button.',
        'Validation pill: appears below input showing validity of current typed value.',
        'Dropdown (optional): absolute-positioned list of remaining selectable options.',
        'Clear-all button: X icon at trailing edge, visible when chips exist.',
        'Copy-from-above link: optional action in the label row for duplicating values from a sibling field.',
      ]},
      { heading: 'Interaction', content: [
        'Enter, Tab, or comma commits the current input as a chip.',
        'Backspace on empty input removes the last chip.',
        'Dropdown stays open after selection to allow rapid multi-pick.',
        'Clicking the validation pill (when valid) commits the value.',
        'Blur commits any pending valid input.',
      ]},
      { heading: 'Sizes', content: [
        'sm: min-h-8, compact chip padding — use in table filters or dense forms.',
        'default: min-h-10, standard form field sizing.',
        'lg: min-h-12, larger touch targets and text.',
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
    usesComponents: ['Button', 'Calendar', 'Popover'],
    component: lazy(() => import('../pages/component-demos/DateRangePickerDemo')),
    designGuidance: [
      { heading: 'When to use', content: [
        'Use for any date range filter where presets speed up common selections.',
        'Pass domain-specific presets (billing cycles, quarters, months).',
        'For single date selection, use the Calendar component directly.',
      ]},
      { heading: 'Anatomy', content: [
        'Trigger: outline Button with calendar icon + formatted date range (tabular-nums)',
        'Floating panel: Popover containing Calendar (left) + presets list (right)',
        'Calendar: range mode via react-day-picker, handles selection and navigation',
        'Presets: scrollable list, active preset highlighted in teal',
      ]},
      { heading: 'Interaction', content: [
        'Range selection handled by Calendar component (click start, click end).',
        'Panel closes automatically when a complete range is selected.',
        'Clicking a preset applies it immediately and closes the panel.',
        'Popover handles outside click, Escape, and focus management.',
      ]},
      { heading: 'Visual states', content: [
        'Range edges: filled teal circles (rounded-full) — standard date picker pattern.',
        'Range body: accent background fill (Calendar built-in).',
        'Today: highlighted by Calendar defaults.',
        'Active preset: teal text + semibold weight.',
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
    usesComponents: ['Popover'],
    component: lazy(() => import('../pages/component-demos/HelpPopoverDemo')),
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
    component: lazy(() => import('../pages/component-demos/DayPickerDemo')),
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
