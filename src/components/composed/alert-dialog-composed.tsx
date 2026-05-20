/**
 * @component AlertDialogComposed
 * @description Unified confirmation dialog with intent-based styling, async loading states,
 * and tiered confirmation guards. Wraps Radix AlertDialog primitives with custom Button
 * components (not AlertDialogAction/Cancel) for full control over disabled and loading behaviour.
 *
 * @designDecisions
 * - Uses standard Button components instead of Radix AlertDialogAction/AlertDialogCancel
 *   so we can disable buttons and prevent dismissal during async loading
 * - Top border accent is rendered as a separate div (h-1.5 / 6px, not a CSS border-top) so it clips
 *   cleanly to the container's rounded corners without overflow issues
 * - Neutral intent uses full border (border-border), warning/destructive use border-x + border-b
 *   since the coloured strip replaces the top border visually
 * - Cancel button uses ghost variant to reduce visual weight — the confirm button should
 *   always be the dominant action
 * - Destructive dialogs swap button order (confirm left, cancel right) to prevent muscle-memory
 *   clicks on the primary action position
 * - Three destructive severity levels: minor (no guard), major (checkbox), catastrophic (type input)
 * - requiresInput is intent-agnostic — allows type-to-confirm on neutral/warning dialogs too
 *   (e.g. confirming a risky but non-destructive action like resetting a config)
 * - requiresCheckbox remains destructive-only to preserve the severity hierarchy
 * - Loading state blocks all dismissal paths (Escape, overlay click, X button, Cancel) to
 *   prevent orphaned async operations
 * - Type-to-confirm input focus ring colour matches the dialog intent (amber for warning,
 *   red for destructive, default for neutral) — reinforces severity context during interaction
 * - Input/checkbox resets on close via useEffect on `open` — ensures stale state never persists
 * - All copy follows Yifrah's microcopy framework: clear, action-oriented, no jargon,
 *   tell users what happens next (not what they did)
 *
 * @usage
 * - Use for any action requiring explicit user confirmation before proceeding
 * - Use neutral for routine confirmations (discard changes, close without saving)
 * - Use warning for actions with side effects (editing a connection affects linked automations)
 * - Use destructive for irreversible actions (delete, remove permanently)
 * - Include the object name in the title when the action relates to a specific entity
 * - Titles that ask the user to perform an action MUST end with a question mark
 * - Never use "are you sure" in body copy — state what will happen, not what the user is about to do
 * - Add `requiresCheckbox` for major destructive actions (significant but recoverable impact)
 * - Add `requiresInput` for any action requiring explicit typed confirmation (works with all intents)
 * - Set `showCancel={false}` for informational alerts with only a dismiss action
 *
 * @variants
 * - neutral: No top accent, default (teal) confirm button — routine confirmations
 * - warning: Amber top accent + Warning icon in title, secondary (solid dark) confirm button — cautionary
 * - destructive: Red top accent, red confirm button, swapped button order — irreversible actions
 *
 * @destructiveLevels
 * - minor: No confirmation guard — low-impact destructive action (e.g. remove a tag)
 * - major: "I understand" checkbox — significant impact (e.g. delete a campaign)
 * - catastrophic: Type-to-confirm input — irreversible, high-stakes (e.g. delete account)
 *
 * @confirmationGuards
 * - requiresCheckbox: Only applies to destructive intent (ignored otherwise)
 * - requiresInput: Applies to ALL intents — renders type-to-confirm for any action needing explicit confirmation
 * - inputLabel: Custom instruction text for the type-to-confirm input — overrides the default "Type {x} to confirm"
 * - icon: Custom ReactNode icon rendered inline with the title — overrides the default Warning icon for warning intent
 *
 * @customisation
 * - icon: Custom ReactNode rendered inline with the title — overrides the default Warning icon for warning intent.
 *   For neutral/destructive intents (which have no default icon), this adds an icon where none existed.
 *
 * @examples
 * - Discard changes: intent="neutral", title="Discard changes?", confirmLabel="Discard", cancelLabel="Keep editing"
 * - Edit connection: intent="warning", title="Edit 'Mailchimp'?", confirmLabel="Edit connection"
 * - Delete campaign: intent="destructive", title="Delete 'Summer Sale'?", requiresCheckbox=true
 * - Delete account: intent="destructive", title="Delete 'Acme Corp'?", requiresInput="DELETE"
 * - Custom input label: requiresInput="RESET", inputLabel="Type RESET to confirm factory reset"
 * - Custom icon: intent="warning", icon={<CurrencyDollar size={20} weight="fill" className="text-warning shrink-0" />}
 * - Reset config: intent="warning", title="Reset configuration?", requiresInput="RESET"
 * - Custom icon: intent="neutral", icon={<Trash size={20} />}, title="Clear history?"
 * - Async delete: onConfirm returns Promise, loadingLabel="Deleting..."
 * - Info-only: intent="neutral", showCancel={false}, confirmLabel="OK"
 */
