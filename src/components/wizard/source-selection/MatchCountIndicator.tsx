import { SpinnerGap } from '@phosphor-icons/react'
import { formatMatchCount } from '../../../utils/source-config-utils'
import { Button } from '../../ui/button'

interface MatchCountIndicatorProps {
  count: number | null
  loading: boolean
  error: boolean
  onRetry: () => void
  entityLabel: string
}

export function MatchCountIndicator({
  count,
  loading,
  error,
  onRetry,
  entityLabel,
}: MatchCountIndicatorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
        <SpinnerGap className="size-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Calculating...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
        <span className="text-sm text-destructive">Unable to calculate match count</span>
        <Button variant="secondaryOutline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    )
  }

  if (count === null) {
    return null
  }

  if (count === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
        <span className="text-sm text-muted-foreground">0 records match</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
      <span className="text-sm">
        <span className="font-semibold">{formatMatchCount(count)}</span>{' '}
        <span className="text-muted-foreground">{entityLabel} match</span>
      </span>
    </div>
  )
}
