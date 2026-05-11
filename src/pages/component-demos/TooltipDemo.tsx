import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Plus, Gear, Trash } from '@phosphor-icons/react'

export default function TooltipDemo() {
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
              <p>Add new campaign</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline">
                <Gear className="h-4 w-4" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline">
                <Trash className="h-4 w-4" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Delete selected items</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Tooltip on the right</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
