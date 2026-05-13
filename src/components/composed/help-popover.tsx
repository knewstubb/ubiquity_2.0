import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';

interface HelpPopoverProps {
  title: string;
  body: string;
}

export function HelpPopover({ title, body }: HelpPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-grid place-content-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0 cursor-pointer border-none p-0 leading-none hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Help: ${title}`}
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" sideOffset={8} className="w-80 z-[200]">
        <p className="text-sm font-semibold text-foreground m-0 mb-1">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed m-0">{body}</p>
      </PopoverContent>
    </Popover>
  );
}
