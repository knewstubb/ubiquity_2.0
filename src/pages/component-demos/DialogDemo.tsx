import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DialogDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create New Segment</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Segment</DialogTitle>
            <DialogDescription>
              Create a new audience segment. You can add filters after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Segment Name</Label>
              <Input id="name" placeholder="e.g. Gold Members" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
