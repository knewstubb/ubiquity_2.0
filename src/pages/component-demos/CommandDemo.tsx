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

export default function CommandDemo() {
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
