import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { ChipInput } from '@/components/composed/chip-input';
import { HelpPopover } from '@/components/composed/help-popover';
import { DayPicker } from '@/components/composed/day-picker';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

/* ── Types ── */
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

const ORDINAL_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Last'];
const DAY_OF_WEEK_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_EMAIL = 'contact@gmail.com';

/* ── Main Component ── */

interface NotificationsStepProps {
  onValidChange?: (valid: boolean) => void;
}

export function NotificationsStep({ onValidChange }: NotificationsStepProps) {
  /* Failure emails (always visible) */
  const [failureEmails, setFailureEmails] = useState<string[]>([DEFAULT_EMAIL]);

  /* Report validity to parent */
  useEffect(() => {
    onValidChange?.(failureEmails.length > 0);
  }, [failureEmails, onValidChange]);

  /* Success */
  const [successEnabled, setSuccessEnabled] = useState(false);
  const [successEmails, setSuccessEmails] = useState<string[]>([DEFAULT_EMAIL]);

  /* No File */
  const [noFileEnabled, setNoFileEnabled] = useState(false);
  const [noFileFrequency, setNoFileFrequency] = useState<Frequency>('hourly');
  const [noFileStarting, setNoFileStarting] = useState('Friday, 09 May, 2025');
  const [noFileEvery, setNoFileEvery] = useState('1');
  const [noFileAt, setNoFileAt] = useState('2:30 pm');
  const [noFileEmails, setNoFileEmails] = useState<string[]>([DEFAULT_EMAIL]);

  /* Weekly day selection — 0-indexed from Monday, default T(1), W(2), F(4) */
  const [noFileDays, setNoFileDays] = useState<boolean[]>([
    false, true, true, false, true, false, false,
  ]);

  /* Monthly pattern state */
  const [monthlyPattern, setMonthlyPattern] = useState<'day' | 'date'>('day');
  const [monthlyOrdinal, setMonthlyOrdinal] = useState('2nd');
  const [monthlyDayOfWeek, setMonthlyDayOfWeek] = useState('Wednesday');
  const [monthlyDates, setMonthlyDates] = useState<string[]>(['1st', '8th', '15th']);

  function copyFromFailure(setter: (emails: string[]) => void) {
    setter([...failureEmails]);
  }

  return (
    <div className="flex flex-col gap-8">
      <h3 className="m-0 text-xl font-semibold text-primary">Notifications</h3>
      <p className="-mt-6 mb-2 text-sm text-tertiary-foreground">Choose who gets notified when imports run, fail, or files are missing.</p>

      {/* ── Row 1: Failure (required) ── */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Failure (required)</p>
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            Be alerted by email when a connector run fails
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <ChipInput values={failureEmails} onChange={setFailureEmails} label="Email Address" type="email" placeholder="Add email…" aria-label="Add email address" />
        </div>
      </div>

      {/* ── Row 2: Success ── */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Success</p>
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            Be alerted by email when a connector run succeeds
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="toggle-success-enable"
              checked={successEnabled}
              onCheckedChange={setSuccessEnabled}
            />
            <Label htmlFor="toggle-success-enable">Enable</Label>
          </div>
          {successEnabled && (
            <div className="flex flex-col gap-3">
              <ChipInput
                values={successEmails}
                onChange={setSuccessEmails}
                label="Email Address"
                copyLabel="copy from above"
                onCopy={() => copyFromFailure(setSuccessEmails)}
                type="email"
                placeholder="Add email…"
                aria-label="Add email address"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: No File ── */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">No File</p>
            <HelpPopover
              title="What are no file notifications?"
              body="If you expect files to arrive on a regular schedule, you can set up alerts for when they don't. When enabled, UbiQuity will check on your chosen schedule and send an email if no new file has been found."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            Set the time you would like to be alerted if a new file is not
            available for upload from your defined source
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="toggle-nofile-enable"
              checked={noFileEnabled}
              onCheckedChange={setNoFileEnabled}
            />
            <Label htmlFor="toggle-nofile-enable">Enable</Label>
          </div>
          {noFileEnabled && (
            <div className="flex flex-col gap-3">
              <SegmentedControl
                options={FREQUENCY_OPTIONS}
                value={noFileFrequency}
                onValueChange={(v) => setNoFileFrequency(v as Frequency)}
              />

              {/* Starting date */}
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Starting</p>
                <Input
                  value={noFileStarting}
                  onChange={(e) => setNoFileStarting(e.target.value)}
                  aria-label="Starting date"
                />
              </div>

              {/* Weekly: On section — day-of-week buttons */}
              {noFileFrequency === 'weekly' && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground m-0">On</p>
                  <DayPicker
                    value={noFileDays}
                    onChange={setNoFileDays}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Monthly: Pattern + On the */}
              {noFileFrequency === 'monthly' && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground m-0">Pattern</p>
                    <div className="flex border border-border rounded-md overflow-hidden w-fit">
                      <button
                        type="button"
                        className={cn(
                          "py-2 px-6 text-sm font-medium text-tertiary-foreground bg-secondary border-none cursor-pointer transition-colors duration-150 whitespace-nowrap",
                          "border-r border-r-border",
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
                          "py-2 px-6 text-sm font-medium text-tertiary-foreground bg-secondary border-none cursor-pointer transition-colors duration-150 whitespace-nowrap",
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
                    <p className="text-xs font-medium text-muted-foreground m-0">On the</p>
                    {monthlyPattern === 'day' ? (
                      <div className="flex items-center gap-2">
                        <Select value={monthlyOrdinal} onValueChange={setMonthlyOrdinal}>
                          <SelectTrigger aria-label="Ordinal" className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDINAL_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={monthlyDayOfWeek} onValueChange={setMonthlyDayOfWeek}>
                          <SelectTrigger aria-label="Day of week" className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAY_OF_WEEK_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-[40px] relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[--ring-shadow]">
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
                          className="border-none outline-none bg-transparent text-xs text-tertiary-foreground cursor-pointer py-0.5 px-0 min-w-[24px] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-center w-6 ml-auto"
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

              {/* Every + At row */}
              <div className="flex items-end gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-xs font-medium text-muted-foreground m-0">Every</p>
                  <div className="flex items-stretch">
                    <Select value={noFileEvery} onValueChange={setNoFileEvery}>
                      <SelectTrigger aria-label="Every interval" className="rounded-r-none border-r-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="inline-flex items-center py-0 px-3 text-sm text-muted-foreground bg-secondary border border-border border-l-0 rounded-r-md whitespace-nowrap box-border">
                      {UNIT_MAP[noFileFrequency]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-xs font-medium text-muted-foreground m-0">At</p>
                  <Input
                    value={noFileAt}
                    onChange={(e) => setNoFileAt(e.target.value)}
                    aria-label="At time"
                  />
                </div>
              </div>

              {/* Email Address with copy from above */}
              <ChipInput
                values={noFileEmails}
                onChange={setNoFileEmails}
                label="Email Address"
                copyLabel="copy from above"
                onCopy={() => copyFromFailure(setNoFileEmails)}
                type="email"
                placeholder="Add email…"
                aria-label="Add email address"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
