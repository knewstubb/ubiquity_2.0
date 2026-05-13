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
    const colour = mode === 'non-semantic'
      ? (props['non-semantic-colour'] ?? '#14B88A')
      : (props['semantic-colour'] ?? '#14B88A')

    const style = isOutline
      ? { backgroundColor: 'transparent', color: colour, borderColor: colour }
      : { backgroundColor: colour, color: '#fff', borderColor: 'transparent' }

    return (
      <span
        className={cn('inline-flex items-center gap-1 rounded-full font-semibold border', sizeClass)}
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
