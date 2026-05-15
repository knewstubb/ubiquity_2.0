import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { User, Gear, SignOut, Plus, Envelope, ChatCircle } from '@phosphor-icons/react'

interface DropdownMenuDemoProps {
  'item-count'?: number
  'show-icons'?: boolean
  'show-separators'?: boolean
}

export default function DropdownMenuDemo(props: DropdownMenuDemoProps) {
  const itemCount = props['item-count']
  const showIcons = props['show-icons']
  const showSeparators = props['show-separators']

  const hasControls = itemCount !== undefined

  if (hasControls) {
    const allItems = [
      { label: 'Profile', icon: User },
      { label: 'Settings', icon: Gear },
      { label: 'Messages', icon: Envelope },
      { label: 'Notifications', icon: ChatCircle },
      { label: 'Invite Users', icon: Plus },
      { label: 'Preferences', icon: Gear },
      { label: 'Help', icon: ChatCircle },
      { label: 'Log out', icon: SignOut },
    ]
    const items = allItems.slice(0, itemCount)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          {showSeparators && <DropdownMenuSeparator />}
          {items.map((item, idx) => (
            <span key={item.label}>
              <DropdownMenuItem>
                {showIcons && <item.icon className="mr-2 h-4 w-4" />}
                <span>{item.label}</span>
              </DropdownMenuItem>
              {showSeparators && idx === Math.floor(items.length / 2) - 1 && idx < items.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </span>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Gear className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Plus className="mr-2 h-4 w-4" />
                <span>Invite users</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Envelope className="mr-2 h-4 w-4" />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ChatCircle className="mr-2 h-4 w-4" />
                  <span>Message</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <SignOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
