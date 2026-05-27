import { SpinnerGap, DotsThree } from '@phosphor-icons/react'
import { formatMatchCount } from '../../../utils/source-config-utils'
import { Button } from '../../ui/button'

interface MatchCountIndicatorProps {
  count: number | null
  loading: boolean
  error: boolean
  onRetry: () => void
  entityLabel: string
  /** When true, shows a "waiting for input" state instead of hiding */
  pending?: boolean
}

export function MatchCountIndicator({
  count,
  loading,
  error,
  onRetry,
  entityLabel,
  pending = false,
}: MatchCountIndicatorProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2.5">
        <SpinnerGap className="size-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Calculating...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
        <span className="text-sm text-destructive">Unable to calculate match count</span>
        <Button variant="secondaryOutline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    )
  }

  if (count === null) {
    if (pending) {
      return (
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2.5">
          <DotsThree className="size-4 text-muted-foreground" weight="bold" />
          <span className="text-sm text-muted-foreground">Complete filter to see match count</span>
        </div>
      )
    }
    return null
  }

  if (count === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">0 records match</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md border-l-3 border-l-primary border border-primary/20 bg-primary/5 px-4 py-2.5">
      <span className="text-sm">
        <span className="font-bold text-primary">{formatMatchCount(count)}</span>{' '}
        <span className="font-medium text-foreground">{entityLabel} match</span>
      </span>
    </div>
  )
}
