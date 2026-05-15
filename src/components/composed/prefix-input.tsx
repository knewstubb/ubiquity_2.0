import * as React from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

interface PrefixInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  prefix: string;
}

const PrefixInput = React.forwardRef<HTMLInputElement, PrefixInputProps>(
  ({ prefix, className, ...props }, ref) => {
    return (
      <div className="flex border border-input rounded-md overflow-hidden focus-within:border-ring focus-within:shadow-[--ring-shadow]">
        <span className="flex items-center py-2 px-3 text-sm text-muted-foreground bg-secondary border-r border-border whitespace-nowrap select-none">
          {prefix}
        </span>
        <Input
          ref={ref}
          className={cn(
            'flex-1 rounded-none border-0 shadow-none focus-visible:shadow-none focus-visible:border-0',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
PrefixInput.displayName = 'PrefixInput';

export { PrefixInput };
