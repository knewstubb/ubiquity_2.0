import { Progress } from '@/components/ui/progress'

interface ProgressDemoProps {
  value?: number
  showLabel?: boolean
}

export default function ProgressDemo({ value, showLabel }: ProgressDemoProps) {
  const hasControls = value !== undefined

  if (hasControls) {
    return (
      <div className="max-w-md space-y-2">
        {showLabel && (
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="text-muted-foreground">{value}%</span>
          </div>
        )}
        <Progress value={value} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Import progress</span>
          <span className="text-muted-foreground">66%</span>
        </div>
        <Progress value={66} />
      </div>

      <div className="space-y-2">
        <span className="text-sm">25%</span>
        <Progress value={25} />
      </div>

      <div className="space-y-2">
        <span className="text-sm">50%</span>
        <Progress value={50} />
      </div>

      <div className="space-y-2">
        <span className="text-sm">75%</span>
        <Progress value={75} />
      </div>

      <div className="space-y-2">
        <span className="text-sm">100% — Complete</span>
        <Progress value={100} />
      </div>
    </div>
  )
}
