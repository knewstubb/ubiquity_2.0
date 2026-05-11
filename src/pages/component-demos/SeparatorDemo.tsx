import { Separator } from '@/components/ui/separator'

export default function SeparatorDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">Campaign Settings</h4>
          <p className="text-sm text-muted-foreground">
            Configure your campaign delivery options.
          </p>
        </div>
        <Separator className="my-4" />
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>Schedule</div>
          <Separator orientation="vertical" />
          <div>Recipients</div>
          <Separator orientation="vertical" />
          <div>Content</div>
          <Separator orientation="vertical" />
          <div>Review</div>
        </div>
      </div>
    </div>
  )
}
