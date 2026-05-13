import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AvatarDemoProps {
  variant?: 'neutral' | 'coloured' | 'image'
  size?: 'sm' | 'default' | 'lg'
  initials?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  default: 'h-9 w-9',
  lg: 'h-10 w-10',
}

const textClasses = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
}

export default function AvatarDemo({ variant, size, initials }: AvatarDemoProps) {
  const hasControls = variant !== undefined

  if (hasControls) {
    const s = (size ?? 'default') as 'sm' | 'default' | 'lg'
    const sizeClass = sizeClasses[s]
    const textClass = textClasses[s]
    const displayInitials = initials || 'BK'

    if (variant === 'image') {
      return (
        <Avatar className={cn(sizeClass)}>
          <AvatarImage src="https://i.pravatar.cc/150?u=sarah" alt="User" />
          <AvatarFallback className={cn('bg-primary text-primary-foreground', textClass)}>
            {displayInitials}
          </AvatarFallback>
        </Avatar>
      )
    }

    // For non-image variants, render a plain div to avoid Radix fallback delay
    const bgClass = variant === 'coloured' ? 'bg-info text-white' : 'bg-primary text-primary-foreground'

    return (
      <div className={cn('flex items-center justify-center rounded-full font-semibold shrink-0', sizeClass, bgClass, textClass)}>
        {displayInitials}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Chen" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?u=james" alt="James Wilson" />
          <AvatarFallback>JW</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/150?u=maria" alt="Maria Lopez" />
          <AvatarFallback>ML</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">BK</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback className="bg-info text-white">TN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback className="bg-warning text-white">RP</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">SM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">LG</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
