# Custom Icons

Custom SVG icons that don't exist in Phosphor Icons. Each icon is a React component that follows the same API pattern as Phosphor.

## Usage

```tsx
import { AwsS3Icon } from '@/components/icons'

<AwsS3Icon size={24} className="text-primary" />
```

## Creating a new icon

1. Create a new file in this folder: `MyIcon.tsx`
2. Follow this template:

```tsx
import { cn } from '@/lib/utils'

interface MyIconProps {
  size?: number
  className?: string
  weight?: 'regular' | 'fill'
}

export function MyIcon({ size = 24, className, weight = 'regular' }: MyIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      {weight === 'fill' ? (
        <path d="..." fill="currentColor" />
      ) : (
        <path d="..." stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}
```

3. Export it from `index.ts`

## Rules

- Always use `currentColor` for stroke/fill so the icon inherits text colour from Tailwind
- Support `size` prop (default 24) for consistent sizing
- Support `weight` prop with at least `regular` (outline) and `fill` (solid)
- Add `shrink-0` to prevent flex shrinking
- Use a 24×24 viewBox for consistency with Phosphor
- Name the component in PascalCase matching the file name
