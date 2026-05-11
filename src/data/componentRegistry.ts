import { lazy, type LazyExoticComponent, type ComponentType } from 'react'

export type ComponentCategory = 'tokens' | 'inputs' | 'display' | 'feedback' | 'navigation' | 'composed'

export type ControlType = 'text' | 'select' | 'toggle' | 'colour' | 'number' | 'range' | 'radio'

export interface PropOption {
  label: string
  value: string
}

export interface PropDefinition {
  name: string
  label: string
  controlType: ControlType
  defaultValue: string | number | boolean
  options?: PropOption[]
  min?: number
  max?: number
  step?: number
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
  },
  {
    name: 'SplitButton',
    slug: 'split-button',
    category: 'composed',
    description: 'Button with primary action and dropdown menu for secondary actions.',
    component: lazy(() => import('../pages/component-demos/SplitButtonDemo')),
  },
]
