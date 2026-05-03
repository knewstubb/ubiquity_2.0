import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react';
import { getCurrentBillingCycle } from '../../models/billing';
import styles from './DateRangePicker.module.css';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

interface Preset {
  label: string;
  start: string;
  end: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Build billing cycle presets: current + previous 11 months */
function buildPresets(): Preset[] {
  const presets: Preset[] = [];
  const today = new Date();
  const todayIso = toIso(today);

  // Today
  presets.push({ label: 'Today', start: todayIso, end: todayIso });

  // Current billing cycle
  const current = getCurrentBillingCycle();
  presets.push({ label: 'Current Billing Cycle', start: current.start, end: current.end });

  // Previous billing cycles (by month, going back 11 months)
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // Determine which cycle we're in to start going backwards
  let cycleMonth: number;
  let cycleYear: number;
  if (currentDay < 26) {
    // We're in the cycle that started last month's 26th
    cycleMonth = currentMonth - 1;
    cycleYear = currentYear;
  } else {
    cycleMonth = currentMonth;
    cycleYear = currentYear;
  }

  // Go back 11 previous cycles
  for (let i = 1; i <= 11; i++) {
    let prevMonth = cycleMonth - i;
    let prevYear = cycleYear;
    while (prevMonth < 0) {
      prevMonth += 12;
      prevYear -= 1;
    }

    const startDate = new Date(prevYear, prevMonth, 26);
    const endDate = new Date(prevYear, prevMonth + 1, 25);

    const monthLabel = MONTH_NAMES[startDate.getMonth()];
    const label = `${monthLabel} ${startDate.getFullYear()}`;

    presets.push({
      label,
      start: toIso(startDate),
      end: toIso(endDate),
    });
  }

  return presets;
}

/** Get the days grid for a given month (Monday-start weeks) */
function getMonthGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  // Convert Sunday=0 to Monday=0 system
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // Leading nulls
  for (let i = 0; i < startDow; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  // Trailing nulls
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [calYear, setCalYear] = useState(() => {
    const d = new Date(startDate + 'T00:00:00');
    return d.getFullYear();
  });
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date(startDate + 'T00:00:00');
    return d.getMonth();
  });

  // Range selection state: null = no selection started, string = start picked
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const presets = useMemo(() => buildPresets(), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setRangeStart(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setRangeStart(null);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const prevMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleDayClick = useCallback(
    (day: number) => {
      const iso = toIso(new Date(calYear, calMonth, day));
      if (rangeStart === null) {
        // First click — set range start
        setRangeStart(iso);
      } else {
        // Second click — complete the range
        const [start, end] = rangeStart <= iso ? [rangeStart, iso] : [iso, rangeStart];
        onStartDateChange(start);
        onEndDateChange(end);
        setRangeStart(null);
        setOpen(false);
      }
    },
    [calYear, calMonth, rangeStart, onStartDateChange, onEndDateChange],
  );

  const handlePresetClick = useCallback(
    (preset: Preset) => {
      onStartDateChange(preset.start);
      onEndDateChange(preset.end);
      setRangeStart(null);
      setOpen(false);
    },
    [onStartDateChange, onEndDateChange],
  );

  const grid = useMemo(() => getMonthGrid(calYear, calMonth), [calYear, calMonth]);

  // Determine the effective visual range for highlighting
  const effectiveStart = rangeStart ?? startDate;
  const effectiveEnd = rangeStart ? (hoverDate ?? rangeStart) : endDate;
  const highlightStart = effectiveStart <= effectiveEnd ? effectiveStart : effectiveEnd;
  const highlightEnd = effectiveStart <= effectiveEnd ? effectiveEnd : effectiveStart;

  const displayLabel = `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-label="Select date range"
      >
        <CalendarBlank size={16} weight="regular" className={styles.calIcon} />
        <span className={styles.triggerText}>{displayLabel}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.calendarSide}>
            {/* Month header */}
            <div className={styles.monthHeader}>
              <span className={styles.monthLabel}>
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <div className={styles.monthNav}>
                <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
                  <CaretLeft size={14} weight="bold" />
                </button>
                <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Next month">
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className={styles.dayHeaders}>
              {DAY_HEADERS.map((d, i) => (
                <span key={i} className={styles.dayHeader}>{d}</span>
              ))}
            </div>

            {/* Calendar grid */}
            <div className={styles.calGrid}>
              {grid.map((week, wi) => (
                <div key={wi} className={styles.week}>
                  {week.map((day, di) => {
                    if (day === null) {
                      return <span key={di} className={styles.emptyDay} />;
                    }

                    const iso = toIso(new Date(calYear, calMonth, day));
                    const isInRange = iso >= highlightStart && iso <= highlightEnd;
                    const isRangeEdge = iso === highlightStart || iso === highlightEnd;
                    const isToday = iso === toIso(new Date());

                    let cls = styles.day;
                    if (isRangeEdge) cls += ` ${styles.dayEdge}`;
                    else if (isInRange) cls += ` ${styles.dayInRange}`;
                    if (isToday && !isRangeEdge) cls += ` ${styles.dayToday}`;

                    return (
                      <button
                        key={di}
                        type="button"
                        className={cls}
                        onClick={() => handleDayClick(day)}
                        onMouseEnter={() => setHoverDate(iso)}
                        onMouseLeave={() => setHoverDate(null)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Presets side */}
          <div className={styles.presetsSide}>
            {presets.map((preset) => {
              const isActive = preset.start === startDate && preset.end === endDate;
              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`${styles.presetBtn} ${isActive ? styles.presetBtnActive : ''}`}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
