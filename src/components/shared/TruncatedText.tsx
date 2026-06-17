import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TruncatedTextProps {
  children: string;
  className?: string;
  as?: 'span' | 'p' | 'div';
}

export function TruncatedText({
  children,
  className,
  as: Element = 'span',
}: TruncatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const handleMouseEnter = useCallback(() => {
    const el = ref.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, []);

  const textElement = (
    <Element
      ref={ref as React.RefObject<HTMLElement>}
      className={cn('truncate', className)}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Element>
  );

  if (!isTruncated) {
    return textElement;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{textElement}</TooltipTrigger>
        <TooltipContent side="top">{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
