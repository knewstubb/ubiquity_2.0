import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { CalendarBlank, Envelope, Gear, User, MagnifyingGlass } from '@phosphor-icons/react'

interface CommandDemoProps {
  placeholder?: string
  'show-groups'?: boolean
}

export default function CommandDemo(props: CommandDemoProps) {
  const hasControls = props.placeholder !== undefined

  if (hasControls) {
    const placeholder = (props.placeholder as string) ?? 'Type a command or search...'
    const showGroups = props['show-groups'] ?? true

    return (
      <div className="max-w-md">
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {showGroups ? (
              <>
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
              </>
            ) : (
              <>
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
                <CommandItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </CommandItem>
                <CommandItem>
                  <Gear className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </CommandItem>
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
