import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonDemoProps {
  variant?: 'line' | 'circle' | 'card'
  count?: number
}

export default function SkeletonDemo({ variant, count }: SkeletonDemoProps) {
  const hasControls = variant !== undefined

  if (hasControls) {
    const items = Array.from({ length: count ?? 3 })

    if (variant === 'circle') {
      return (
        <div className="flex flex-wrap gap-4">
          {items.map((_, i) => (
            <Skeleton key={i} className="h-12 w-12 rounded-full" />
          ))}
        </div>
      )
    }

    if (variant === 'card') {
      return (
        <div className="grid grid-cols-3 gap-4">
          {items.map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )
    }

    // line variant
    return (
      <div className="space-y-3 max-w-sm">
        {items.map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  )
}
