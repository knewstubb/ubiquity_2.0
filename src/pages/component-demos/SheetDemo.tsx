import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SheetDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open Contact Details</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Contact</SheetTitle>
            <SheetDescription>
              Make changes to the contact profile. Click save when done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sheet-name">Name</Label>
              <Input id="sheet-name" defaultValue="Sarah Chen" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sheet-email">Email</Label>
              <Input id="sheet-email" defaultValue="sarah@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sheet-company">Company</Label>
              <Input id="sheet-company" defaultValue="Acme Corp" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
