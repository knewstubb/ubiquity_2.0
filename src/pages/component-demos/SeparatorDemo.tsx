import { Separator } from '@/components/ui/separator'

interface SeparatorDemoProps {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

export default function SeparatorDemo({ orientation, decorative }: SeparatorDemoProps) {
  const hasControls = orientation !== undefined

  if (hasControls) {
    return (
      <div className={orientation === 'vertical' ? 'flex h-20 items-center' : 'w-full max-w-sm'}>
        {orientation === 'vertical' ? (
          <div className="flex h-full items-center gap-4">
            <span className="text-sm">Left</span>
            <Separator orientation="vertical" decorative={decorative} />
            <span className="text-sm">Right</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">Content above</p>
            <Separator orientation="horizontal" decorative={decorative} />
            <p className="text-sm">Content below</p>
          </div>
        )}
      </div>
    )
  }

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
