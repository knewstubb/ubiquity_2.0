import { Badge } from '@/components/ui/badge'
import { CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface BadgeDemoProps {
  text?: string
  mode?: 'semantic' | 'non-semantic'
  'semantic-colour'?: string
  'non-semantic-colour'?: string
  size?: 'sm' | 'default' | 'lg'
  'show-icon'?: boolean
  outline?: boolean
  clickable?: boolean
}

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5',
  default: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
}

export default function BadgeDemo(props: BadgeDemoProps) {
  const hasControls = props.text !== undefined

  if (hasControls) {
    const text = props.text || 'Badge'
    const mode = props.mode ?? 'semantic'
    const size = (props.size ?? 'default') as 'sm' | 'default' | 'lg'
    const showIcon = props['show-icon'] ?? false
    const sizeClass = SIZE_CLASSES[size]
    const isOutline = props.outline ?? false
    const isClickable = props.clickable ?? false
    const clickableClass = isClickable ? 'cursor-pointer hover:brightness-90 transition-all' : ''

    // Semantic mode uses Badge variants directly
    if (mode === 'semantic') {
      const semanticColour = props['semantic-colour'] ?? 'var(--primary)'
      const solidVariantMap: Record<string, string> = {
        'var(--primary)': 'default',
        'var(--destructive)': 'error',
        'var(--warning)': 'warning',
        'var(--info)': 'info',
        'var(--success)': 'success',
        'var(--muted-foreground)': 'neutral',
      }
      const subtleVariantMap: Record<string, string> = {
        'var(--primary)': 'default-subtle',
        'var(--destructive)': 'error-subtle',
        'var(--warning)': 'warning-subtle',
        'var(--info)': 'info-subtle',
        'var(--success)': 'success-subtle',
        'var(--muted-foreground)': 'neutral-subtle',
      }
      const variant = isOutline
        ? (subtleVariantMap[semanticColour] ?? 'success-subtle')
        : (solidVariantMap[semanticColour] ?? 'success')

      return (
        <Badge variant={variant as any} className={cn(sizeClass, clickableClass)}>
          {showIcon && <CheckCircle size={12} weight="fill" />}
          {text}
        </Badge>
      )
    }

    // Non-semantic mode uses inline styles with raw colours
    const colour = props['non-semantic-colour'] ?? '#14B88A'
    const style = isOutline
      ? { backgroundColor: 'transparent', color: colour, borderColor: colour }
      : { backgroundColor: colour, color: '#fff', borderColor: 'transparent' }

    return (
      <span
        className={cn('inline-flex items-center gap-1 rounded-full font-semibold border', sizeClass, clickableClass)}
        style={style}
      >
        {showIcon && <CheckCircle size={12} weight="fill" />}
        {text}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge className="bg-success text-success-foreground border-success-border">Active</Badge>
        <Badge className="bg-info-subtle text-info-foreground border-info-border">Invited</Badge>
        <Badge className="bg-warning-subtle text-warning-foreground border-warning-border">Pending</Badge>
        <Badge className="bg-destructive-subtle text-destructive border-destructive-border">Error</Badge>
      </div>
    </div>
  )
}
