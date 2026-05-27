import { cn } from '../../lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { DayPicker } from '@/components/composed/day-picker';
import type { ExporterWizardDraft, ExporterScheduleConfig } from '../../models/wizard';

interface ScheduleStepProps {
  draft: ExporterWizardDraft;
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void;
}

type Frequency = ExporterScheduleConfig['frequency'];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function ScheduleStep({ draft, onUpdate }: ScheduleStepProps) {
  const schedule = draft.schedule;

  function updateSchedule(patch: Partial<ExporterScheduleConfig>) {
    onUpdate({ schedule: { ...schedule, ...patch } });
  }

  function handleFrequencyChange(value: string) {
    updateSchedule({ frequency: value as Frequency });
  }

  function toggleMonthlyDay(day: number) {
    const current = schedule.monthlyDays;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b);
    updateSchedule({ monthlyDays: next });
  }

  return (
    <div className="flex flex-col gap-6" data-testid="schedule-step">
      {/* Frequency selector */}
      <div>
        <p className="text-xs font-medium text-muted-foreground m-0 mb-2">Frequency</p>
        <SegmentedControl
          options={FREQUENCY_OPTIONS}
          value={schedule.frequency}
          onValueChange={handleFrequencyChange}
        />
      </div>

      {/* Weekly: day-of-week picker */}
      {schedule.frequency === 'weekly' && (
        <div>
          <p className="text-xs font-medium text-muted-foreground m-0 mb-2">On</p>
          <DayPicker
            value={schedule.weeklyDays}
            onChange={(days) => updateSchedule({ weeklyDays: days })}
          />
          {!schedule.weeklyDays.some(Boolean) && (
            <p className="text-xs text-destructive mt-2 m-0">
              Select at least one day
            </p>
          )}
        </div>
      )}

      {/* Monthly: day-of-month selector (1–28) */}
      {schedule.frequency === 'monthly' && (
        <div>
          <p className="text-xs font-medium text-muted-foreground m-0 mb-2">On days</p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                type="button"
                className={cn(
                  'w-9 h-9 rounded-md text-xs font-medium cursor-pointer inline-grid place-content-center p-0 transition-colors duration-150 leading-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  schedule.monthlyDays.includes(day)
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground hover:bg-secondary'
                )}
                onClick={() => toggleMonthlyDay(day)}
                aria-label={`Day ${day}${schedule.monthlyDays.includes(day) ? ' selected' : ''}`}
                aria-pressed={schedule.monthlyDays.includes(day)}
              >
                {day}
              </button>
            ))}
          </div>
          {schedule.monthlyDays.length === 0 && (
            <p className="text-xs text-destructive mt-2 m-0">
              Select at least one day
            </p>
          )}
        </div>
      )}

      {/* Info note — system assigns execution time */}
      <p className="text-xs text-tertiary-foreground m-0">
        Execution time is assigned automatically by the system to avoid scheduling conflicts.
      </p>
    </div>
  );
}
