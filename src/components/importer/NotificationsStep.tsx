import { useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { Toggle } from '../shared/Toggle';

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

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

/* ── Help Popover ── */
interface HelpPopoverProps {
  title: string;
  body: string;
}

function HelpPopover({ title, body }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] font-bold border-none cursor-pointer inline-flex items-center justify-center p-0 shrink-0 leading-none hover:bg-accent-hover"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Help: ${title}`}
      >
        ?
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[100] w-80 bg-accent-foreground text-primary-foreground rounded-md p-4 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.12),0px_4px_16px_0px_rgba(0,0,0,0.1),0px_8px_32px_0px_rgba(0,0,0,0.08)]" role="tooltip">
          <div className="flex items-center justify-between mb-2">
            <p className="text-base font-semibold m-0">{title}</p>
            <button
              type="button"
              className="bg-transparent border-none text-primary-foreground cursor-pointer text-base p-0 leading-none flex items-center justify-center hover:opacity-80"
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              ✕
            </button>
          </div>
          <p className="text-[13px] font-normal leading-[18px] m-0">{body}</p>
        </div>
      )}
    </span>
  );
}

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
    if (inputValue.trim()) {
      addEmail(inputValue);
    }
  }

  return (
    <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-[40px] relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]">
      {emails.map((email) => (
        <span key={email} className="inline-flex items-center gap-1 border border-primary text-primary rounded-full py-1 px-2 text-xs font-medium leading-none whitespace-nowrap">
          {email}
          <button
            type="button"
            className="bg-transparent border-none text-primary cursor-pointer text-xs p-0 leading-none flex items-center hover:text-accent-foreground"
            onClick={() => onChange(emails.filter((e) => e !== email))}
            aria-label={`Remove ${email}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        className="border-none outline-none text-sm text-foreground bg-transparent flex-1 min-w-[80px] py-0.5 px-0 placeholder:text-tertiary-foreground"
        type="email"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={emails.length === 0 ? (placeholder ?? 'Add email…') : ''}
        aria-label="Add email address"
      />
    </div>
  );
}

/* ── Main Component ── */
export function NotificationsStep() {
  /* Failure emails (always visible) */
  const [failureEmails, setFailureEmails] = useState<string[]>([DEFAULT_EMAIL]);

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

  function toggleDay(index: number) {
    setNoFileDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <h3 className="m-0 text-lg font-semibold text-primary">Notifications</h3>
      <p className="mt-[-20px] mb-0 text-sm text-tertiary-foreground">Choose who gets notified when imports run, fail, or files are missing.</p>

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
          <div>
            <p className="text-xs font-medium text-muted-foreground m-0">Email Address</p>
            <EmailChipInput emails={failureEmails} onChange={setFailureEmails} />
          </div>
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
            <Toggle
              checked={successEnabled}
              onChange={setSuccessEnabled}
              label="Enable"
              id="toggle-success-enable"
            />
          </div>
          {successEnabled && (
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground m-0">Email Address</p>
                  <button
                    type="button"
                    className="bg-transparent border-none text-primary text-xs font-medium cursor-pointer p-0 hover:underline"
                    onClick={() => copyFromFailure(setSuccessEmails)}
                  >
                    copy from above
                  </button>
                </div>
                <EmailChipInput emails={successEmails} onChange={setSuccessEmails} />
              </div>
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
            <Toggle
              checked={noFileEnabled}
              onChange={setNoFileEnabled}
              label="Enable"
              id="toggle-nofile-enable"
            />
          </div>
          {noFileEnabled && (
            <div className="flex flex-col gap-3">
              {/* Frequency segmented toggle */}
              <div className="flex border border-border rounded-md overflow-hidden w-full">
                {FREQUENCY_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      "flex-1 py-2 px-4 text-[13px] font-medium text-tertiary-foreground bg-secondary border-none border-b-2 border-b-transparent cursor-pointer transition-colors duration-150 whitespace-nowrap uppercase flex items-center justify-center",
                      i < FREQUENCY_OPTIONS.length - 1 && "border-r border-r-border",
                      noFileFrequency === opt.value && "text-primary font-semibold bg-background border-b-2 border-b-primary",
                      noFileFrequency !== opt.value && "hover:text-muted-foreground"
                    )}
                    onClick={() => setNoFileFrequency(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Starting date */}
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Starting</p>
                <input
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground"
                  type="text"
                  value={noFileStarting}
                  onChange={(e) => setNoFileStarting(e.target.value)}
                  aria-label="Starting date"
                />
              </div>

              {/* Weekly: On section — day-of-week buttons */}
              {noFileFrequency === 'weekly' && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground m-0">On</p>
                  <div className="flex items-center gap-2 mt-1">
                    {DAY_LABELS.map((label, i) => (
                      <button
                        key={i}
                        type="button"
                        className={cn(
                          "w-9 h-9 rounded-full border-2 border-primary bg-background text-primary text-sm font-semibold cursor-pointer inline-flex items-center justify-center p-0 transition-colors duration-150 leading-none",
                          noFileDays[i] && "bg-primary text-primary-foreground",
                          !noFileDays[i] && "hover:bg-accent"
                        )}
                        onClick={() => toggleDay(i)}
                        aria-label={`${DAY_OF_WEEK_OPTIONS[i]}${noFileDays[i] ? ' selected' : ''}`}
                        aria-pressed={noFileDays[i]}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
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
                        <select
                          className="flex-1 py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-8 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]"
                          value={monthlyOrdinal}
                          onChange={(e) => setMonthlyOrdinal(e.target.value)}
                          aria-label="Ordinal"
                        >
                          {ORDINAL_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <select
                          className="flex-1 py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-8 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]"
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
                      <div className="border border-border rounded-md py-1.5 px-2 flex flex-wrap items-center gap-1.5 min-h-[40px] relative cursor-text bg-background focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]">
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
                    <select
                      className="flex-1 py-2 px-3 text-sm border border-border rounded-md rounded-r-none border-r-0 bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-8 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]"
                      value={noFileEvery}
                      onChange={(e) => setNoFileEvery(e.target.value)}
                      aria-label="Every interval"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <span className="inline-flex items-center py-0 px-3 text-sm text-muted-foreground bg-secondary border border-border border-l-0 rounded-r-md whitespace-nowrap box-border">
                      {UNIT_MAP[noFileFrequency]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="text-xs font-medium text-muted-foreground m-0">At</p>
                  <input
                    className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 box-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground"
                    type="text"
                    value={noFileAt}
                    onChange={(e) => setNoFileAt(e.target.value)}
                    aria-label="At time"
                  />
                </div>
              </div>

              {/* Email Address with copy from above */}
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground m-0">Email Address</p>
                  <button
                    type="button"
                    className="bg-transparent border-none text-primary text-xs font-medium cursor-pointer p-0 hover:underline"
                    onClick={() => copyFromFailure(setNoFileEmails)}
                  >
                    copy from above
                  </button>
                </div>
                <EmailChipInput emails={noFileEmails} onChange={setNoFileEmails} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
