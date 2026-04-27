import { useState } from 'react';
import type { WizardDraft } from '../../models/wizard';
import type { ScheduleFrequency } from '../../models/connector';
import styles from './ExporterScheduleStep.module.css';

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
    <div className={styles.container} data-testid="exporter-schedule-step">
      <h3 className={styles.title}>Schedule</h3>
      <p className={styles.subtitle}>Set when and how often this export runs.</p>

      <div className={styles.controlsColumn}>
        {/* Frequency */}
        <div className={styles.segmented}>
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.segmentBtn} ${frequency === opt.value ? styles.segmentBtnActive : ''}`}
              onClick={() => handleFrequencyChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Starting */}
        <div>
          <p className={styles.inputLabel}>Starting</p>
          <input
            className={styles.textInput}
            type="text"
            value={starting}
            onChange={(e) => setStarting(e.target.value)}
            aria-label="Starting date"
          />
        </div>

        {/* On (Weekly only) */}
        {frequency === 'weekly' && (
          <div>
            <p className={styles.inputLabel}>On</p>
            <div className={styles.dayButtonRow}>
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.dayButton} ${days[i] ? styles.dayButtonSelected : ''}`}
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

        {/* Every + At */}
        <div className={styles.inlineRow}>
          <div className={styles.inlineField}>
            <p className={styles.inputLabel}>Every</p>
            <div className={styles.everyInputGroup}>
              <select
                className={`${styles.select} ${styles.everySelect}`}
                value={every}
                onChange={(e) => setEvery(e.target.value)}
                aria-label="Every interval"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>{n}</option>
                ))}
              </select>
              <span className={styles.unitSuffix}>{UNIT_MAP[frequency]}</span>
            </div>
          </div>
          <div className={styles.inlineField}>
            <p className={styles.inputLabel}>At</p>
            <input
              className={styles.textInput}
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
