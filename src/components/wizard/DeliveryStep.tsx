import { cn } from '../../lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import { ChipInput } from '@/components/composed/chip-input';
import { DayPicker } from '@/components/composed/day-picker';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import type { WizardDraft, ScheduleConfig, NotificationConfig } from '../../models/wizard';
import type { ScheduleFrequency } from '../../models/automation';

interface DeliveryStepProps {
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

const ORDINAL_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Last'];
const DAY_OF_WEEK_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

/* ── Main Component ── */
export function DeliveryStep({ draft, onUpdate }: DeliveryStepProps) {
  const sc = draft.scheduleConfig;
  const notif = draft.notifications;

  function updateSchedule(patch: Partial<ScheduleConfig>) {
    onUpdate({ scheduleConfig: { ...sc, ...patch } });
  }

  function updateNotifications(patch: Partial<NotificationConfig>) {
    onUpdate({ notifications: { ...notif, ...patch } });
  }

  function handleFrequencyChange(f: Frequency) {
    updateSchedule({ frequency: f });
    onUpdate({ schedule: f as ScheduleFrequency });
  }

  return (
    <div className="flex flex-col gap-8" data-testid="delivery-step">
      <h3 className="m-0 text-xl font-semibold text-primary">Schedule</h3>
      <p className="-mt-6 mb-2 text-sm text-tertiary-foreground">Set the export schedule and notification preferences.</p>

      {/* ── Schedule Section ── */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Schedule</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Configure export frequency and timing</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <SegmentedControl
            options={FREQUENCY_OPTIONS}
            value={sc.frequency}
            onValueChange={(v) => handleFrequencyChange(v as Frequency)}
          />

          <div>
            <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Starting</p>
            <Input value={sc.starting}
              onChange={(e) => updateSchedule({ starting: e.target.value })} aria-label="Starting date" />
          </div>

          {sc.frequency === 'weekly' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1">On</p>
              <DayPicker
                value={sc.weeklyDays}
                onChange={(days) => updateSchedule({ weeklyDays: days })}
                className="mt-1"
              />
            </div>
          )}

          {sc.frequency === 'monthly' && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Pattern</p>
                <div className="flex border border-border rounded-md overflow-hidden w-fit">
                  <button type="button"
                    className={cn(
                      "py-2 px-6 text-sm font-medium text-tertiary-foreground bg-secondary border-none cursor-pointer transition-all duration-150 whitespace-nowrap",
                      "border-r border-r-border",
                      sc.monthlyPattern === 'day' && "text-primary font-semibold bg-background",
                      sc.monthlyPattern !== 'day' && "hover:text-muted-foreground"
                    )}
                    onClick={() => updateSchedule({ monthlyPattern: 'day' })}>Day</button>
                  <button type="button"
                    className={cn(
                      "py-2 px-6 text-sm font-medium text-tertiary-foreground bg-secondary border-none cursor-pointer transition-all duration-150 whitespace-nowrap",
                      sc.monthlyPattern === 'date' && "text-primary font-semibold bg-background",
                      sc.monthlyPattern !== 'date' && "hover:text-muted-foreground"
                    )}
                    onClick={() => updateSchedule({ monthlyPattern: 'date' })}>Date</button>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0 mb-1">On the</p>
                {sc.monthlyPattern === 'day' ? (
                  <div className="flex items-center gap-2">
                    <Select value={sc.monthlyOrdinal} onValueChange={(v) => updateSchedule({ monthlyOrdinal: v })}>
                      <SelectTrigger aria-label="Ordinal" className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDINAL_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={sc.monthlyDayOfWeek} onValueChange={(v) => updateSchedule({ monthlyDayOfWeek: v })}>
                      <SelectTrigger aria-label="Day of week" className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAY_OF_WEEK_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-10 relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[--ring-shadow]">
                    {sc.monthlyDates.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1 border border-primary text-primary rounded-full py-1 px-2 text-xs font-medium leading-none whitespace-nowrap">{d}
                        <button type="button" className="bg-transparent border-none text-primary cursor-pointer text-xs p-0 leading-none flex items-center hover:text-accent-foreground"
                          onClick={() => updateSchedule({ monthlyDates: sc.monthlyDates.filter((x) => x !== d) })}
                          aria-label={`Remove ${d}`}>✕</button>
                      </span>
                    ))}
                    <select className="border-none outline-none bg-transparent text-xs text-tertiary-foreground cursor-pointer py-0.5 min-w-6 appearance-none bg-no-repeat bg-center w-6 ml-auto" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }} value=""
                      onChange={(e) => {
                        if (e.target.value && !sc.monthlyDates.includes(e.target.value)) {
                          updateSchedule({ monthlyDates: [...sc.monthlyDates, e.target.value] });
                        }
                        e.target.value = '';
                      }} aria-label="Add date">
                      <option value="" disabled></option>
                      {Array.from({ length: 28 }, (_, i) => {
                        const n = i + 1;
                        const suffix = n === 1 || n === 21 ? 'st' : n === 2 || n === 22 ? 'nd' : n === 3 || n === 23 ? 'rd' : 'th';
                        return `${n}${suffix}`;
                      }).filter((d) => !sc.monthlyDates.includes(d)).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Every</p>
              <div className="flex items-stretch">
                <Select value={sc.every} onValueChange={(v) => updateSchedule({ every: v })}>
                  <SelectTrigger aria-label="Every interval" className="rounded-r-none border-r-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-secondary border border-border border-l-0 rounded-r-md whitespace-nowrap box-border">{UNIT_MAP[sc.frequency]}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1">At</p>
              <Input value={sc.at}
                onChange={(e) => updateSchedule({ at: e.target.value })} aria-label="At time" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Notifications Section ── */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Notifications</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Email alerts for export events</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <ChipInput
            values={notif.emails}
            onChange={(emails) => updateNotifications({ emails })}
            label="Email Address"
            type="email"
            placeholder="Add email…"
            aria-label="Add email address"
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="toggle-success-export"
                checked={notif.successEnabled}
                onCheckedChange={(v) => updateNotifications({ successEnabled: v })}
              />
              <Label htmlFor="toggle-success-export">Successful Export</Label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="toggle-failure-export"
                checked={notif.failureEnabled}
                onCheckedChange={(v) => updateNotifications({ failureEnabled: v })}
              />
              <Label htmlFor="toggle-failure-export">Failed Export</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
