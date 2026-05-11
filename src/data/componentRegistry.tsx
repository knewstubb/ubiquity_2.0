import { lazy, type LazyExoticComponent, type ComponentType, type ReactNode } from 'react'

export type ComponentCategory = 'tokens' | 'inputs' | 'display' | 'feedback' | 'navigation' | 'composed'

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
}

export interface UsedInLink {
  label: string
  route: string
}

export interface ComponentEntry {
  name: string
  slug: string
  category: ComponentCategory
  description: string
  component: LazyExoticComponent<ComponentType>
  propControls?: PropDefinition[]
  usedIn?: UsedInLink[]
  renderControls?: (
    values: Record<string, ControlValue>,
    setValue: (name: string, value: ControlValue) => void
  ) => ReactNode
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
    name: 'Spacing & Radius',
    slug: 'spacing-radius',
    category: 'tokens',
    description: 'Spacing scale and border radius tokens with derived scale.',
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
    description: 'Accessible button with variants: default, destructive, outline, secondary, ghost, link.',
    component: lazy(() => import('../pages/component-demos/ButtonDemo')),
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Click me' },
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Outline', value: 'outline' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Link', value: 'link' },
      ]},
      { name: 'size', label: 'Size', controlType: 'radio', defaultValue: 'default', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Default', value: 'default' },
        { label: 'Large', value: 'lg' },
        { label: 'Icon', value: 'icon' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    usedIn: [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Campaigns', route: '/automations/campaigns' },
    ],
  },
  {
    name: 'Calendar',
    slug: 'calendar',
    category: 'inputs',
    description: 'Date picker calendar grid with month navigation.',
    component: lazy(() => import('../pages/component-demos/CalendarDemo')),
  },
  {
    name: 'Checkbox',
    slug: 'shadcn-checkbox',
    category: 'inputs',
    description: 'Accessible checkbox with indeterminate state support.',
    component: lazy(() => import('../pages/component-demos/CheckboxDemo')),
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
        { label: 'Small', value: 'sm' },
        { label: 'Default', value: 'default' },
        { label: 'Large', value: 'lg' },
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
  },
  {
    name: 'Label',
    slug: 'label',
    category: 'inputs',
    description: 'Accessible form label with required indicator support.',
    component: lazy(() => import('../pages/component-demos/LabelDemo')),
  },
  {
    name: 'RadioGroup',
    slug: 'radio-group',
    category: 'inputs',
    description: 'Radio button group for single-choice selection.',
    component: lazy(() => import('../pages/component-demos/RadioGroupDemo')),
  },
  {
    name: 'Select',
    slug: 'select',
    category: 'inputs',
    description: 'Accessible select dropdown with search and keyboard navigation.',
    component: lazy(() => import('../pages/component-demos/SelectDemo')),
  },
  {
    name: 'Slider',
    slug: 'slider',
    category: 'inputs',
    description: 'Range input for selecting numeric values.',
    component: lazy(() => import('../pages/component-demos/SliderDemo')),
  },
  {
    name: 'Switch',
    slug: 'switch',
    category: 'inputs',
    description: 'Toggle switch for boolean on/off states.',
    component: lazy(() => import('../pages/component-demos/SwitchDemo')),
    propControls: [
      { name: 'label', label: 'Label', controlType: 'text', defaultValue: 'Airplane Mode' },
      { name: 'checked', label: 'Checked', controlType: 'toggle', defaultValue: false },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
      { name: 'scale', label: 'Scale', controlType: 'range', defaultValue: 100, min: 50, max: 200, step: 10 },
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
  },
  {
    name: 'Toggle',
    slug: 'shadcn-toggle',
    category: 'inputs',
    description: 'Pressable toggle button with on/off states.',
    component: lazy(() => import('../pages/component-demos/ToggleDemo')),
  },
  {
    name: 'ToggleGroup',
    slug: 'toggle-group',
    category: 'inputs',
    description: 'Group of toggle buttons for single or multi-select.',
    component: lazy(() => import('../pages/component-demos/ToggleGroupDemo')),
  },
  {
    name: 'Form',
    slug: 'form',
    category: 'inputs',
    description: 'Form wrapper with validation, error messages, and field state management.',
    component: lazy(() => import('../pages/component-demos/FormDemo')),
  },

  // Display
  {
    name: 'Avatar',
    slug: 'avatar',
    category: 'display',
    description: 'User profile image with fallback initials.',
    component: lazy(() => import('../pages/component-demos/AvatarDemo')),
  },
  {
    name: 'Badge',
    slug: 'badge',
    category: 'display',
    description: 'Small label for status, counts, or categories.',
    component: lazy(() => import('../pages/component-demos/BadgeDemo')),
    propControls: [
      { name: 'text', label: 'Text', controlType: 'text', defaultValue: 'Badge' },
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Outline', value: 'outline' },
      ]},
      { name: 'colour', label: 'Colour Override', controlType: 'colour', defaultValue: '#14B88A' },
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
  },
  {
    name: 'Separator',
    slug: 'separator',
    category: 'display',
    description: 'Visual divider between content sections, horizontal or vertical.',
    component: lazy(() => import('../pages/component-demos/SeparatorDemo')),
  },
  {
    name: 'Skeleton',
    slug: 'skeleton',
    category: 'display',
    description: 'Loading placeholder with pulse animation.',
    component: lazy(() => import('../pages/component-demos/SkeletonDemo')),
  },
  {
    name: 'Table',
    slug: 'table',
    category: 'display',
    description: 'Structured data table with header, body, and footer sections.',
    component: lazy(() => import('../pages/component-demos/TableDemo')),
  },
  {
    name: 'Progress',
    slug: 'progress',
    category: 'display',
    description: 'Progress bar showing completion percentage.',
    component: lazy(() => import('../pages/component-demos/ProgressDemo')),
  },

  // Feedback
  {
    name: 'Alert',
    slug: 'alert',
    category: 'feedback',
    description: 'Callout for important messages with icon, title, and description.',
    component: lazy(() => import('../pages/component-demos/AlertDemo')),
  },
  {
    name: 'AlertDialog',
    slug: 'alert-dialog',
    category: 'feedback',
    description: 'Modal confirmation dialog requiring user action before proceeding.',
    component: lazy(() => import('../pages/component-demos/AlertDialogDemo')),
  },
  {
    name: 'Dialog',
    slug: 'dialog',
    category: 'feedback',
    description: 'Accessible modal dialog built on Radix UI with overlay and close button.',
    component: lazy(() => import('../pages/component-demos/DialogDemo')),
  },
  {
    name: 'Sheet',
    slug: 'sheet',
    category: 'feedback',
    description: 'Slide-out panel from screen edge for secondary content or forms.',
    component: lazy(() => import('../pages/component-demos/SheetDemo')),
  },
  {
    name: 'Sonner',
    slug: 'sonner',
    category: 'feedback',
    description: 'Toast notification system with stacking and auto-dismiss.',
    component: lazy(() => import('../pages/component-demos/SonnerDemo')),
  },
  {
    name: 'Tooltip',
    slug: 'tooltip',
    category: 'feedback',
    description: 'Hover-triggered informational popup with configurable placement.',
    component: lazy(() => import('../pages/component-demos/TooltipDemo')),
  },
  {
    name: 'HoverCard',
    slug: 'hover-card',
    category: 'feedback',
    description: 'Hover-triggered card preview for links or user profiles.',
    component: lazy(() => import('../pages/component-demos/HoverCardDemo')),
  },
  {
    name: 'Popover',
    slug: 'popover',
    category: 'feedback',
    description: 'Click-triggered floating panel for forms or additional content.',
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
        { label: 'Narrow', value: '280px' },
        { label: 'Default', value: '320px' },
        { label: 'Wide', value: '400px' },
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
  },
  {
    name: 'Breadcrumb',
    slug: 'breadcrumb',
    category: 'navigation',
    description: 'Navigation trail showing page hierarchy.',
    component: lazy(() => import('../pages/component-demos/BreadcrumbDemo')),
  },
  {
    name: 'Collapsible',
    slug: 'collapsible',
    category: 'navigation',
    description: 'Expandable/collapsible content section with trigger.',
    component: lazy(() => import('../pages/component-demos/CollapsibleDemo')),
  },
  {
    name: 'Command',
    slug: 'command',
    category: 'navigation',
    description: 'Combobox/command palette with search filtering and keyboard selection.',
    component: lazy(() => import('../pages/component-demos/CommandDemo')),
  },
  {
    name: 'ContextMenu',
    slug: 'context-menu',
    category: 'navigation',
    description: 'Right-click menu with items, sub-menus, and separators.',
    component: lazy(() => import('../pages/component-demos/ContextMenuDemo')),
  },
  {
    name: 'DropdownMenu',
    slug: 'dropdown-menu',
    category: 'navigation',
    description: 'Click-triggered menu with items, separators, and keyboard navigation.',
    component: lazy(() => import('../pages/component-demos/DropdownMenuDemo')),
  },
  {
    name: 'Menubar',
    slug: 'menubar',
    category: 'navigation',
    description: 'Horizontal menu bar with dropdown sub-menus.',
    component: lazy(() => import('../pages/component-demos/MenubarDemo')),
  },
  {
    name: 'NavigationMenu',
    slug: 'navigation-menu',
    category: 'navigation',
    description: 'Site navigation with links, dropdowns, and viewport animations.',
    component: lazy(() => import('../pages/component-demos/NavigationMenuDemo')),
  },
  {
    name: 'Pagination',
    slug: 'pagination',
    category: 'navigation',
    description: 'Page navigation with previous/next and numbered page links.',
    component: lazy(() => import('../pages/component-demos/PaginationDemo')),
  },
  {
    name: 'ScrollArea',
    slug: 'scroll-area',
    category: 'navigation',
    description: 'Custom scrollbar container with consistent cross-browser styling.',
    component: lazy(() => import('../pages/component-demos/ScrollAreaDemo')),
  },
  {
    name: 'Tabs',
    slug: 'tabs',
    category: 'navigation',
    description: 'Tabbed interface for switching between content panels.',
    component: lazy(() => import('../pages/component-demos/TabsDemo')),
  },

  // Composed (UDS-styled compositions built on shadcn primitives)
  {
    name: 'CardSelector',
    slug: 'card-selector',
    category: 'composed',
    description: 'Selectable card with icon, label, and checkmark badge for single/multi-choice selections.',
    component: lazy(() => import('../pages/component-demos/CardSelectorDemo')),
  },
  {
    name: 'StatusBadge',
    slug: 'status-badge',
    category: 'composed',
    description: 'Coloured pill badge indicating status (active, invited, inactive, error) using UDS tokens.',
    component: lazy(() => import('../pages/component-demos/StatusBadgeDemo')),
  },
  {
    name: 'MetricCard',
    slug: 'metric-card',
    category: 'composed',
    description: 'Dashboard metric card with value, label, and trend indicator.',
    component: lazy(() => import('../pages/component-demos/MetricCardDemo')),
  },
  {
    name: 'DataTable',
    slug: 'data-table',
    category: 'composed',
    description: 'Sortable data table with column headers built on shadcn Table.',
    component: lazy(() => import('../pages/component-demos/DataTableDemo')),
  },
  {
    name: 'Toast',
    slug: 'toast',
    category: 'composed',
    description: 'Notification helper using Sonner with UDS styling and variants.',
    component: lazy(() => import('../pages/component-demos/ToastDemo')),
  },
  {
    name: 'Modal',
    slug: 'modal',
    category: 'composed',
    description: 'Modal dialog pattern with ModalHeader (title + close) and ModalFooter (button slots) composed on shadcn Dialog.',
    component: lazy(() => import('../pages/component-demos/ModalDemo')),
  },
  {
    name: 'Stepper',
    slug: 'stepper',
    category: 'composed',
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
                <div key={i} className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
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
    category: 'composed',
    description: 'Button with primary action and dropdown menu for secondary actions.',
    component: lazy(() => import('../pages/component-demos/SplitButtonDemo')),
  },
  {
    name: 'PageHeader',
    slug: 'page-header',
    category: 'composed',
    description: 'Configurable page header with breadcrumbs, title, status badge, actions, tabs, filters, and bulk actions.',
    component: lazy(() => import('../pages/component-demos/PageHeaderDemo')),
  },
  {
    name: 'SegmentedControl',
    slug: 'segmented-control',
    category: 'composed',
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
          <div key={i} className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
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
    category: 'composed',
    description: 'Compact numeric input with decrement/value/increment buttons. Value highlights in teal when active.',
    component: lazy(() => import('../pages/component-demos/NumberStepperDemo')),
    propControls: [
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
      ]},
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
    renderControls: (values, setValue) => (
      <>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">Bounds</span>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
            <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Min</span>
            <input
              type="number"
              value={Number(values['bounds-min'] ?? 0)}
              onChange={(e) => setValue('bounds-min', Number(e.target.value))}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
            />
          </div>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
            <span className="shrink-0 text-xs text-muted-foreground select-none bg-secondary px-2 self-stretch flex items-center border-r border-input">Max</span>
            <input
              type="number"
              value={Number(values['bounds-max'] ?? 10)}
              onChange={(e) => setValue('bounds-max', Number(e.target.value))}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs text-foreground px-2"
            />
          </div>
          <div className="flex items-center rounded-md border border-input bg-background h-7 overflow-hidden focus-within:border-ring focus-within:shadow-[0_0_0_3px_rgba(20,184,138,0.15)]">
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
    category: 'composed',
    description: 'Interactive label with optional dismiss button, icon, and selectable state. Used for tags, filters, and multi-select values.',
    component: lazy(() => import('../pages/component-demos/ChipDemo')),
    propControls: [
      { name: 'variant', label: 'Variant', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Mint', value: 'mint' },
        { label: 'Red', value: 'red' },
      ]},
      { name: 'size', label: 'Size', controlType: 'select', defaultValue: 'default', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Default', value: 'default' },
      ]},
      { name: 'show-icon', label: 'Show Icon', controlType: 'toggle', defaultValue: false },
      { name: 'selectable', label: 'Selectable', controlType: 'toggle', defaultValue: false },
      { name: 'disabled', label: 'Disabled', controlType: 'toggle', defaultValue: false },
    ],
  },
  {
    name: 'Controls Panel',
    slug: 'controls-panel',
    category: 'composed',
    description: 'Declarative controls panel that renders interactive controls from a PropDefinition array. Supports 11 control types, section grouping, conditional visibility, and custom render slots.',
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
]
