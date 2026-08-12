# Design Tokens

> **Last updated:** 2026-07-28
> **Token source:** `src/styles/globals.css`

## Colours

### Surfaces

The layered canvas system — page backgrounds and elevated containers.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--background` | Page-level canvas, modal backdrops | zinc-50 `#FAFAFA` | zinc-900 `#18181B` |
| `--background-subtle` | Sidebars, wizard panels, nav areas | zinc-100 `#F4F4F5` | zinc-800 `#27272A` |
| `--foreground` | Body text, headings, labels | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |
| `--card` | Elevated cards, panels, modals | white `#FFFFFF` | zinc-800 `#27272A` |
| `--card-foreground` | Text inside card components | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |
| `--card-nested` | Cards inside cards, nested panels | zinc-50 `#FAFAFA` | zinc-900 `#18181B` |
| `--card-nested-foreground` | Text inside nested cards | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |

### Overlays

Floating UI elements that appear above the page.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--popover` | Dropdown menus, select content, popovers | white `#FFFFFF` | zinc-900 `#18181B` |
| `--popover-foreground` | Text inside popover elements | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |
| `--tooltip` | Tooltip backgrounds | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |
| `--tooltip-foreground` | Tooltip text | white `#FFFFFF` | zinc-900 `#18181B` |

### Primary

The brand action colour — primary buttons, active states, links.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--primary` | Primary buttons, active nav indicators, links | mint-500 `#14B88A` | mint-500 `#14B88A` |
| `--primary-foreground` | Button labels on primary buttons | white `#FFFFFF` | white `#FFFFFF` |

### Secondary

De-emphasised interactive elements — secondary buttons, toggles.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--secondary` | Secondary buttons, toggle backgrounds | zinc-100 `#F4F4F5` | zinc-800 `#27272A` |
| `--secondary-foreground` | Labels on secondary buttons | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |

### Muted

Subdued surfaces and text — placeholders, disabled states, metadata.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--muted` | Disabled backgrounds, subtle fills, input backgrounds on card surfaces | zinc-100 `#F4F4F5` | zinc-800 `#27272A` |
| `--muted-foreground` | Placeholder text, helper text, timestamps | zinc-500 `#71717A` | zinc-400 `#A1A1AA` |
| `--tertiary-foreground` | Least prominent text, metadata | zinc-400 `#A1A1AA` | zinc-500 `#71717A` |
| `--disabled` | Disabled button/input backgrounds | zinc-200 `#E4E4E7` | zinc-700 `#3F3F46` |
| `--disabled-foreground` | Greyed-out labels on disabled controls | zinc-400 `#A1A1AA` | zinc-500 `#71717A` |

### Accent

Brand highlighting — selected items, info callouts, hover emphasis.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--accent` | Highlighted rows, selected item backgrounds | mint-50 `#E6F9F5` | mint-950 `#043D2E` |
| `--accent-foreground` | Text in highlighted/selected items | mint-600 `#10A078` | mint-500 `#14B88A` |
| `--accent-hover` | Primary button hover, link hover | mint-700 `#0D8866` | mint-400 `#26C79D` |

### Status

Semantic feedback states — errors, warnings, success, information.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--destructive` | Delete buttons, error states | red-500 `#EF4444` | red-500 `#EF4444` |
| `--destructive-foreground` | Labels on delete buttons | white `#FFFFFF` | white `#FFFFFF` |
| `--destructive-subtle` | Error banners, validation backgrounds | red-50 `#FEF2F2` | red-950 `#450A0A` |
| `--destructive-border` | Error input borders, alert borders | red-500 `#EF4444` | red-400 `#F87171` |
| `--warning` | Warning badges, caution indicators | amber-500 `#F59E0B` | amber-500 `#F59E0B` |
| `--warning-foreground` | Warning banner text | amber-800 `#92400E` | amber-200 `#FDE68A` |
| `--warning-subtle` | Warning banner backgrounds | amber-50 `#FFFBEB` | amber-950 `#451A03` |
| `--warning-border` | Warning alert borders | amber-500 `#F59E0B` | amber-400 `#FBBF24` |
| `--success` | Success badges, confirmation indicators | green-500 `#22C55E` | green-500 `#22C55E` |
| `--success-foreground` | Success message text | green-600 `#16A34A` | green-300 `#86EFAC` |
| `--success-subtle` | Success banner backgrounds | green-50 `#F0FDF4` | green-950 `#052E16` |
| `--success-border` | Success alert borders | green-500 `#22C55E` | green-400 `#4ADE80` |
| `--info` | Info badges, help indicators | sky-500 `#0EA5E9` | sky-400 `#38BDF8` |
| `--info-foreground` | Info banner text | sky-700 `#0369A1` | sky-300 `#7DD3FC` |
| `--info-subtle` | Info banner backgrounds | sky-50 `#F0F9FF` | sky-900 `#0C4A6E` |
| `--info-border` | Info alert borders | sky-500 `#0EA5E9` | sky-400 `#38BDF8` |

### Borders

Dividers, input borders, focus indicators.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--border` | Card borders, dividers, table lines | zinc-200 `#E4E4E7` | zinc-700 `#3F3F46` |
| `--border-strong` | Active borders, stronger dividers | zinc-300 `#D4D4D8` | zinc-600 `#52525B` |
| `--input` | Text inputs, selects, textareas | zinc-200 `#E4E4E7` | zinc-600 `#52525B` |
| `--ring` | Focus outline on interactive elements | mint-500 `#14B88A` | mint-500 `#14B88A` |

### Neutral

Utility tokens for edge cases — inverted text, sunken/elevated surfaces.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--background-sunken` | Inset panels, code blocks, well areas | zinc-200 `#E4E4E7` | zinc-950 `#09090B` |
| `--background-elevated` | Raised surfaces, skeleton loaders | zinc-300 `#D4D4D8` | zinc-700 `#3F3F46` |
| `--text-inverse` | White text on dark surfaces | white `#FFFFFF` | zinc-900 `#18181B` |
| `--neutral-hover` | Neutral button hover state | zinc-600 `#52525B` | zinc-500 `#71717A` |
| `--neutral-subtle` | Neutral badge backgrounds, chip fills | zinc-50 `#FAFAFA` | zinc-950 `#09090B` |
| `--neutral-text` | Neutral badge labels, secondary text | zinc-600 `#52525B` | zinc-400 `#A1A1AA` |
| `--neutral-border` | Neutral badge borders, chip outlines | zinc-400 `#A1A1AA` | zinc-600 `#52525B` |

### Charts

Data visualisation colour sequence.

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--chart-1` | First data series | mint-500 `#14B88A` | mint-500 `#14B88A` |
| `--chart-2` | Second data series | blue-500 `#3B82F6` | blue-400 `#60A5FA` |
| `--chart-3` | Third data series | amber-500 `#F59E0B` | amber-400 `#FBBF24` |
| `--chart-4` | Fourth data series | purple-500 `#A855F7` | purple-400 `#C084FC` |
| `--chart-5` | Fifth data series | sky-500 `#0EA5E9` | sky-400 `#38BDF8` |
