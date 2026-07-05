import { lazy, Suspense } from 'react'

// Lazy-load the modal demo data (large source category config)
const ModalDemo = lazy(() => import('./CardFilterBuilderDemo'))

export default function FilterBuilderDemo(props: Record<string, unknown>) {
  const allowNesting = (props['allow-nesting'] as boolean) ?? true
  const maxDepth = (props['max-depth'] as number) ?? 3

  return (
    <div className="w-full p-6">
      <Suspense fallback={<div className="text-sm text-muted-foreground p-4">Loading...</div>}>
        <ModalDemo allow-nesting={allowNesting} max-depth={maxDepth} />
      </Suspense>
    </div>
  )
}
