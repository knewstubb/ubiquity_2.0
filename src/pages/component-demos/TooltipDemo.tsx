import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Plus, Gear, Trash } from '@phosphor-icons/react'

interface TooltipDemoProps {
  content?: string
  side?: string
  delay?: number
}

export default function TooltipDemo(props: TooltipDemoProps) {
  const hasControls = props.content !== undefined

  if (hasControls) {
    const content = (props.content as string) ?? 'Add to library'
    const side = (props.side ?? 'top') as 'top' | 'right' | 'bottom' | 'left'
    const delay = (props.delay as number) ?? 200

    return (
      <TooltipProvider delayDuration={delay}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <TooltipProvider>
        <div className="flex flex-wrap gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline">
                <Plus className="h-4 w-4" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Add new campaign
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline">
                <Gear className="h-4 w-4" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Settings
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline">
                <Trash className="h-4 w-4" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Delete selected items
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Tooltip on the right
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
