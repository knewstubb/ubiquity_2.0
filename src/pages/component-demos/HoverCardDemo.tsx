import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarBlank } from '@phosphor-icons/react'

interface HoverCardDemoProps {
  'open-delay'?: number
  'close-delay'?: number
  side?: string
}

export default function HoverCardDemo(props: HoverCardDemoProps) {
  const openDelay = props['open-delay']
  const closeDelay = props['close-delay']
  const side = props.side

  const hasControls = openDelay !== undefined

  if (hasControls) {
    return (
      <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
        <HoverCardTrigger asChild>
          <a href="#" className="text-sm font-medium underline underline-offset-4">
            @sarah_chen
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side={side as 'top' | 'right' | 'bottom' | 'left'}>
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=sarah" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Sarah Chen</h4>
              <p className="text-sm text-muted-foreground">
                Marketing Manager at Acme Corp. Manages campaigns and audience segments.
              </p>
              <div className="flex items-center pt-2">
                <CalendarBlank className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  Joined December 2023
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="#" className="text-sm font-medium underline underline-offset-4">
            @sarah_chen
          </a>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=sarah" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Sarah Chen</h4>
              <p className="text-sm text-muted-foreground">
                Marketing Manager at Acme Corp. Manages campaigns and audience segments.
              </p>
              <div className="flex items-center pt-2">
                <CalendarBlank className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">
                  Joined December 2023
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