import { type ReactNode, useState, useEffect } from 'react'
import { Warning } from '@phosphor-icons/react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CloseButton } from '@/components/ui/close-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AlertDialogComposedProps {
  /** Controlled open state */
  open: boolean
  /** Callback when open state changes (close via X, Cancel, overlay click) */
  onOpenChange: (open: boolean) => void
  /** Visual intent variant */
  intent: 'neutral' | 'warning' | 'destructive'
  /** Dialog title — include object name when action relates to a specific entity */
  title: string
  /** Body content */
  children: ReactNode
  /** Primary action button label — action-oriented, tells user what happens next */
  confirmLabel: string
  /** Cancel button label — defaults to "Cancel" */
  cancelLabel?: string
  /** Primary action callback — if returns Promise, shows loading state */
  onConfirm: () => void | Promise<void>
  /** Optional cancel callback (in addition to closing) */
  onCancel?: () => void
  /** Major destructive: requires "I understand" checkbox before confirm enables */
  requiresCheckbox?: boolean
  /** Catastrophic destructive: type-to-confirm guard string — e.g. "DELETE" */
  requiresInput?: string
  /** Custom label for the type-to-confirm input — overrides default "Type {x} to confirm" */
  inputLabel?: string
  /** Custom icon to render inline with the title — overrides the default Warning icon for warning intent */
  icon?: ReactNode
  /** Label shown on confirm button during async loading — e.g. "Deleting..." */
  loadingLabel?: string
  /** Whether to show the cancel button — defaults to true */
  showCancel?: boolean
}

// ─── Intent styling map ──────────────────────────────────────────────────────

const intentStyles = {
  neutral: {
    confirmVariant: 'default' as const,
  },
  warning: {
    confirmVariant: 'secondary' as const,
  },
  destructive: {
    confirmVariant: 'destructive' as const,
  },
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-4 w-4', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AlertDialogComposed({
  open,
  onOpenChange,
  intent,
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  requiresCheckbox,
  requiresInput,
  inputLabel,
  icon,
  loadingLabel,
  showCancel = true,
}: AlertDialogComposedProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [checkboxChecked, setCheckboxChecked] = useState(false)

  // Reset guards when dialog closes
  useEffect(() => {
    if (!open) {
      setInputValue('')
      setCheckboxChecked(false)
    }
  }, [open])

  // Derived state
  const showInput = !!requiresInput
  const showCheckbox = !!requiresCheckbox && intent === 'destructive' && !showInput
  const inputValid = !showInput || inputValue === requiresInput
  const checkboxValid = !showCheckbox || checkboxChecked
  const confirmDisabled = isLoading || !inputValid || !checkboxValid
  const cancelDisabled = isLoading

  // Handlers
  async function handleConfirm() {
    if (confirmDisabled) return
    const result = onConfirm()
    if (result instanceof Promise) {
      setIsLoading(true)
      try {
        await result
      } finally {
        setIsLoading(false)
      }
    }
  }

  function handleCancel() {
    onCancel?.()
    onOpenChange(false)
  }

  function handleOpenChange(value: boolean) {
    if (isLoading) return
    onOpenChange(value)
  }

  // Button rendering — destructive swaps order (confirm left, cancel right)
  const confirmButton = (
    <Button
      variant={intentStyles[intent].confirmVariant}
      onClick={handleConfirm}
      disabled={confirmDisabled}
    >
      {isLoading && <Spinner />}
      {isLoading ? (loadingLabel ?? confirmLabel) : confirmLabel}
    </Button>
  )

  const cancelButton = showCancel ? (
    <Button
      variant="ghost"
      onClick={handleCancel}
      disabled={cancelDisabled}
    >
      {cancelLabel ?? 'Cancel'}
    </Button>
  ) : null

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-[200] grid w-full max-w-[460px] translate-x-[-50%] translate-y-[-50%] bg-card shadow-lg duration-200 rounded-lg p-0 gap-0 overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            intent === 'neutral'
              ? 'border border-border'
              : 'border-x border-b border-border'
          )}
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (isLoading) e.preventDefault()
          }}
        >
          {/* Top border strip — full width, clips to container edge */}
          {intent !== 'neutral' && (
            <div
              className={cn(
                'h-1.5 w-full',
                intent === 'warning' && 'bg-warning',
                intent === 'destructive' && 'bg-destructive'
              )}
            />
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6">
            <AlertDialogPrimitive.Title className="flex items-center gap-2 text-lg font-semibold">
              {icon
                ? icon
                : intent === 'warning' && (
                    <Warning size={20} weight="fill" className="text-warning shrink-0" />
                  )}
              {title}
            </AlertDialogPrimitive.Title>
            <CloseButton
              size="default"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="opacity-70 hover:opacity-100"
            />
          </div>

          {/* Body */}
          <AlertDialogPrimitive.Description asChild>
            <div className="px-6 py-4 text-base text-muted-foreground">
              {children}

              {/* Major destructive: checkbox confirmation */}
              {showCheckbox && (
                <div className="mt-4 flex items-start gap-2">
                  <Checkbox
                    id="confirm-checkbox"
                    checked={checkboxChecked}
                    onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="confirm-checkbox" className="text-sm text-foreground cursor-pointer leading-tight">
                    I understand this action cannot be undone
                  </Label>
                </div>
              )}

              {/* Catastrophic destructive: type-to-confirm */}
              {showInput && (
                <div className="mt-4 space-y-1.5">
                  <Label>
                    {inputLabel ?? <>Type <span className="font-semibold">{requiresInput}</span> to confirm</>}
                  </Label>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    autoComplete="off"
                    className={cn(
                      intent === 'warning' && 'focus-visible:border-warning focus-visible:shadow-ring-warning',
                      intent === 'destructive' && 'focus-visible:border-destructive focus-visible:shadow-ring-destructive'
                    )}
                  />
                </div>
              )}
            </div>
          </AlertDialogPrimitive.Description>

          {/* Footer — destructive swaps button order (confirm left, cancel right) */}
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            {intent === 'destructive' ? (
              <>
                {confirmButton}
                {cancelButton}
              </>
            ) : (
              <>
                {cancelButton}
                {confirmButton}
              </>
            )}
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
