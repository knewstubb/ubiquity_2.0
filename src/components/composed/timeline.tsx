/**
 * @component Timeline
 * @description Vertical timeline with connected entries. Each entry has a coloured
 * icon circle, a connector line to the next entry, and content (text + date).
 *
 * @designDecisions
 * - Icon circle uses inline style for background colour so callers can pass any
 *   semantic colour without needing a Tailwind class per status.
 * - Optional iconBorder uses inline 1.5px solid border for entries that need
 *   chromatic distinction without a filled background (e.g. outline-style icons).
 * - Connector line is border-coloured and only rendered between entries (not after last).
 * - Content area uses pb-5 to create consistent vertical rhythm between entries.
 * - 36px (w-9 h-9) icon circle aligns with standard avatar sizing.
 *
 * @usage
 * - Change history / audit logs
 * - Activity feeds with chronological events
 * - Lifecycle event displays (created → edited → paused → etc.)
 * - Not for step-by-step progress — use Stepper for that
 */
import { cn } from '@/lib/utils'

export interface TimelineEntry {
  id: string
  icon: React.ReactNode
  /** Background colour for the icon circle */
  iconBg: string
  /** Border colour for the icon circle (optional) */
  iconBorder?: string
  content: React.ReactNode
  date: string
}

interface TimelineProps {
  entries: TimelineEntry[]
  className?: string
}

export function Timeline({ entries, className }: TimelineProps) {
  if (entries.length === 0) return null

  return (
    <div className={cn('flex flex-col', className)}>
      {entries.map((entry, idx) => (
        <div key={entry.id} className="flex gap-3">
          {/* Left column: icon circle + connector */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 shadow-sm"
              style={{
                backgroundColor: entry.iconBg,
                border: entry.iconBorder ? `1.5px solid ${entry.iconBorder}` : undefined,
              }}
            >
              {entry.icon}
            </div>
            {idx < entries.length - 1 && (
              <div className="w-0.5 flex-1 min-h-6 bg-border my-1" />
            )}
          </div>

          {/* Right column: content + date */}
          <div className="flex-1 min-w-0 pb-5 pt-1">
            <div className="text-base leading-snug text-foreground">
              {entry.content}
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              {entry.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
