import { cn } from '@/lib/utils';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

interface DayPickerProps {
  /** Array of 7 booleans representing Mon–Sun selection state */
  value: boolean[];
  onChange: (value: boolean[]) => void;
  className?: string;
}

export function DayPicker({ value, onChange, className }: DayPickerProps) {
  function toggleDay(index: number) {
    const next = [...value];
    next[index] = !next[index];
    onChange(next);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {DAY_LABELS.map((label, i) => (
        <button
          key={i}
          type="button"
          className={cn(
            'w-9 h-9 rounded-full border border-primary text-sm font-semibold cursor-pointer inline-grid place-content-center p-0 transition-colors duration-150 leading-none',
            value[i]
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-primary hover:bg-accent',
          )}
          onClick={() => toggleDay(i)}
          aria-label={`${DAY_NAMES[i]}${value[i] ? ' selected' : ''}`}
          aria-pressed={value[i]}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
