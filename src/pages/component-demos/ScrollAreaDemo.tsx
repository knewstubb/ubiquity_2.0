import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const contacts = [
  'Sarah Chen', 'James Wilson', 'Maria Lopez', 'David Kim',
  'Emma Thompson', 'Michael Brown', 'Lisa Anderson', 'Robert Taylor',
  'Jennifer Martinez', 'William Davis', 'Amanda White', 'Christopher Lee',
  'Jessica Harris', 'Daniel Clark', 'Ashley Robinson',
]

export default function ScrollAreaDemo() {
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
