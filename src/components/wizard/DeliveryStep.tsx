import { useState, type KeyboardEvent } from 'react';
import { Toggle } from '../shared/Toggle';
import type { WizardDraft, ScheduleConfig, NotificationConfig } from '../../models/wizard';
import type { ScheduleFrequency } from '../../models/connector';
import styles from './DeliveryStep.module.css';

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
    <div className={styles.chipInputWrap}>
      {emails.map((email) => (
        <span key={email} className={styles.chip}>
          {email}
          <button type="button" className={styles.chipRemove}
            onClick={() => onChange(emails.filter((e) => e !== email))}
            aria-label={`Remove ${email}`}>✕</button>
        </span>
      ))}
      <input className={styles.chipInputField} type="email" value={inputValue}
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
    <div className={styles.container} data-testid="delivery-step">
      <h3 className={styles.title}>Schedule</h3>
      <p className={styles.subtitle}>Set the export schedule and notification preferences.</p>

      {/* ── Schedule Section ── */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <p className={styles.labelText}>Schedule</p>
          <p className={styles.labelHint}>Configure export frequency and timing</p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.segmented}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button"
                className={`${styles.segmentBtn} ${sc.frequency === opt.value ? styles.segmentBtnActive : ''}`}
                onClick={() => handleFrequencyChange(opt.value)}>{opt.label}</button>
            ))}
          </div>

          <div>
            <p className={styles.inputLabel}>Starting</p>
            <input className={styles.textInput} type="text" value={sc.starting}
              onChange={(e) => updateSchedule({ starting: e.target.value })} aria-label="Starting date" />
          </div>

          {sc.frequency === 'weekly' && (
            <div>
              <p className={styles.inputLabel}>On</p>
              <div className={styles.dayButtonRow}>
                {DAY_LABELS.map((label, i) => (
                  <button key={i} type="button"
                    className={`${styles.dayButton} ${sc.weeklyDays[i] ? styles.dayButtonSelected : ''}`}
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
                <p className={styles.inputLabel}>Pattern</p>
                <div className={styles.patternToggle}>
                  <button type="button"
                    className={`${styles.patternBtn} ${sc.monthlyPattern === 'day' ? styles.patternBtnActive : ''}`}
                    onClick={() => updateSchedule({ monthlyPattern: 'day' })}>Day</button>
                  <button type="button"
                    className={`${styles.patternBtn} ${sc.monthlyPattern === 'date' ? styles.patternBtnActive : ''}`}
                    onClick={() => updateSchedule({ monthlyPattern: 'date' })}>Date</button>
                </div>
              </div>
              <div>
                <p className={styles.inputLabel}>On the</p>
                {sc.monthlyPattern === 'day' ? (
                  <div className={styles.onTheRow}>
                    <select className={styles.select} value={sc.monthlyOrdinal}
                      onChange={(e) => updateSchedule({ monthlyOrdinal: e.target.value })} aria-label="Ordinal">
                      {ORDINAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select className={styles.select} value={sc.monthlyDayOfWeek}
                      onChange={(e) => updateSchedule({ monthlyDayOfWeek: e.target.value })} aria-label="Day of week">
                      {DAY_OF_WEEK_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className={styles.chipInputWrap}>
                    {sc.monthlyDates.map((d) => (
                      <span key={d} className={styles.chip}>{d}
                        <button type="button" className={styles.chipRemove}
                          onClick={() => updateSchedule({ monthlyDates: sc.monthlyDates.filter((x) => x !== d) })}
                          aria-label={`Remove ${d}`}>✕</button>
                      </span>
                    ))}
                    <select className={styles.chipDropdownInline} value=""
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

          <div className={styles.inlineRow}>
            <div className={styles.inlineField}>
              <p className={styles.inputLabel}>Every</p>
              <div className={styles.everyInputGroup}>
                <select className={`${styles.select} ${styles.everySelect}`} value={sc.every}
                  onChange={(e) => updateSchedule({ every: e.target.value })} aria-label="Every interval">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={String(n)}>{n}</option>
                  ))}
                </select>
                <span className={styles.unitSuffix}>{UNIT_MAP[sc.frequency]}</span>
              </div>
            </div>
            <div className={styles.inlineField}>
              <p className={styles.inputLabel}>At</p>
              <input className={styles.textInput} type="text" value={sc.at}
                onChange={(e) => updateSchedule({ at: e.target.value })} aria-label="At time" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Notifications Section ── */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <p className={styles.labelText}>Notifications</p>
          <p className={styles.labelHint}>Email alerts for export events</p>
        </div>
        <div className={styles.inputCol}>
          <div>
            <p className={styles.inputLabel}>Email Address</p>
            <EmailChipInput emails={notif.emails}
              onChange={(emails) => updateNotifications({ emails })} />
          </div>

          <div className={styles.toggleRow}>
            <Toggle checked={notif.successEnabled}
              onChange={(v) => updateNotifications({ successEnabled: v })}
              label="Successful Export" id="toggle-success-export" />
          </div>

          <div className={styles.toggleRow}>
            <Toggle checked={notif.failureEnabled}
              onChange={(v) => updateNotifications({ failureEnabled: v })}
              label="Failed Export" id="toggle-failure-export" />
          </div>
        </div>
      </div>
    </div>
  );
}
