import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Chip } from '@/components/composed/chip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface FileNamingInputProps {
  value: string;
  onChange: (pattern: string) => void;
}

const TOKENS = [
  { token: '{connector_name}', label: 'Connector Name' },
  { token: '{date}', label: 'Date' },
  { token: '{timestamp}', label: 'Timestamp' },
];

export function FileNamingInput({ value, onChange }: FileNamingInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function insertToken(token: string) {
    const input = inputRef.current;
    if (!input) {
      onChange(value + token);
      return;
    }
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const newValue = value.slice(0, start) + token + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      const pos = start + token.length;
      input.setSelectionRange(pos, pos);
      input.focus();
    });
  }

  function isTokenUsed(token: string): boolean {
    return value.includes(token);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <input
          ref={inputRef}
          id="file-naming-input"
          className="flex-1 py-2 px-3 border border-input rounded-l text-sm text-foreground bg-background outline-none box-border placeholder:text-muted-foreground font-mono focus:border-ring focus:ring-2 focus:ring-ring/50 border-r-0"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="{connector_name}_{date}"
        />
        <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-secondary border border-input rounded-r font-mono">.csv</span>
      </div>
      <TooltipProvider delayDuration={300}>
        <div className="flex gap-2 flex-wrap">
          {TOKENS.map((t) => {
            const used = isTokenUsed(t.token);
            return (
              <Tooltip key={t.token}>
                <TooltipTrigger asChild>
                  <div>
                    <Chip
                      label={t.token}
                      variant="insertable"
                      used={used}
                      size="sm"
                      onClick={() => insertToken(t.token)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {used ? `${t.label} already in pattern` : 'Click to insert into filename pattern'}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
