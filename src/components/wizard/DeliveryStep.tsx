import { useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { Toggle } from '../shared/Toggle';
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

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_OF_WEEK_NAMES = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const ORDINAL_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Last'];
const DAY_OF_WEEK_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

/* ── Email Chip Input ── */
interface EmailChipInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
}

function EmailChipInput({ emails, onChange, placeholder }: EmailChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  function addEmail(raw: string) {
    const email = raw.trim();
    if (email && !emails.includes(email)) {
      onChange([...emails, email]);
    }
    setInputValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(inputValue);
    }
    if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      onChange(emails.slice(0, -1));
    }
  }

  function handleBlur() {
    if (inputValue.trim()) addEmail(inputValue);
  }

  return (
    <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-10 relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]">
      {emails.map((email) => (
        <span key={email} className="inline-flex items-center gap-1 border border-primary text-primary rounded-full py-1 px-2 text-xs font-medium leading-none whitespace-nowrap">
          {email}
          <button type="button" className="bg-transparent border-none text-primary cursor-pointer text-xs p-0 leading-none flex items-center hover:text-accent-foreground"
            onClick={() => onChange(emails.filter((e) => e !== email))}
            aria-label={`Remove ${email}`}>✕</button>
        </span>
      ))}
      <input className="border-none outline-none text-sm text-foreground bg-transparent flex-1 min-w-20 py-0.5 placeholder:text-tertiary-foreground" type="email" value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleBlur}
        placeholder={emails.length === 0 ? (placeholder ?? 'Add email…') : ''} aria-label="Add email address" />
    </div>
  );
}

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

  function toggleDay(index: number) {
    const next = [...sc.weeklyDays];
    next[index] = !next[index];
    updateSchedule({ weeklyDays: next });
  }

  return (
    <div className="flex flex-col gap-8" data-testid="delivery-step">
      <h3 className="m-0 text-lg font-semibold text-primary">Schedule</h3>
      <p className="-mt-5 text-sm text-tertiary-foreground">Set the export schedule and notification preferences.</p>

      {/* ── Schedule Section ── */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <p className="text-sm font-semibold text-foreground m-0">Schedule</p>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">Configure export frequency and timing</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="flex border border-border rounded-md overflow-hidden w-full">
            {FREQUENCY_OPTIONS.map((opt, i) => (
              <button key={opt.value} type="button"
                className={cn(
                  "flex-1 py-2 px-4 text-[13px] font-medium text-tertiary-foreground bg-secondary border-none border-b-2 border-b-transparent cursor-pointer transition-all duration-150 whitespace-nowrap uppercase flex items-center justify-center",
                  i < FREQUENCY_OPTIONS.length - 1 && "border-r border-r-border",
                  sc.frequency === opt.value && "text-primary font-semibold bg-background border-b-2 border-b-primary",
                  sc.frequency !== opt.value && "hover:text-muted-foreground"
                )}
                onClick={() => handleFrequencyChange(opt.value)}>{opt.label}</button>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Starting</p>
            <input className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground" type="text" value={sc.starting}
              onChange={(e) => updateSchedule({ starting: e.target.value })} aria-label="Starting date" />
          </div>

          {sc.frequency === 'weekly' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1">On</p>
              <div className="flex items-center gap-2 mt-1">
                {DAY_LABELS.map((label, i) => (
                  <button key={i} type="button"
                    className={cn(
                      "w-9 h-9 rounded-full border-2 border-primary bg-background text-primary text-sm font-semibold cursor-pointer inline-flex items-center justify-center p-0 transition-colors duration-150 leading-none",
                      !sc.weeklyDays[i] && "hover:bg-accent",
                      sc.weeklyDays[i] && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => toggleDay(i)}
                    aria-label={`${DAY_OF_WEEK_NAMES[i]}${sc.weeklyDays[i] ? ' selected' : ''}`}
                    aria-pressed={sc.weeklyDays[i]}>{label}</button>
                ))}
              </div>
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
                    <select className="flex-1 py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-no-repeat bg-[right_12px_center] pr-8 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }} value={sc.monthlyOrdinal}
                      onChange={(e) => updateSchedule({ monthlyOrdinal: e.target.value })} aria-label="Ordinal">
                      {ORDINAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select className="flex-1 py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-no-repeat bg-[right_12px_center] pr-8 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }} value={sc.monthlyDayOfWeek}
                      onChange={(e) => updateSchedule({ monthlyDayOfWeek: e.target.value })} aria-label="Day of week">
                      {DAY_OF_WEEK_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-10 relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]">
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
                <select className="flex-1 py-2 px-3 text-sm border border-border rounded-l-md rounded-r-none border-r-0 bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-no-repeat bg-[right_12px_center] pr-8 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }} value={sc.every}
                  onChange={(e) => updateSchedule({ every: e.target.value })} aria-label="Every interval">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={String(n)}>{n}</option>
                  ))}
                </select>
                <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-secondary border border-border border-l-0 rounded-r-md whitespace-nowrap box-border">{UNIT_MAP[sc.frequency]}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-xs font-medium text-muted-foreground m-0 mb-1">At</p>
              <input className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground" type="text" value={sc.at}
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
          <div>
            <p className="text-xs font-medium text-muted-foreground m-0 mb-1">Email Address</p>
            <EmailChipInput emails={notif.emails}
              onChange={(emails) => updateNotifications({ emails })} />
          </div>

          <div className="flex items-center gap-3">
            <Toggle checked={notif.successEnabled}
              onChange={(v) => updateNotifications({ successEnabled: v })}
              label="Successful Export" id="toggle-success-export" />
          </div>

          <div className="flex items-center gap-3">
            <Toggle checked={notif.failureEnabled}
              onChange={(v) => updateNotifications({ failureEnabled: v })}
              label="Failed Export" id="toggle-failure-export" />
          </div>
        </div>
      </div>
    </div>
  );
}
