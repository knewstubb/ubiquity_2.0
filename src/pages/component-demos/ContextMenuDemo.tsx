import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { PencilSimple, Copy, ArrowRight, Trash, Gear, ListBullets, ClockCounterClockwise } from '@phosphor-icons/react'

export default function ContextMenuDemo() {
  return (
    <div className="flex flex-col gap-8">
      {/* Standard context menu */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Right-click Context Menu</h3>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem>
              <PencilSimple weight="bold" className="mr-2 h-4 w-4" />
              Edit
              <ContextMenuShortcut>⌘E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              <Copy weight="bold" className="mr-2 h-4 w-4" />
              Duplicate
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <ArrowRight weight="bold" className="mr-2 h-4 w-4" />
                Move to
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem>Folder A</ContextMenuItem>
                <ContextMenuItem>Folder B</ContextMenuItem>
                <ContextMenuItem>Folder C</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive focus:text-destructive focus:bg-destructive-subtle">
              <Trash weight="bold" className="mr-2 h-4 w-4" />
              Delete
              <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>

      {/* UDS-style action menu */}
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">Action Menu (UDS Style)</h3>
        <ContextMenu>
          <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52">
            <ContextMenuItem>
              <Gear weight="bold" className="mr-2 h-4 w-4" />
              Automation Settings
            </ContextMenuItem>
            <ContextMenuItem>
              <PencilSimple weight="bold" className="mr-2 h-4 w-4" />
              Edit Automation
            </ContextMenuItem>
            <ContextMenuItem>
              <ListBullets weight="bold" className="mr-2 h-4 w-4" />
              Activity Log
            </ContextMenuItem>
            <ContextMenuItem>
              <ClockCounterClockwise weight="bold" className="mr-2 h-4 w-4" />
              History
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive focus:text-destructive focus:bg-destructive-subtle">
              <Trash weight="bold" className="mr-2 h-4 w-4" />
              Delete Automation
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </section>
    </div>
  )
}
