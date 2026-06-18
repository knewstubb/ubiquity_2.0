import { useState, type ReactNode } from 'react';
import { Warning, Info, WarningCircle } from '@phosphor-icons/react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

type DetailsVariant = 'default' | 'destructive' | 'info' | 'caution';

const detailsStyles: Record<DetailsVariant, string> = {
  default: 'bg-emerald-50 p-3 rounded-md text-emerald-800',
  destructive: 'bg-red-50 p-3 rounded-md text-red-800',
  info: 'bg-sky-50 p-3 rounded-md text-sky-800',
  caution: 'bg-amber-50 p-3 rounded-md text-amber-800',
};

const detailsIcons: Record<DetailsVariant, ReactNode> = {
  default: null,
  destructive: <WarningCircle weight="fill" className="size-4 shrink-0 mt-0.5 text-destructive" />,
  info: <Info weight="fill" className="size-4 shrink-0 mt-0.5 text-sky-500" />,
  caution: <Warning weight="fill" className="size-4 shrink-0 mt-0.5 text-amber-500" />,
};

interface HelpPopoverProps {
  title: string;
  body: string | ReactNode;
  /** Optional details callout shown below the body */
  details?: string | ReactNode;
  /** Style variant for the details callout */
  detailsVariant?: DetailsVariant;
  /** Show a Done button to dismiss */
  showDone?: boolean;
  /** Label for the Done button */
  doneLabel?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  /** Width: 'default' (320px), 'narrow' (280px), or 'wide' (400px) */
  width?: 'narrow' | 'default' | 'wide';
}

const widthClasses = {
  narrow: 'w-[280px]',
  default: 'w-[320px]',
  wide: 'w-[400px]',
};

export function HelpPopover({
  title,
  body,
  details,
  detailsVariant = 'default',
  showDone = false,
  doneLabel = 'Done',
  side = 'bottom',
  align = 'start',
  width = 'default',
}: HelpPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span className="inline-flex p-1">
          <button
            type="button"
            className="inline-grid place-content-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 cursor-pointer border-none p-0 leading-none hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Help: ${title}`}
          >
            ?
          </button>
        </span>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={8}
        className={cn(widthClasses[width], 'z-[200]')}
      >
        <div className="grid gap-3">
          <h4 className="text-lg font-bold leading-tight m-0">{title}</h4>

          {typeof body === 'string' ? (
            <p className="text-sm text-muted-foreground m-0">{body}</p>
          ) : (
            <div className="text-sm text-muted-foreground">{body}</div>
          )}

          {details && (
            <div className={cn('text-sm', detailsStyles[detailsVariant])}>
              {detailsIcons[detailsVariant] ? (
                <div className="flex items-start gap-2">
                  {detailsIcons[detailsVariant]}
                  {typeof details === 'string' ? <span>{details}</span> : details}
                </div>
              ) : (
                typeof details === 'string' ? <span>{details}</span> : details
              )}
            </div>
          )}

          {showDone && (
            <div className="flex justify-end">
              <Button variant="secondaryGhost" size="sm" className="h-7 text-sm" onClick={() => setOpen(false)}>
                {doneLabel}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
