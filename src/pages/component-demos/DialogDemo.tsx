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

interface DialogDemoProps {
  title?: string
  description?: string
  'show-footer'?: boolean
  size?: string
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'sm:max-w-[360px]',
  default: 'sm:max-w-[425px]',
  lg: 'sm:max-w-[560px]',
}

export default function DialogDemo(props: DialogDemoProps) {
  const hasControls = props.title !== undefined

  if (hasControls) {
    const title = (props.title as string) ?? 'Edit Profile'
    const description = (props.description as string) ?? 'Make changes to your profile here.'
    const showFooter = props['show-footer'] ?? true
    const size = (props.size as string) ?? 'default'
    const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.default

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className={sizeClass}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ctrl-name">Name</Label>
              <Input id="ctrl-name" placeholder="Enter name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ctrl-email">Email</Label>
              <Input id="ctrl-email" placeholder="Enter email" />
            </div>
          </div>
          {showFooter && (
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    )
  }

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
