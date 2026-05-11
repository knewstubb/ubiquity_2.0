import type { TokenConfig } from '../models/tokenConfig';

/**
 * Colour token groups — organises tokens into logical subsections
 * matching the globals.css structure for the Colour Section UI.
 */
export interface TokenDescription {
  description: string;
  usage: string;
  duplicateOf?: string;
}

export const TOKEN_DESCRIPTIONS: Record<string, TokenDescription> = {
  // Core Surfaces
  'background': { description: 'Page background', usage: 'Main app background, body' },
  'foreground': { description: 'Default text colour', usage: 'Body text, headings, labels' },
  'card': { description: 'Card surface', usage: 'Card backgrounds, elevated panels' },
  'card-foreground': { description: 'Text on cards', usage: 'Text inside card components' },
  'popover': { description: 'Popover/dropdown surface', usage: 'Dropdown menus, tooltips, popovers' },
  'popover-foreground': { description: 'Text in popovers', usage: 'Text inside dropdown menus and tooltips' },

  // Primary
  'primary': { description: 'Primary brand colour', usage: 'Primary buttons, active nav indicators, links' },
  'primary-foreground': { description: 'Text on primary surfaces', usage: 'Button labels on primary buttons' },

  // Secondary
  'secondary': { description: 'Secondary surface', usage: 'Secondary buttons, toggle backgrounds' },
  'secondary-foreground': { description: 'Text on secondary surfaces', usage: 'Labels on secondary buttons' },

  // Muted
  'muted': { description: 'Muted/subtle surface', usage: 'Disabled backgrounds, subtle fills' },
  'muted-foreground': { description: 'Secondary text', usage: 'Placeholder text, helper text, timestamps' },
  'tertiary-foreground': { description: 'Tertiary text', usage: 'Least prominent text, metadata' },

  // Accent
  'accent': { description: 'Accent surface', usage: 'Highlighted rows, selected item backgrounds' },
  'accent-foreground': { description: 'Text on accent surfaces', usage: 'Text in highlighted/selected items' },
  'accent-hover': { description: 'Accent hover state', usage: 'Primary button hover, link hover' },

  // Destructive
  'destructive': { description: 'Destructive/error colour', usage: 'Delete buttons, error states' },
  'destructive-foreground': { description: 'Text on destructive surfaces', usage: 'Labels on delete buttons' },
  'destructive-subtle': { description: 'Subtle destructive surface', usage: 'Error banners, validation backgrounds' },
  'destructive-border': { description: 'Destructive border', usage: 'Error input borders, alert borders' },

  // Warning
  'warning': { description: 'Warning colour', usage: 'Warning badges, caution indicators' },
  'warning-foreground': { description: 'Text on warning surfaces', usage: 'Warning banner text' },
  'warning-subtle': { description: 'Subtle warning surface', usage: 'Warning banner backgrounds' },
  'warning-border': { description: 'Warning border', usage: 'Warning alert borders' },

  // Success
  'success': { description: 'Success colour', usage: 'Success badges, confirmation indicators' },
  'success-foreground': { description: 'Text on success surfaces', usage: 'Success message text' },
  'success-subtle': { description: 'Subtle success surface', usage: 'Success banner backgrounds' },
  'success-border': { description: 'Success border', usage: 'Success alert borders' },

  // Info
  'info': { description: 'Informational colour', usage: 'Info badges, help indicators' },
  'info-foreground': { description: 'Text on info surfaces', usage: 'Info banner text' },
  'info-subtle': { description: 'Subtle info surface', usage: 'Info banner backgrounds' },
  'info-border': { description: 'Info border', usage: 'Info alert borders' },

  // Border
  'border': { description: 'Default border', usage: 'Card borders, dividers, table lines' },
  'input': { description: 'Input field border', usage: 'Text inputs, selects, textareas' },
  'ring': { description: 'Focus ring', usage: 'Focus outline on interactive elements' },
  'border-strong': { description: 'Emphasised border', usage: 'Active borders, stronger dividers between sections' },

  // Disabled
  'disabled': { description: 'Disabled background', usage: 'Disabled button/input backgrounds' },
  'disabled-foreground': { description: 'Disabled text', usage: 'Greyed-out labels on disabled controls' },

  // Extended
  'background-sunken': { description: 'Sunken/recessed background', usage: 'Inset panels, code blocks, well areas' },
  'background-elevated': { description: 'Elevated background', usage: 'Raised surfaces above subtle, skeleton loaders' },
  'text-inverse': { description: 'Inverse text', usage: 'White text on dark surfaces, tooltips' },
  'danger-hover': { description: 'Danger hover state', usage: 'Delete button hover, error link hover' },
  'danger-text': { description: 'Danger-coloured text', usage: 'Error messages, validation text' },
  'neutral-hover': { description: 'Neutral hover', usage: 'Neutral button hover state' },
  'neutral-subtle': { description: 'Subtle neutral surface', usage: 'Neutral badge backgrounds, chip fills' },
  'neutral-text': { description: 'Neutral text', usage: 'Neutral badge labels, secondary button text' },
  'neutral-border': { description: 'Neutral border', usage: 'Neutral badge borders, chip outlines' },

  // Sidebar
  'sidebar': { description: 'Sidebar background', usage: 'Navigation sidebar surface' },
  'sidebar-foreground': { description: 'Sidebar text', usage: 'Nav item labels in sidebar' },
  'sidebar-primary': { description: 'Sidebar primary accent', usage: 'Active nav item indicator in sidebar' },
  'sidebar-primary-foreground': { description: 'Text on sidebar primary', usage: 'Active nav item text' },
  'sidebar-accent': { description: 'Sidebar hover/selected surface', usage: 'Hovered nav item background' },
  'sidebar-accent-foreground': { description: 'Text on sidebar accent', usage: 'Hovered nav item text' },
  'sidebar-border': { description: 'Sidebar border', usage: 'Sidebar edge border, section dividers' },
  'sidebar-ring': { description: 'Sidebar focus ring', usage: 'Focus state on sidebar items' },

  // Charts
  'chart-1': { description: 'Chart colour 1', usage: 'First data series in charts' },
  'chart-2': { description: 'Chart colour 2', usage: 'Second data series in charts' },
  'chart-3': { description: 'Chart colour 3', usage: 'Third data series in charts' },
  'chart-4': { description: 'Chart colour 4', usage: 'Fourth data series in charts' },
  'chart-5': { description: 'Chart colour 5', usage: 'Fifth data series in charts' },
};

