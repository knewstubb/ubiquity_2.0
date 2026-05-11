import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusBadgeVariant = 'active' | 'invited' | 'inactive' | 'error'

interface StatusBadgeProps {
  variant: StatusBadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  active: 'bg-success-subtle text-success-foreground border-success-border hover:bg-success-subtle',
  invited: 'bg-info-subtle text-info-foreground border-info-border hover:bg-info-subtle',
  inactive: 'bg-secondary text-muted-foreground border-border hover:bg-secondary',
  error: 'bg-destructive-subtle text-destructive border-destructive-border hover:bg-destructive-subtle',
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(variantStyles[variant], className)}>
      {children}
    </Badge>
  )
}
