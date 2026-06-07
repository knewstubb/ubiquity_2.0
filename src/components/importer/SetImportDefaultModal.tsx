import { useState, useMemo } from 'react';
import { Tag, CalendarBlank } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Combobox } from '../ui/combobox';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CloseButton } from '../ui/close-button';
import { ChipInput } from '../composed/chip-input';
import { DayPicker } from '../composed/day-picker';
import type { ImportDefaultRow } from '../../models/importer';

/* ── Types ── */

export interface AvailableField {
  value: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean';
}

export interface SetImportDefaultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableFields: AvailableField[];
  onSubmit: (defaultRow: ImportDefaultRow) => void;
}

/* ── Constants ── */

const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 5; // 05:00 to 22:00
  return `${hour.toString().padStart(2, '0')}:00`;
});

/* ── Helpers ── */

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="neutral-subtle" className="ml-auto">
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
}

/* ── Component ── */

export function SetImportDefaultModal({
  open,
  onOpenChange,
  availableFields,
  onSubmit,
}: SetImportDefaultModalProps) {
  const [targetField, setTargetField] = useState('');
  const [mode, setMode] = useState<'fixed' | 'send-date' | null>(null);
  const [fixedValue, setFixedValue] = useState('');

  // Send schedule state
  const [days, setDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [includeTime, setIncludeTime] = useState(false);
  const [hours, setHours] = useState<string[]>([]);
  const [activePeriodsOnly, setActivePeriodsOnly] = useState(false);
  const [avoidHolidays, setAvoidHolidays] = useState(false);

  // Filter out boolean fields
  const filteredFields = useMemo(
    () => availableFields.filter((f) => f.type !== 'boolean'),
    [availableFields],
  );

  // Determine if selected field is date/datetime
  const selectedFieldType = useMemo(() => {
    const field = availableFields.find((f) => f.value === targetField);
    return field?.type ?? null;
  }, [availableFields, targetField]);

  const isDateField = selectedFieldType === 'date' || selectedFieldType === 'datetime';

  // Validation
  const isValid = useMemo(() => {
    if (!targetField) return false;
    if (!mode) return false;
    if (mode === 'fixed' && !fixedValue.trim()) return false;
    if (mode === 'send-date' && !days.some(Boolean)) return false;
    return true;
  }, [targetField, mode, fixedValue, days]);

  function handleSubmit() {
    if (!isValid || !mode) return;

    const row: ImportDefaultRow = {
      targetField,
      mode,
    };

    if (mode === 'fixed') {
      row.fixedValue = fixedValue.trim();
    } else {
      row.sendSchedule = {
        days: days.reduce<number[]>((acc, selected, idx) => selected ? [...acc, idx] : acc, []),
        includeTime,
        hours,
        activePeriodsOnly,
        avoidHolidays,
      };
    }

    onSubmit(row);
    handleReset();
  }

  function handleReset() {
    setTargetField('');
    setMode(null);
    setFixedValue('');
    setDays([false, false, false, false, false, false, false]);
    setIncludeTime(false);
    setHours([]);
    setActivePeriodsOnly(false);
    setAvoidHolidays(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) handleReset();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Set import default</DialogTitle>
          <DialogClose asChild>
            <CloseButton size="sm" />
          </DialogClose>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {/* Subtitle */}
          <DialogDescription className="text-sm m-0">
            Choose a database column and define what value to inject when this import runs.
          </DialogDescription>

          {/* Step 1: Target Field */}
          <div className="space-y-2">
            <Label>Which column should receive the value?</Label>
            <Combobox
              value={targetField}
              onValueChange={(val) => {
                setTargetField(val);
                // Reset mode if switching away from date field
                if (mode === 'send-date') {
                  const field = availableFields.find((f) => f.value === val);
                  if (field && field.type !== 'date' && field.type !== 'datetime') {
                    setMode(null);
                  }
                }
              }}
              options={filteredFields.map((f) => ({
                value: f.value,
                label: f.label,
              }))}
              placeholder="— select column —"
            />
            {/* Type badge for selected field */}
            {targetField && selectedFieldType && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Type:</span>
                <TypeBadge type={selectedFieldType} />
              </div>
            )}
          </div>

          {/* Step 2: Mode selection — revealed after field selection */}
          {targetField && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <Label>What should fill this column?</Label>

              <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Default value mode">
                {/* Card A: Fixed Value */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'fixed'}
                  onClick={() => setMode('fixed')}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border text-left transition-colors cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    mode === 'fixed'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    <Tag size={20} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground m-0">Fixed value</p>
                    <p className="text-xs text-muted-foreground m-0 mt-1">
                      Apply the same value to every record on import — useful for campaign codes, source tags, or category labels.
                    </p>
                  </div>
                </button>

                {/* Card B: Next Send Date/Time */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'send-date'}
                  onClick={() => isDateField && setMode('send-date')}
                  disabled={!isDateField}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    !isDateField && 'opacity-50 cursor-not-allowed',
                    isDateField && 'cursor-pointer',
                    mode === 'send-date'
                      ? 'border-primary bg-primary/5'
                      : isDateField
                        ? 'border-border hover:border-primary/40'
                        : 'border-border',
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    <CalendarBlank size={20} weight="duotone" className={cn(isDateField ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold m-0', isDateField ? 'text-foreground' : 'text-muted-foreground')}>
                      Next send date/time
                    </p>
                    <p className="text-xs text-muted-foreground m-0 mt-1">
                      {isDateField
                        ? 'Stamp each imported record with the next scheduled send date, based on your sending schedule.'
                        : 'Requires a Date or DateTime column'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Fixed value input */}
              {mode === 'fixed' && (
                <div className="space-y-2 pt-2 animate-in slide-in-from-top-1 duration-200">
                  <Label>Value</Label>
                  <Input
                    value={fixedValue}
                    onChange={(e) => setFixedValue(e.target.value)}
                    placeholder="e.g. campaign-2024-q1"
                  />
                </div>
              )}

              {/* Send date schedule sub-form */}
              {mode === 'send-date' && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-1 duration-200">
                  {/* Schedule section */}
                  <div className="space-y-3">
                    {/* Send Days */}
                    <div className="space-y-2">
                      <Label>Send days</Label>
                      <DayPicker value={days} onChange={setDays} />
                    </div>

                    {/* Include Time */}
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer" htmlFor="include-time">
                        Include time
                      </Label>
                      <Switch
                        id="include-time"
                        checked={includeTime}
                        onCheckedChange={setIncludeTime}
                      />
                    </div>

                    {/* Select Hours — only when Include Time is on */}
                    {includeTime && (
                      <div className="space-y-2">
                        <Label>Select hours</Label>
                        <ChipInput
                          values={hours}
                          onChange={setHours}
                          options={HOUR_OPTIONS}
                          placeholder="Select times..."
                          size="sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <Separator />

                  {/* Constraints section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer" htmlFor="active-period">
                        Apply to active period
                      </Label>
                      <Switch
                        id="active-period"
                        checked={activePeriodsOnly}
                        onCheckedChange={setActivePeriodsOnly}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="cursor-pointer" htmlFor="avoid-holidays">
                        Avoid public holidays
                      </Label>
                      <Switch
                        id="avoid-holidays"
                        checked={avoidHolidays}
                        onCheckedChange={setAvoidHolidays}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
