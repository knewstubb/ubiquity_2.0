import { useState } from 'react';
import { DayPicker } from '@/components/composed/day-picker';

export default function DayPickerDemo() {
  const [days, setDays] = useState<boolean[]>([false, true, true, false, true, false, false]);

  return (
    <div className="p-4">
      <DayPicker value={days} onChange={setDays} />
    </div>
  );
}
