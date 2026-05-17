import { useState, useEffect } from 'react';
import { DayPicker } from '@/components/composed/day-picker';
import { cn } from '@/lib/utils';

interface DayPickerDemoProps {
  preset?: string;
  disabled?: boolean;
}

const PRESETS: Record<string, boolean[]> = {
  weekdays: [true, true, true, true, true, false, false],
  weekend: [false, false, false, false, false, true, true],
  all: [true, true, true, true, true, true, true],
  none: [false, false, false, false, false, false, false],
};

export default function DayPickerDemo(props: DayPickerDemoProps) {
  const [days, setDays] = useState<boolean[]>([false, true, true, false, true, false, false]);
  const hasControls = props.preset !== undefined;

  const preset = (props.preset as string) ?? 'custom';
  const disabled = props.disabled ?? false;

  useEffect(() => {
    if (preset !== 'custom' && PRESETS[preset]) {
      setDays(PRESETS[preset]);
    }
  }, [preset]);

  if (!hasControls) {
    return (
      <div className="p-4">
        <DayPicker value={days} onChange={setDays} />
      </div>
    );
  }

  return (
    <div className={cn('p-4', disabled && 'opacity-50 pointer-events-none')}>
      <DayPicker value={days} onChange={setDays} />
    </div>
  );
}
