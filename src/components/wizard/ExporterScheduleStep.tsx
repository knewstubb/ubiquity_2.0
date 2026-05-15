import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { WizardDraft } from '../../models/wizard';
import type { ScheduleFrequency } from '../../models/automation';

interface ExporterScheduleStepProps {
  draft: WizardDraft;
  onUpdate: (patch: Partial<WizardDraft>) => void;
}

type Frequency = 'hourly' | 'daily' | 'weekly' | 'monthly';

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const UNIT_MAP: Record<Frequency, string> = {
  hourly: 'hours',
  daily: 'Day/s',
  weekly: 'Week/s',
  monthly: 'Months/s',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_OF_WEEK_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const ORDINAL_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Last'];
const DAY_OF_WEEK_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export function ExporterScheduleStep({ draft, onUpdate }: ExporterScheduleStepProps) {
  const [frequency, setFrequency] = useState<Frequency>(
    (draft.schedule as Frequency) ?? 'hourly',
  );
  const [starting, setStarting] = useState('Friday, 09 May, 2025');
  const [every, setEvery] = useState('1');
  const [at, setAt] = useState('2:30 pm');

  /* Weekly day selection — default T(1), W(2), F(4) */
  const [days, setDays] = useState<boolean[]>([
    false, true, true, false, true, false, false,
  ]);

  /* Monthly pattern state */
  const [monthlyPattern, setMonthlyPattern] = useState<'day' | 'date'>('day');
  const [monthlyOrdinal, setMonthlyOrdinal] = useState('2nd');
  const [monthlyDayOfWeek, setMonthlyDayOfWeek] = useState('Wednesday');
  const [monthlyDates, setMonthlyDates] = useState<string[]>(['1st', '8th', '15th']);

  function handleFrequencyChange(f: Frequency) {
    setFrequency(f);
    onUpdate({ schedule: f as ScheduleFrequency });
  }

  function toggleDay(index: number) {
    setDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-8" data-testid="exporter-schedule-step">
      <h3 className="m-0 text-lg font-semibold text-primary">Schedule</h3>
      <p className="-mt-5 text-sm text-tertiary-foreground">Set when and how often this export runs.</p>

      <div className="flex flex-col gap-4 w-full">
        {/* Frequency */}
        <div className="flex border border-border rounded-md overflow-hidden w-full">
          {FREQUENCY_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "flex-1 py-2 px-4 text-[13px] font-medium text-tertiary-foreground bg-secondary border-none border-b-2 border-b-transparent cursor-pointer transition-all duration-150 whitespace-nowrap uppercase flex items-center justify-center",
                i < FREQUENCY_OPTIONS.length - 1 && "border-r border-r-border",
                frequency === opt.value && "text-primary font-semibold bg-background border-b-2 border-b-primary",
                frequency !== opt.value && "hover:text-muted-foreground"
              )}
              onClick={() => handleFrequencyChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Starting */}
        <div>
          <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Starting</p>
          <input
            className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 box-border focus:border-primary focus:shadow-[--ring-shadow] placeholder:text-tertiary-foreground"
            type="text"
            value={starting}
            onChange={(e) => setStarting(e.target.value)}
            aria-label="Starting date"
          />
        </div>

        {/* On (Weekly only) */}
        {frequency === 'weekly' && (
          <div>
            <p className="text-xs font-medium text-muted-foreground m-0 mb-1">On</p>
            <div className="flex items-center gap-2 mt-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "w-9 h-9 rounded-full border-2 border-primary bg-background text-primary text-sm font-semibold cursor-pointer inline-flex items-center justify-center p-0 transition-colors duration-150 leading-none",
                    !days[i] && "hover:bg-accent",
                    days[i] && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => toggleDay(i)}
                  aria-label={`${DAY_OF_WEEK_NAMES[i]}${days[i] ? ' selected' : ''}`}
                  aria-pressed={days[i]}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pattern + On the (Monthly only) */}
        {frequency === 'monthly' && (
          <>
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Pattern</p>
              <div className="flex border border-border rounded-md overflow-hidden w-fit">
                <button
                  type="button"
                  className={cn(
                    "py-2 px-6 text-sm font-medium text-tertiary-foreground bg-secondary border-none cursor-pointer transition-all duration-150 whitespace-nowrap border-r border-r-border",
                    monthlyPattern === 'day' && "text-primary font-semibold bg-background",
                    monthlyPattern !== 'day' && "hover:text-muted-foreground"
                  )}
                  onClick={() => setMonthlyPattern('day')}
                >
                  Day
                </button>
                <button
                  type="button"
                  className={cn(
                    "py-2 px-6 text-sm font-medium text-tertiary-foreground bg-secondary border-none cursor-pointer transition-all duration-150 whitespace-nowrap",
                    monthlyPattern === 'date' && "text-primary font-semibold bg-background",
                    monthlyPattern !== 'date' && "hover:text-muted-foreground"
                  )}
                  onClick={() => setMonthlyPattern('date')}
                >
                  Date
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1">On the</p>
              {monthlyPattern === 'day' ? (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-no-repeat bg-[right_12px_center] pr-8 box-border focus:border-primary focus:shadow-[--ring-shadow]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }}
                    value={monthlyOrdinal}
                    onChange={(e) => setMonthlyOrdinal(e.target.value)}
                    aria-label="Ordinal"
                  >
                    {ORDINAL_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <select
                    className="flex-1 py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-no-repeat bg-[right_12px_center] pr-8 box-border focus:border-primary focus:shadow-[--ring-shadow]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }}
                    value={monthlyDayOfWeek}
                    onChange={(e) => setMonthlyDayOfWeek(e.target.value)}
                    aria-label="Day of week"
                  >
                    {DAY_OF_WEEK_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-10 relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[--ring-shadow]">
                  {monthlyDates.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1 border border-primary text-primary rounded-full py-1 px-2 text-xs font-medium leading-none whitespace-nowrap">
                      {d}
                      <button
                        type="button"
                        className="bg-transparent border-none text-primary cursor-pointer text-xs p-0 leading-none flex items-center hover:text-accent-foreground"
                        onClick={() => setMonthlyDates((prev) => prev.filter((x) => x !== d))}
                        aria-label={`Remove ${d}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <select
                    className="border-none outline-none bg-transparent text-xs text-tertiary-foreground cursor-pointer py-0.5 min-w-6 appearance-none bg-no-repeat bg-center w-6 ml-auto"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }}
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !monthlyDates.includes(e.target.value)) {
                        setMonthlyDates((prev) => [...prev, e.target.value]);
                      }
                      e.target.value = '';
                    }}
                    aria-label="Add date"
                  >
                    <option value="" disabled></option>
                    {Array.from({ length: 28 }, (_, i) => {
                      const n = i + 1;
                      const suffix = n === 1 || n === 21 ? 'st' : n === 2 || n === 22 ? 'nd' : n === 3 || n === 23 ? 'rd' : 'th';
                      return `${n}${suffix}`;
                    }).filter((d) => !monthlyDates.includes(d)).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </>
        )}

        {/* Every + At */}
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Every</p>
            <div className="flex items-stretch">
              <select
                className="flex-1 py-2 px-3 text-sm border border-border rounded-l-md rounded-r-none border-r-0 bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-no-repeat bg-[right_12px_center] pr-8 box-border focus:border-primary focus:shadow-[--ring-shadow]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }}
                value={every}
                onChange={(e) => setEvery(e.target.value)}
                aria-label="Every interval"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>
              <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-secondary border border-border border-l-0 rounded-r-md whitespace-nowrap box-border">{UNIT_MAP[frequency]}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-xs font-medium text-muted-foreground m-0 mb-1">At</p>
            <input
              className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 box-border focus:border-primary focus:shadow-[--ring-shadow] placeholder:text-tertiary-foreground"
              type="text"
              value={at}
              onChange={(e) => setAt(e.target.value)}
              aria-label="At time"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
