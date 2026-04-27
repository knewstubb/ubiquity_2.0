import { useState, type KeyboardEvent } from 'react';
import { Toggle } from '../shared/Toggle';
import styles from './NotificationsStep.module.css';

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
    <span className={styles.popoverWrap}>
      <button
        type="button"
        className={styles.helpBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Help: ${title}`}
      >
        ?
      </button>
      {open && (
        <div className={styles.popover} role="tooltip">
          <div className={styles.popoverTitleRow}>
            <p className={styles.popoverTitle}>{title}</p>
            <button
              type="button"
              className={styles.popoverClose}
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              ✕
            </button>
          </div>
          <p className={styles.popoverBody}>{body}</p>
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
    <div className={styles.chipInputWrap}>
      {emails.map((email) => (
        <span key={email} className={styles.chip}>
          {email}
          <button
            type="button"
            className={styles.chipRemove}
            onClick={() => onChange(emails.filter((e) => e !== email))}
            aria-label={`Remove ${email}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        className={styles.chipInputField}
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
    <div className={styles.container}>
      <h3 className={styles.title}>Notifications</h3>
      <p className={styles.subtitle}>Choose who gets notified when imports run, fail, or files are missing.</p>

      {/* ── Row 1: Failure (required) ── */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Failure (required)</p>
          </div>
          <p className={styles.labelHint}>
            Be alerted by email when a connector run fails
          </p>
        </div>
        <div className={styles.inputCol}>
          <div>
            <p className={styles.inputLabel}>Email Address</p>
            <EmailChipInput emails={failureEmails} onChange={setFailureEmails} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Success ── */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Success</p>
          </div>
          <p className={styles.labelHint}>
            Be alerted by email when a connector run succeeds
          </p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.toggleRow}>
            <Toggle
              checked={successEnabled}
              onChange={setSuccessEnabled}
              label="Enable"
              id="toggle-success-enable"
            />
          </div>
          {successEnabled && (
            <div className={styles.subSection}>
              <div>
                <div className={styles.emailHeaderRow}>
                  <p className={styles.inputLabel}>Email Address</p>
                  <button
                    type="button"
                    className={styles.copyLink}
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
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>No File</p>
            <HelpPopover
              title="What are no file notifications?"
              body="If you expect files to arrive on a regular schedule, you can set up alerts for when they don't. When enabled, UbiQuity will check on your chosen schedule and send an email if no new file has been found."
            />
          </div>
          <p className={styles.labelHint}>
            Set the time you would like to be alerted if a new file is not
            available for upload from your defined source
          </p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.toggleRow}>
            <Toggle
              checked={noFileEnabled}
              onChange={setNoFileEnabled}
              label="Enable"
              id="toggle-nofile-enable"
            />
          </div>
          {noFileEnabled && (
            <div className={styles.subSection}>
              {/* Frequency segmented toggle */}
              <div className={styles.segmented}>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.segmentBtn} ${noFileFrequency === opt.value ? styles.segmentBtnActive : ''}`}
                    onClick={() => setNoFileFrequency(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Starting date */}
              <div>
                <p className={styles.inputLabel}>Starting</p>
                <input
                  className={styles.textInput}
                  type="text"
                  value={noFileStarting}
                  onChange={(e) => setNoFileStarting(e.target.value)}
                  aria-label="Starting date"
                />
              </div>

              {/* Weekly: On section — day-of-week buttons */}
              {noFileFrequency === 'weekly' && (
                <div>
                  <p className={styles.inputLabel}>On</p>
                  <div className={styles.dayButtonRow}>
                    {DAY_LABELS.map((label, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`${styles.dayButton} ${noFileDays[i] ? styles.dayButtonSelected : ''}`}
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
                    <p className={styles.inputLabel}>Pattern</p>
                    <div className={styles.patternToggle}>
                      <button
                        type="button"
                        className={`${styles.patternBtn} ${monthlyPattern === 'day' ? styles.patternBtnActive : ''}`}
                        onClick={() => setMonthlyPattern('day')}
                      >
                        Day
                      </button>
                      <button
                        type="button"
                        className={`${styles.patternBtn} ${monthlyPattern === 'date' ? styles.patternBtnActive : ''}`}
                        onClick={() => setMonthlyPattern('date')}
                      >
                        Date
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className={styles.inputLabel}>On the</p>
                    {monthlyPattern === 'day' ? (
                      <div className={styles.onTheRow}>
                        <select
                          className={styles.select}
                          value={monthlyOrdinal}
                          onChange={(e) => setMonthlyOrdinal(e.target.value)}
                          aria-label="Ordinal"
                        >
                          {ORDINAL_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <select
                          className={styles.select}
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
                      <div className={styles.chipInputWrap}>
                        {monthlyDates.map((d) => (
                          <span key={d} className={styles.chip}>
                            {d}
                            <button
                              type="button"
                              className={styles.chipRemove}
                              onClick={() => setMonthlyDates((prev) => prev.filter((x) => x !== d))}
                              aria-label={`Remove ${d}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        <select
                          className={styles.chipDropdownInline}
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
              <div className={styles.inlineRow}>
                <div className={styles.inlineField}>
                  <p className={styles.inputLabel}>Every</p>
                  <div className={styles.everyInputGroup}>
                    <select
                      className={`${styles.select} ${styles.everySelect}`}
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
                    <span className={styles.unitSuffix}>
                      {UNIT_MAP[noFileFrequency]}
                    </span>
                  </div>
                </div>
                <div className={styles.inlineField}>
                  <p className={styles.inputLabel}>At</p>
                  <input
                    className={styles.textInput}
                    type="text"
                    value={noFileAt}
                    onChange={(e) => setNoFileAt(e.target.value)}
                    aria-label="At time"
                  />
                </div>
              </div>

              {/* Email Address with copy from above */}
              <div>
                <div className={styles.emailHeaderRow}>
                  <p className={styles.inputLabel}>Email Address</p>
                  <button
                    type="button"
                    className={styles.copyLink}
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
