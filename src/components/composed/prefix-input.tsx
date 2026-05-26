/**
 * @component PrefixInput
 * @description Input with a non-editable prefix segment. Used for paths, URLs, or any value with a fixed base.
 *
 * @designDecisions
 * - Fixed h-9 height matches the standard Input height so they align in forms
 * - Prefix uses bg-secondary to visually separate the fixed portion from the editable area
 * - Inner Input has border-0 and rounded-none so the outer container owns the border and radius
 * - 8px radius on outer container per docs/ui/borders-radius.md
 *
 * @usage
 * - Use when a value always starts with a known prefix (e.g. URL base path, file path root)
 * - Prefer over a disabled input + label when the prefix is structural, not user-entered
 */
import * as React from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

interface PrefixInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  prefix: string;
}

const PrefixInput = React.forwardRef<HTMLInputElement, PrefixInputProps>(
  ({ prefix, className, ...props }, ref) => {
    return (
      <div className="flex h-9 border border-input rounded-md overflow-hidden focus-within:border-ring focus-within:shadow-ring">
        <span className="flex items-center px-3 text-sm text-muted-foreground bg-secondary border-r border-border whitespace-nowrap select-none">
          {prefix}
        </span>
        <Input
          ref={ref}
          className={cn(
            'flex-1 h-auto rounded-none border-0 shadow-none focus-visible:shadow-none focus-visible:border-0',
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