export const COLOUR_TOKEN_GROUPS: { name: string; tokens: string[] }[] = [
  { name: 'Core Surfaces', tokens: ['background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground'] },
  { name: 'Primary', tokens: ['primary', 'primary-foreground'] },
  { name: 'Secondary', tokens: ['secondary', 'secondary-foreground'] },
  { name: 'Muted', tokens: ['muted', 'muted-foreground', 'tertiary-foreground'] },
  { name: 'Accent', tokens: ['accent', 'accent-foreground', 'accent-hover'] },
  { name: 'Destructive', tokens: ['destructive', 'destructive-foreground', 'destructive-subtle', 'destructive-border'] },
  { name: 'Warning', tokens: ['warning', 'warning-foreground', 'warning-subtle', 'warning-border'] },
  { name: 'Success', tokens: ['success', 'success-foreground', 'success-subtle', 'success-border'] },
  { name: 'Info', tokens: ['info', 'info-foreground', 'info-subtle', 'info-border'] },
  { name: 'Border', tokens: ['border', 'input', 'ring', 'border-strong'] },
  { name: 'Disabled', tokens: ['disabled', 'disabled-foreground'] },
  { name: 'Extended', tokens: ['background-sunken', 'background-elevated', 'text-inverse', 'danger-hover', 'danger-text', 'neutral-hover', 'neutral-subtle', 'neutral-text', 'neutral-border'] },
  { name: 'Sidebar', tokens: ['sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'] },
  { name: 'Charts', tokens: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] },
];


/**
 * Default TokenConfig — derived from the current globals.css values.
 *
 * Colour values are stored as Tailwind primitive references ({palette}-{shade}).
 * These map to the hex values defined in globals.css :root and [data-theme="dark"].
 */
