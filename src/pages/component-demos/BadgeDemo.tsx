import { Badge } from '@/components/ui/badge'

interface BadgeDemoProps {
  text?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  colour?: string
}

export default function BadgeDemo({ text, variant, colour }: BadgeDemoProps) {
  const hasControls = text !== undefined

  if (hasControls) {
    return (
      <Badge variant={variant} style={colour ? { backgroundColor: colour, borderColor: colour, color: '#fff' } : undefined}>
        {text}
      </Badge>
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
