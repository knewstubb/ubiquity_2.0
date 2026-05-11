import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export default function ProgressDemo() {
  const [progress, setProgress] = useState(25)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Import progress</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} />
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

      <Button variant="outline" size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
        Increase Progress
      </Button>
    </div>
  )
}
