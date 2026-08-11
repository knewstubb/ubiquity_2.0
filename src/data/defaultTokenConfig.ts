import type { TokenConfig } from '../models/tokenConfig';

/**
 * Colour Token System
 * 
 * Organised into semantic groups that map to specific UI concerns.
 * Each group has a clear purpose — avoid using tokens outside their intended context.
 */

export interface TokenDescription {
  description: string;
  usage: string;
}

export interface TokenGroupDefinition {
  name: string;
  description: string;
  tokens: string[];
}

export const TOKEN_DESCRIPTIONS: Record<string, TokenDescription> = {
  // ─── Surfaces ───────────────────────────────────────────────────────────────
  // The layered canvas system — page backgrounds and elevated containers
  'background': { description: 'Page background', usage: 'Main app background, body, modals (overlay provides separation)' },
  'background-subtle': { description: 'Subtle background', usage: 'Sidebars, wizard panels, nav areas' },
  'foreground': { description: 'Default text', usage: 'Body text, headings, labels' },
  'card': { description: 'Card surface', usage: 'Elevated cards on page. Use bg-card/50 for subtle inactive states.' },
  'card-foreground': { description: 'Card text', usage: 'Text inside cards' },
  'card-nested': { description: 'Nested card surface', usage: 'Cards inside cards, nested panels' },
  'card-nested-foreground': { description: 'Nested card text', usage: 'Text inside nested cards' },

  // ─── Overlays ───────────────────────────────────────────────────────────────
  // Floating UI elements that appear above the page
  'popover': { description: 'Popover surface', usage: 'Dropdown menus, popovers' },
  'popover-foreground': { description: 'Popover text', usage: 'Text in dropdowns' },
  'tooltip': { description: 'Tooltip surface', usage: 'Tooltip backgrounds' },
  'tooltip-foreground': { description: 'Tooltip text', usage: 'Text in tooltips' },

  // ─── Primary ────────────────────────────────────────────────────────────────
  // The brand action colour — primary buttons, active states, links
  'primary': { description: 'Primary brand colour', usage: 'Primary buttons, active indicators, links' },
  'primary-foreground': { description: 'Primary text', usage: 'Text on primary buttons' },

  // ─── Secondary ──────────────────────────────────────────────────────────────
  // De-emphasised interactive elements — secondary buttons, toggles
  'secondary': { description: 'Secondary surface', usage: 'Secondary buttons, toggle backgrounds' },
  'secondary-foreground': { description: 'Secondary text', usage: 'Text on secondary buttons' },

  // ─── Muted ──────────────────────────────────────────────────────────────────
  // Subdued surfaces and text — placeholders, disabled states, metadata
  'muted': { description: 'Muted surface', usage: 'Subtle fills, disabled backgrounds' },
  'muted-foreground': { description: 'Muted text', usage: 'Placeholder text, helper text' },
  'tertiary-foreground': { description: 'Tertiary text', usage: 'Least prominent text, timestamps' },
  'disabled': { description: 'Disabled surface', usage: 'Disabled button/input backgrounds' },
  'disabled-foreground': { description: 'Disabled text', usage: 'Greyed-out labels' },

  // ─── Accent ─────────────────────────────────────────────────────────────────
  // Brand highlighting — selected items, info callouts, hover emphasis
  'accent': { description: 'Accent surface', usage: 'Highlighted rows, selected items, info callouts' },
  'accent-foreground': { description: 'Accent text', usage: 'Text in highlighted items' },
  'accent-hover': { description: 'Accent hover', usage: 'Primary button hover, link hover' },

  // ─── Status ─────────────────────────────────────────────────────────────────
  // Semantic feedback states — errors, warnings, success, information
  'destructive': { description: 'Destructive/error', usage: 'Delete buttons, error states' },
  'destructive-foreground': { description: 'Destructive text', usage: 'Text on destructive buttons' },
  'destructive-subtle': { description: 'Subtle destructive', usage: 'Error banners, validation backgrounds' },
  'destructive-border': { description: 'Destructive border', usage: 'Error input borders' },
  'warning': { description: 'Warning', usage: 'Warning badges, caution indicators' },
  'warning-foreground': { description: 'Warning text', usage: 'Warning banner text' },
  'warning-subtle': { description: 'Subtle warning', usage: 'Warning banner backgrounds' },
  'warning-border': { description: 'Warning border', usage: 'Warning alert borders' },
  'success': { description: 'Success', usage: 'Success badges, confirmations' },
  'success-foreground': { description: 'Success text', usage: 'Success message text' },
  'success-subtle': { description: 'Subtle success', usage: 'Success banner backgrounds' },
  'success-border': { description: 'Success border', usage: 'Success alert borders' },
  'info': { description: 'Informational', usage: 'Info badges, help indicators' },
  'info-foreground': { description: 'Info text', usage: 'Info banner text' },
  'info-subtle': { description: 'Subtle info', usage: 'Info banner backgrounds' },
  'info-border': { description: 'Info border', usage: 'Info alert borders' },

  // ─── Borders ────────────────────────────────────────────────────────────────
  // Dividers, input borders, focus indicators
  'border': { description: 'Default border', usage: 'Card borders, dividers, table lines' },
  'border-strong': { description: 'Strong border', usage: 'Active borders, section dividers' },
  'input': { description: 'Input border', usage: 'Text inputs, selects, textareas' },
  'ring': { description: 'Focus ring', usage: 'Focus outline on interactive elements' },

  // ─── Neutral ────────────────────────────────────────────────────────────────
  // Utility tokens for edge cases — inverted text, sunken/elevated surfaces
  'background-sunken': { description: 'Sunken background', usage: 'Inset panels, code blocks' },
  'background-elevated': { description: 'Elevated background', usage: 'Skeleton loaders, raised surfaces' },
  'text-inverse': { description: 'Inverse text', usage: 'White text on dark surfaces' },
  'neutral-hover': { description: 'Neutral hover', usage: 'Neutral button hover state' },
  'neutral-subtle': { description: 'Subtle neutral', usage: 'Neutral badge backgrounds' },
  'neutral-text': { description: 'Neutral text', usage: 'Neutral badge labels' },
  'neutral-border': { description: 'Neutral border', usage: 'Neutral badge borders' },

  // ─── Charts ─────────────────────────────────────────────────────────────────
  // Data visualisation colour sequence
  'chart-1': { description: 'Chart colour 1', usage: 'First data series' },
  'chart-2': { description: 'Chart colour 2', usage: 'Second data series' },
  'chart-3': { description: 'Chart colour 3', usage: 'Third data series' },
  'chart-4': { description: 'Chart colour 4', usage: 'Fourth data series' },
  'chart-5': { description: 'Chart colour 5', usage: 'Fifth data series' },
};

