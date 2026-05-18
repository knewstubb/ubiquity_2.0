# Design Tokens

## Colours

### Core Surfaces

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--background` | Main app background, body | zinc-50 `#FAFAFA` | zinc-900 `#18181B` |
| `--foreground` | Body text, headings, labels | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |
| `--card` | Card backgrounds, elevated panels | white `#FFFFFF` | zinc-800 `#27272A` |
| `--card-foreground` | Text inside card components | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |
| `--surface` | Flat content areas, list items, table rows, inline panels | white `#FFFFFF` | black `#000000` |
| `--popover` | Dropdown menus, tooltips, popovers | white `#FFFFFF` | zinc-900 `#18181B` |
| `--popover-foreground` | Text inside dropdown menus and tooltips | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |

### Primary

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--primary` | Primary buttons, active nav indicators, links | mint-500 `#14B88A` | mint-500 `#14B88A` |
| `--primary-foreground` | Button labels on primary buttons | white `#FFFFFF` | white `#FFFFFF` |

### Secondary

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--secondary` | Secondary buttons, toggle backgrounds | zinc-100 `#F4F4F5` | zinc-800 `#27272A` |
| `--secondary-foreground` | Labels on secondary buttons | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |

### Muted

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--muted` | Disabled backgrounds, subtle fills | zinc-100 `#F4F4F5` | zinc-800 `#27272A` |
| `--muted-foreground` | Placeholder text, helper text, timestamps | zinc-500 `#71717A` | zinc-400 `#A1A1AA` |
| `--tertiary-foreground` | Least prominent text, metadata | zinc-400 `#A1A1AA` | zinc-500 `#71717A` |

### Accent

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--accent` | Highlighted rows, selected item backgrounds | mint-50 `#E6F9F5` | mint-950 `#043D2E` |
| `--accent-foreground` | Text in highlighted/selected items | mint-600 `#10A078` | mint-500 `#14B88A` |
| `--accent-hover` | Primary button hover, link hover | mint-700 `#0D8866` | mint-400 `#26C79D` |

### Destructive

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--destructive` | Delete buttons, error states | red-500 `#EF4444` | red-500 `#EF4444` |
| `--destructive-foreground` | Labels on delete buttons | white `#FFFFFF` | white `#FFFFFF` |
| `--destructive-subtle` | Error banners, validation backgrounds | red-50 `#FEF2F2` | red-950 `#450A0A` |
| `--destructive-border` | Error input borders, alert borders | red-500 `#EF4444` | red-400 `#F87171` |

### Warning

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--warning` | Warning badges, caution indicators | amber-500 `#F59E0B` | amber-500 `#F59E0B` |
| `--warning-foreground` | Warning banner text | amber-800 `#92400E` | amber-200 `#FDE68A` |
| `--warning-subtle` | Warning banner backgrounds | amber-50 `#FFFBEB` | amber-950 `#451A03` |
| `--warning-border` | Warning alert borders | amber-500 `#F59E0B` | amber-400 `#FBBF24` |

### Success

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--success` | Success badges, confirmation indicators | mint-500 `#14B88A` | mint-500 `#14B88A` |
| `--success-foreground` | Success message text | mint-700 `#0D8866` | mint-300 `#4DD4B6` |
| `--success-subtle` | Success banner backgrounds | mint-50 `#E6F9F5` | mint-950 `#043D2E` |
| `--success-border` | Success alert borders | mint-500 `#14B88A` | mint-400 `#26C79D` |

### Info

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--info` | Info badges, help indicators | sky-500 `#0EA5E9` | sky-400 `#38BDF8` |
| `--info-foreground` | Info banner text | sky-700 `#0369A1` | sky-300 `#7DD3FC` |
| `--info-subtle` | Info banner backgrounds | sky-50 `#F0F9FF` | sky-900 `#0C4A6E` |
| `--info-border` | Info alert borders | sky-500 `#0EA5E9` | sky-400 `#38BDF8` |

### Border

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--border` | Card borders, dividers, table lines | zinc-200 `#E4E4E7` | zinc-700 `#3F3F46` |
| `--input` | Text inputs, selects, textareas | zinc-300 `#D4D4D8` | zinc-600 `#52525B` |
| `--ring` | Focus outline on interactive elements | mint-500 `#14B88A` | mint-500 `#14B88A` |
| `--border-strong` | Active borders, stronger dividers between sections | zinc-300 `#D4D4D8` | zinc-600 `#52525B` |

### Disabled

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--disabled` | Disabled button/input backgrounds | zinc-200 `#E4E4E7` | zinc-700 `#3F3F46` |
| `--disabled-foreground` | Greyed-out labels on disabled controls | zinc-400 `#A1A1AA` | zinc-500 `#71717A` |

### Extended

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--background-sunken` | Inset panels, code blocks, well areas | zinc-200 `#E4E4E7` | zinc-950 `#09090B` |
| `--background-elevated` | Raised surfaces above subtle, skeleton loaders | zinc-300 `#D4D4D8` | zinc-700 `#3F3F46` |
| `--text-inverse` | White text on dark surfaces, tooltips | white `#FFFFFF` | zinc-900 `#18181B` |
| `--danger-hover` | Delete button hover, error link hover | red-600 `#DC2626` | red-500 `#EF4444` |
| `--danger-text` | Error messages, validation text | red-700 `#B91C1C` | red-300 `#FCA5A5` |
| `--neutral-hover` | Neutral button hover state | zinc-600 `#52525B` | zinc-500 `#71717A` |
| `--neutral-subtle` | Neutral badge backgrounds, chip fills | zinc-50 `#FAFAFA` | zinc-950 `#09090B` |
| `--neutral-text` | Neutral badge labels, secondary button text | zinc-600 `#52525B` | zinc-400 `#A1A1AA` |
| `--neutral-border` | Neutral badge borders, chip outlines | zinc-400 `#A1A1AA` | zinc-600 `#52525B` |

### Sidebar

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--sidebar` | Navigation sidebar surface | zinc-100 `#F4F4F5` | zinc-900 `#18181B` |
| `--sidebar-foreground` | Nav item labels in sidebar | zinc-800 `#27272A` | zinc-50 `#FAFAFA` |
| `--sidebar-primary` | Active nav item indicator in sidebar | mint-500 `#14B88A` | mint-500 `#14B88A` |
| `--sidebar-primary-foreground` | Active nav item text | white `#FFFFFF` | white `#FFFFFF` |
| `--sidebar-accent` | Hovered nav item background | mint-50 `#E6F9F5` | mint-950 `#043D2E` |
| `--sidebar-accent-foreground` | Hovered nav item text | mint-700 `#0D8866` | mint-300 `#4DD4B6` |
| `--sidebar-border` | Sidebar edge border, section dividers | zinc-200 `#E4E4E7` | zinc-700 `#3F3F46` |
| `--sidebar-ring` | Focus state on sidebar items | mint-500 `#14B88A` | mint-500 `#14B88A` |

### Charts

| Token | Purpose | Light | Dark |
|---|---|---|---|
| `--chart-1` | First data series in charts | mint-500 `#14B88A` | mint-500 `#14B88A` |
| `--chart-2` | Second data series in charts | blue-500 `#3B82F6` | blue-400 `#60A5FA` |
| `--chart-3` | Third data series in charts | amber-500 `#F59E0B` | amber-400 `#FBBF24` |
| `--chart-4` | Fourth data series in charts | purple-500 `#A855F7` | purple-400 `#C084FC` |
| `--chart-5` | Fifth data series in charts | sky-500 `#0EA5E9` | sky-400 `#38BDF8` |
