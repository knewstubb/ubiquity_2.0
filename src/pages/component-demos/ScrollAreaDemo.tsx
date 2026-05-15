import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface ScrollAreaDemoProps {
  height?: number
  orientation?: string
  'item-count'?: number
}

const ALL_CONTACTS = [
  'Sarah Chen', 'James Wilson', 'Maria Lopez', 'David Kim',
  'Emma Thompson', 'Michael Brown', 'Lisa Anderson', 'Robert Taylor',
  'Jennifer Martinez', 'William Davis', 'Amanda White', 'Christopher Lee',
  'Jessica Harris', 'Daniel Clark', 'Ashley Robinson', 'Matthew Lewis',
  'Stephanie Walker', 'Andrew Hall', 'Nicole Allen', 'Joshua Young',
  'Lauren King', 'Ryan Wright', 'Megan Scott', 'Brandon Green',
  'Samantha Adams', 'Tyler Baker', 'Kayla Nelson', 'Justin Hill',
  'Rachel Campbell', 'Kevin Mitchell', 'Amber Roberts', 'Sean Carter',
  'Brittany Phillips', 'Patrick Evans', 'Courtney Turner', 'Derek Torres',
  'Heather Parker', 'Aaron Collins', 'Tiffany Edwards', 'Nathan Stewart',
  'Christina Flores', 'Jeremy Morris', 'Michelle Nguyen', 'Gregory Murphy',
  'Kimberly Rivera', 'Eric Cook', 'Angela Rogers', 'Brian Morgan',
  'Melissa Peterson', 'Scott Cooper',
]

export default function ScrollAreaDemo(props: ScrollAreaDemoProps) {
  const hasControls = props.height !== undefined

  if (hasControls) {
    const height = (props.height as number) ?? 200
    const orientation = (props.orientation as string) ?? 'vertical'
    const itemCount = (props['item-count'] as number) ?? 20
    const contacts = ALL_CONTACTS.slice(0, itemCount)

    if (orientation === 'horizontal') {
      return (
        <ScrollArea className="w-96 whitespace-nowrap rounded-md border" style={{ height: `${height}px` }}>
          <div className="flex w-max space-x-4 p-4">
            {contacts.map((contact) => (
              <div key={contact} className="shrink-0 rounded-md border px-4 py-3 text-sm">
                {contact}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )
    }

    if (orientation === 'both') {
      return (
        <ScrollArea className="w-64 rounded-md border" style={{ height: `${height}px` }}>
          <div className="w-[500px] p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Contacts</h4>
            {contacts.map((contact) => (
              <div key={contact}>
                <div className="text-sm py-2 whitespace-nowrap">{contact} — email@example.com — Company Inc.</div>
                <Separator />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )
    }

    // vertical (default)
    return (
      <ScrollArea className="w-48 rounded-md border" style={{ height: `${height}px` }}>
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Contacts</h4>
          {contacts.map((contact) => (
            <div key={contact}>
              <div className="text-sm py-2">{contact}</div>
              <Separator />
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  const contacts = ALL_CONTACTS.slice(0, 15)

  return (
    <div className="flex flex-col gap-6">
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Contacts</h4>
          {contacts.map((contact) => (
            <div key={contact}>
              <div className="text-sm py-2">{contact}</div>
              <Separator />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
