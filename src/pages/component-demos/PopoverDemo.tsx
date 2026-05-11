import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Warning, Info, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PopoverDemoProps {
  title?: string
  body?: string
  'show-done-button'?: boolean
  'done-label'?: string
  width?: string
  align?: 'start' | 'center' | 'end'
  'show-table'?: boolean
  'show-details'?: boolean
  'details-variant'?: 'default' | 'destructive' | 'info' | 'caution'
}

const detailsStyles = {
  default: 'bg-emerald-50 p-3 rounded-md text-emerald-800',
  destructive: 'bg-red-50 p-3 rounded-md text-red-800',
  info: 'bg-sky-50 p-3 rounded-md text-sky-800',
  caution: 'bg-amber-50 p-3 rounded-md text-amber-800',
}

const detailsIcons = {
  default: null,
  destructive: <WarningCircle weight="fill" className="size-4 shrink-0 mt-0.5 text-destructive" />,
  info: <Info weight="fill" className="size-4 shrink-0 mt-0.5 text-sky-500" />,
  caution: <Warning weight="fill" className="size-4 shrink-0 mt-0.5 text-amber-500" />,
}

const detailsText = {
  default: 'Make sure the lookup column in your file contains values that exist in the contact database.',
  destructive: 'If a transaction row can\'t be matched to a contact, it won\'t be imported. Make sure the lookup column in your file contains values that exist in the contact database.',
  info: 'You can add more if a single field isn\'t enough to uniquely identify a contact (e.g. first name + last name + email).',
  caution: 'If a transaction row can\'t be matched to a contact, it won\'t be imported. Make sure the lookup column in your file contains values that exist in the contact database.',
}

export default function PopoverDemo(props: PopoverDemoProps) {
  const [open, setOpen] = useState(true)

  const title = props.title ?? 'How does UbiQuity link transactions to contacts?'
  const body = props.body ?? 'Every transactional record needs to be linked to a contact in UbiQuity. Lookup Mapping tells the system which column in your file identifies the contact that each transaction belongs to.'
  const showDone = props['show-done-button'] ?? true
  const doneLabel = props['done-label'] ?? 'Done'
  const width = props.width ?? '400px'
  const align = (props.align ?? 'center') as 'start' | 'center' | 'end'
  const showTable = props['show-table'] ?? false
  const showDetails = props['show-details'] ?? true
  const detailsVariant = (props['details-variant'] ?? 'default') as 'default' | 'destructive' | 'info' | 'caution'

  const widthClass = width === '280px' ? 'w-[280px]' : width === '400px' ? 'w-[400px]' : 'w-[320px]'

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">Learn More</Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(widthClass)}
          align={align}
          sideOffset={8}
        >
          <div className="grid gap-3">
            {/* Header */}
            <h4 className="text-lg font-bold leading-tight">{title}</h4>

            {/* Body */}
            <p className="text-sm text-muted-foreground m-0">{body}</p>

            {/* Sample table */}
            {showTable && (
              <div className="border border-border rounded-md overflow-hidden text-sm">
                <div className="grid grid-cols-2 bg-muted px-3 py-1.5 font-medium text-muted-foreground border-b border-border">
                  <span>Email</span>
                  <span>First Name</span>
                </div>
                <div className="grid grid-cols-2 px-3 py-1.5 border-b border-border">
                  <span className="text-muted-foreground">jane@example.com</span>
                  <span>Jane</span>
                </div>
                <div className="grid grid-cols-2 px-3 py-1.5 border-b border-border">
                  <span className="text-muted-foreground">tom@acme.co</span>
                  <span>Tom</span>
                </div>
                <div className="grid grid-cols-2 px-3 py-1.5">
                  <span className="text-muted-foreground">sam@corp.io</span>
                  <span>Sam</span>
                </div>
              </div>
            )}

            {/* Additional details — coloured section */}
            {showDetails && (
              <div className={cn('text-sm', detailsStyles[detailsVariant])}>
                {detailsIcons[detailsVariant] ? (
                  <div className="flex items-start gap-2">
                    {detailsIcons[detailsVariant]}
                    <span>{detailsText[detailsVariant]}</span>
                  </div>
                ) : (
                  <span>{detailsText[detailsVariant]}</span>
                )}
              </div>
            )}

            {/* Done button — ghost, right-aligned */}
            {showDone && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-sm" onClick={() => setOpen(false)}>
                  {doneLabel}
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {!open && (
        <p className="text-xs text-muted-foreground">Click the button to reopen the popover</p>
      )}
    </div>
  )
}