/**
 * Token groups with descriptions for the UI
 */
export const COLOUR_TOKEN_GROUPS: TokenGroupDefinition[] = [
  {
    name: 'Surfaces',
    description: 'The layered canvas system — page backgrounds and elevated containers. Use opacity modifiers (e.g. bg-card/50) for subtle variants.',
    tokens: ['background', 'background-subtle', 'foreground', 'card', 'card-foreground', 'card-nested', 'card-nested-foreground'],
  },
  {
    name: 'Overlays',
    description: 'Floating UI elements that appear above the page',
    tokens: ['popover', 'popover-foreground', 'tooltip', 'tooltip-foreground'],
  },
  {
    name: 'Primary',
    description: 'The brand action colour — primary buttons, active states, links',
    tokens: ['primary', 'primary-foreground'],
  },
  {
    name: 'Secondary',
    description: 'De-emphasised interactive elements — secondary buttons, toggles',
    tokens: ['secondary', 'secondary-foreground'],
  },
  {
    name: 'Muted',
    description: 'Subdued surfaces and text — placeholders, disabled states, metadata',
    tokens: ['muted', 'muted-foreground', 'tertiary-foreground', 'disabled', 'disabled-foreground'],
  },
  {
    name: 'Accent',
    description: 'Brand highlighting — selected items, info callouts, hover emphasis',
    tokens: ['accent', 'accent-foreground', 'accent-hover'],
  },
  {
    name: 'Status',
    description: 'Semantic feedback states — errors, warnings, success, information',
    tokens: [
      'destructive', 'destructive-foreground', 'destructive-subtle', 'destructive-border',
      'warning', 'warning-foreground', 'warning-subtle', 'warning-border',
      'success', 'success-foreground', 'success-subtle', 'success-border',
      'info', 'info-foreground', 'info-subtle', 'info-border',
    ],
  },
  {
    name: 'Borders',
    description: 'Dividers, input borders, focus indicators',
    tokens: ['border', 'border-strong', 'input', 'ring'],
  },
  {
    name: 'Neutral',
    description: 'Utility tokens for edge cases — inverted text, sunken/elevated surfaces',
    tokens: ['background-sunken', 'background-elevated', 'text-inverse', 'neutral-hover', 'neutral-subtle', 'neutral-text', 'neutral-border'],
  },
  {
    name: 'Charts',
    description: 'Data visualisation colour sequence',
    tokens: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
  },
];


