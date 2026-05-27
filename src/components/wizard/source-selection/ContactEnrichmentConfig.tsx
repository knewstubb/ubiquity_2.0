import { LinkSimple } from '@phosphor-icons/react'

// Component

export function ContactEnrichmentConfig() {
  return (
    <div className="flex flex-col gap-2 pl-3 border-l-2 border-primary/20">
      <p className="text-xs text-muted-foreground bg-muted/50 border border-border rounded px-2 py-1.5 m-0 flex items-center gap-1.5 max-w-[320px]">
        <LinkSimple size={14} weight="bold" className="text-primary shrink-0" />
        <span>Auto-joined via Contact ID — no additional configuration needed.</span>
      </p>
    </div>
  )
}