export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  colours: {
    // Core Surfaces
    'background': { light: 'zinc-50', dark: 'zinc-900' },
    'foreground': { light: 'zinc-800', dark: 'zinc-50' },
    'card': { light: 'white-50', dark: 'zinc-800' },
    'card-foreground': { light: 'zinc-800', dark: 'zinc-50' },
    'popover': { light: 'white-50', dark: 'zinc-900' },
    'popover-foreground': { light: 'zinc-800', dark: 'zinc-50' },

    // Primary
    'primary': { light: 'mint-500', dark: 'mint-500' },
    'primary-foreground': { light: 'white-50', dark: 'white-50' },

    // Secondary
    'secondary': { light: 'zinc-100', dark: 'zinc-800' },
    'secondary-foreground': { light: 'zinc-800', dark: 'zinc-50' },

    // Muted
    'muted': { light: 'zinc-100', dark: 'zinc-800' },
    'muted-foreground': { light: 'zinc-500', dark: 'zinc-400' },
    'tertiary-foreground': { light: 'zinc-400', dark: 'zinc-500' },

    // Accent
    'accent': { light: 'mint-50', dark: 'mint-950' },
    'accent-foreground': { light: 'mint-700', dark: 'mint-300' },
    'accent-hover': { light: 'mint-600', dark: 'mint-400' },

    // Destructive
    'destructive': { light: 'red-500', dark: 'red-500' },
    'destructive-foreground': { light: 'white-50', dark: 'white-50' },
    'destructive-subtle': { light: 'red-50', dark: 'red-950' },
    'destructive-border': { light: 'red-500', dark: 'red-400' },

    // Warning
    'warning': { light: 'amber-500', dark: 'amber-500' },
    'warning-foreground': { light: 'amber-800', dark: 'amber-200' },
    'warning-subtle': { light: 'amber-50', dark: 'amber-950' },
    'warning-border': { light: 'amber-500', dark: 'amber-400' },

    // Success
    'success': { light: 'mint-500', dark: 'mint-500' },
    'success-foreground': { light: 'mint-700', dark: 'mint-300' },
    'success-subtle': { light: 'mint-50', dark: 'mint-950' },
    'success-border': { light: 'mint-500', dark: 'mint-400' },

    // Info
    'info': { light: 'sky-500', dark: 'sky-400' },
    'info-foreground': { light: 'sky-700', dark: 'sky-300' },
    'info-subtle': { light: 'sky-50', dark: 'sky-900' },
    'info-border': { light: 'sky-500', dark: 'sky-400' },

    // Border
    'border': { light: 'zinc-200', dark: 'zinc-700' },
    'input': { light: 'zinc-200', dark: 'zinc-700' },
    'ring': { light: 'mint-500', dark: 'mint-500' },
    'border-strong': { light: 'zinc-300', dark: 'zinc-600' },

    // Disabled
    'disabled': { light: 'zinc-200', dark: 'zinc-700' },
    'disabled-foreground': { light: 'zinc-400', dark: 'zinc-500' },

    // Extended
    'background-sunken': { light: 'zinc-200', dark: 'zinc-950' },
    'background-elevated': { light: 'zinc-300', dark: 'zinc-700' },
    'text-inverse': { light: 'white-50', dark: 'zinc-900' },
    'danger-hover': { light: 'red-600', dark: 'red-500' },
    'danger-text': { light: 'red-700', dark: 'red-300' },
    'neutral-hover': { light: 'zinc-600', dark: 'zinc-500' },
    'neutral-subtle': { light: 'zinc-50', dark: 'zinc-950' },
    'neutral-text': { light: 'zinc-600', dark: 'zinc-400' },
    'neutral-border': { light: 'zinc-400', dark: 'zinc-600' },

    // Sidebar
    'sidebar': { light: 'zinc-100', dark: 'zinc-900' },
    'sidebar-foreground': { light: 'zinc-800', dark: 'zinc-50' },
    'sidebar-primary': { light: 'mint-500', dark: 'mint-500' },
    'sidebar-primary-foreground': { light: 'white-50', dark: 'white-50' },
    'sidebar-accent': { light: 'mint-50', dark: 'mint-950' },
    'sidebar-accent-foreground': { light: 'mint-700', dark: 'mint-300' },
    'sidebar-border': { light: 'zinc-200', dark: 'zinc-700' },
    'sidebar-ring': { light: 'mint-500', dark: 'mint-500' },

    // Charts
    'chart-1': { light: 'mint-500', dark: 'mint-500' },
    'chart-2': { light: 'blue-500', dark: 'blue-400' },
    'chart-3': { light: 'amber-500', dark: 'amber-400' },
    'chart-4': { light: 'purple-500', dark: 'purple-400' },
    'chart-5': { light: 'sky-500', dark: 'sky-400' },
  },

  spacing: {
    'xxs': 2,
    'xs': 4,
    'sm': 8,
    'ms': 12,
    'md': 16,
    'lg': 24,
    'xl': 32,
    'xxl': 40,
  },

  radius: {
    base: 8,
  },

  typography: {
    fontSizes: {
      'xxs': 8,
      'xs': 10,
      'sm': 12,
      'base': 14,
      'lg': 16,
      'xl': 18,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
  },
};
