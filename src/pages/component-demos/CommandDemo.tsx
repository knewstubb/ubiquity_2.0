import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { CalendarBlank, Envelope, Gear, User, MagnifyingGlass, ChatCircle, Bell, Star } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

interface CommandDemoProps {
  placeholder?: string
  'show-groups'?: boolean
  'item-count'?: number
}

interface CommandItemData {
  icon: ReactNode
  label: string
  group: 'suggestions' | 'settings'
}

const ALL_ITEMS: CommandItemData[] = [
  { icon: <CalendarBlank className="mr-2 h-4 w-4" />, label: 'Schedule Campaign', group: 'suggestions' },
  { icon: <Envelope className="mr-2 h-4 w-4" />, label: 'Create Email', group: 'suggestions' },
  { icon: <MagnifyingGlass className="mr-2 h-4 w-4" />, label: 'Search Contacts', group: 'suggestions' },
  { icon: <User className="mr-2 h-4 w-4" />, label: 'Profile', group: 'settings' },
  { icon: <Gear className="mr-2 h-4 w-4" />, label: 'Settings', group: 'settings' },
  { icon: <ChatCircle className="mr-2 h-4 w-4" />, label: 'Send Message', group: 'suggestions' },
  { icon: <Bell className="mr-2 h-4 w-4" />, label: 'Notifications', group: 'settings' },
  { icon: <Star className="mr-2 h-4 w-4" />, label: 'Favourites', group: 'suggestions' },
]

export default function CommandDemo(props: CommandDemoProps) {
  const hasControls = props.placeholder !== undefined

  if (hasControls) {
    const placeholder = (props.placeholder as string) ?? 'Type a command or search...'
    const showGroups = props['show-groups'] ?? true
    const itemCount = (props['item-count'] as number) ?? 5

    const items = ALL_ITEMS.slice(0, itemCount)
    const suggestions = items.filter(i => i.group === 'suggestions')
    const settings = items.filter(i => i.group === 'settings')

    return (
      <div className="max-w-md">
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {showGroups ? (
              <>
                {suggestions.length > 0 && (
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((item) => (
                      <CommandItem key={item.label}>
                        {item.icon}
                        <span>{item.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {settings.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                      {settings.map((item) => (
                        <CommandItem key={item.label}>
                          {item.icon}
                          <span>{item.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </>
            ) : (
              <>
                {items.map((item) => (
                  <CommandItem key={item.label}>
                    {item.icon}
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarBlank className="mr-2 h-4 w-4" />
              <span>Schedule Campaign</span>
            </CommandItem>
            <CommandItem>
              <Envelope className="mr-2 h-4 w-4" />
              <span>Create Email</span>
            </CommandItem>
            <CommandItem>
              <MagnifyingGlass className="mr-2 h-4 w-4" />
              <span>Search Contacts</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem>
              <Gear className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
