import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';

interface HelpPopoverProps {
  title: string;
  body: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function HelpPopover({ title, body, side = 'bottom', align = 'start' }: HelpPopoverProps) {
  return (
    <Popover>
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
      <PopoverContent align={align} side={side} sideOffset={8} className="w-80 z-[200]">
        <p className="text-sm font-semibold text-foreground m-0 mb-1">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed m-0">{body}</p>
      </PopoverContent>
    </Popover>
  );
}