/**
 * Default TokenConfig — derived from the current globals.css values.
 *
 * Colour values are stored as Tailwind primitive references ({palette}-{shade}).
 * These map to the hex values defined in globals.css :root and [data-theme="dark"].
 */
export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  colours: {
    // Surfaces
    'background': { light: 'zinc-50', dark: 'zinc-900' },
    'background-subtle': { light: 'zinc-100', dark: 'zinc-800' },
    'foreground': { light: 'zinc-800', dark: 'zinc-50' },
    'card': { light: 'white', dark: 'zinc-800' },
    'card-foreground': { light: 'zinc-800', dark: 'zinc-50' },
    'card-nested': { light: 'zinc-50', dark: 'zinc-800' },
    'card-nested-foreground': { light: 'zinc-800', dark: 'zinc-50' },

    // Overlays
    'popover': { light: 'white', dark: 'zinc-900' },
    'popover-foreground': { light: 'zinc-800', dark: 'zinc-50' },
    'tooltip': { light: 'zinc-800', dark: 'zinc-50' },
    'tooltip-foreground': { light: 'white', dark: 'zinc-900' },

    // Primary
    'primary': { light: 'mint-500', dark: 'mint-500' },
    'primary-foreground': { light: 'white', dark: 'white' },

    // Secondary
    'secondary': { light: 'zinc-100', dark: 'zinc-800' },
    'secondary-foreground': { light: 'zinc-800', dark: 'zinc-50' },

    // Muted
    'muted': { light: 'zinc-100', dark: 'zinc-800' },
    'muted-foreground': { light: 'zinc-500', dark: 'zinc-400' },
    'tertiary-foreground': { light: 'zinc-400', dark: 'zinc-500' },
    'disabled': { light: 'zinc-200', dark: 'zinc-700' },
    'disabled-foreground': { light: 'zinc-400', dark: 'zinc-500' },

    // Accent
    'accent': { light: 'mint-50', dark: 'mint-950' },
    'accent-foreground': { light: 'mint-700', dark: 'mint-300' },
    'accent-hover': { light: 'mint-600', dark: 'mint-400' },

    // Status
    'destructive': { light: 'red-500', dark: 'red-500' },
    'destructive-foreground': { light: 'white', dark: 'white' },
    'destructive-subtle': { light: 'red-50', dark: 'red-950' },
    'destructive-border': { light: 'red-500', dark: 'red-400' },
    'warning': { light: 'amber-500', dark: 'amber-500' },
    'warning-foreground': { light: 'amber-800', dark: 'amber-200' },
    'warning-subtle': { light: 'amber-50', dark: 'amber-950' },
    'warning-border': { light: 'amber-500', dark: 'amber-400' },
    'success': { light: 'mint-500', dark: 'mint-500' },
    'success-foreground': { light: 'mint-700', dark: 'mint-300' },
    'success-subtle': { light: 'mint-50', dark: 'mint-950' },
    'success-border': { light: 'mint-500', dark: 'mint-400' },
    'info': { light: 'sky-500', dark: 'sky-400' },
    'info-foreground': { light: 'sky-700', dark: 'sky-300' },
    'info-subtle': { light: 'sky-50', dark: 'sky-900' },
    'info-border': { light: 'sky-500', dark: 'sky-400' },

    // Borders
    'border': { light: 'zinc-200', dark: 'zinc-700' },
    'border-strong': { light: 'zinc-300', dark: 'zinc-600' },
    'input': { light: 'zinc-200', dark: 'zinc-700' },
    'ring': { light: 'mint-500', dark: 'mint-500' },

    // Neutral
    'background-sunken': { light: 'zinc-200', dark: 'zinc-950' },
    'background-elevated': { light: 'zinc-300', dark: 'zinc-700' },
    'text-inverse': { light: 'white', dark: 'zinc-900' },
    'neutral-hover': { light: 'zinc-600', dark: 'zinc-500' },
    'neutral-subtle': { light: 'zinc-50', dark: 'zinc-950' },
    'neutral-text': { light: 'zinc-600', dark: 'zinc-400' },
    'neutral-border': { light: 'zinc-400', dark: 'zinc-600' },

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
