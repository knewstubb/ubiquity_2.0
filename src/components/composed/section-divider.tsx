/**
 * @component SectionDivider
 * @description A section heading used to separate logical groups in modals and forms.
 * Supports two variants: a labelled line (centred text between horizontal rules)
 * and a plain heading (left-aligned uppercase text with bottom border).
 *
 * @designDecisions
 * - Labelled line variant uses 10px uppercase text (text-xs) per docs/ui/typography.md Body XXS
 * - Plain heading variant uses the same text style but left-aligned with a full-width border below
 * - Spacing: reduces gap below via negative margin so the heading sits closer to its fields
 * - Lines use border colour token for consistency with other dividers
 *
 * @usage
 * - Use "line" variant (default) in single-step dialogs where sections are visually equal
 * - Use "heading" variant in longer forms where sections need stronger left-aligned hierarchy
 * - Do NOT use inside wizard steps (those use the three-tier form rhythm pattern instead)
 *
 * @variants
 * - line: centred text between two horizontal lines (default)
 * - heading: left-aligned uppercase text with full-width border below
 */

import { cn } from '@/lib/utils'

type SectionDividerVariant = 'line' | 'heading'

interface SectionDividerProps {
  /** The label text displayed as the section heading */
  label: string
  /** Visual variant: "line" (centred between rules) or "heading" (left-aligned with border) */
  variant?: SectionDividerVariant
  /** Additional className for the container */
  className?: string
}

export function SectionDivider({ label, variant = 'line', className }: SectionDividerProps) {
  if (variant === 'heading') {
    return (
      <div className={cn("border-b border-border pb-2 mb-[-16px]", className)}>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-3 mb-[-16px]", className)}>
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
