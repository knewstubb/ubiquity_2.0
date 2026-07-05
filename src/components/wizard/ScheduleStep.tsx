import { SelectorCard } from '@/components/composed/selector-card';
import { InfoHint } from '@/components/composed/info-hint';
import { HelpPopover } from '@/components/composed/help-popover';
import { DayPicker } from '@/components/composed/day-picker';
import { NotificationsStep } from '../shared/NotificationsStep';
import { usePrototypePhases } from '../../contexts/PrototypePhaseContext';
import type { ExporterWizardDraft, ExporterScheduleConfig, ExporterNotificationConfig } from '../../models/wizard';

interface ScheduleStepProps {
  draft: ExporterWizardDraft;
  onUpdate: (patch: Partial<ExporterWizardDraft>) => void;
  onNotificationsValidChange?: (valid: boolean) => void;
}

type Frequency = ExporterScheduleConfig['frequency'];

const FREQUENCY_OPTIONS: { value: Frequency; label: string; price: string }[] = [
  { value: '10_minute', label: '10 Minute', price: '$1,000 /month' },
  { value: 'hourly', label: 'Hourly', price: '$500 /month' },
  { value: 'daily', label: 'Daily', price: '$250 /month' },
  { value: 'weekly', label: 'Weekly', price: '$250 /month' },
];

export function ScheduleStep({ draft, onUpdate, onNotificationsValidChange }: ScheduleStepProps) {
  const { phases } = usePrototypePhases()
  const exporterPhase = phases.exporterPhase
  const schedule = draft.schedule;

  function updateSchedule(patch: Partial<ExporterScheduleConfig>) {
    onUpdate({ schedule: { ...schedule, ...patch } });
  }

  function handleFrequencyChange(value: Frequency) {
    updateSchedule({ frequency: value });
  }

  function handleNotificationsUpdate(config: ExporterNotificationConfig) {
    onUpdate({ notifications: config });
  }

  return (
    <div className="flex flex-col gap-9" data-testid="schedule-step">
      {/* Frequency selector */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Frequency</p>
            <HelpPopover
              title="Export Frequency"
              body="Higher frequencies mean more API calls to your destination and higher costs. Choose the frequency that balances data freshness with your budget."
              width="narrow"
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 m-0">How often this export runs</p>
        </div>
        <div className="w-[552px] flex flex-col gap-5">
          <div className="grid grid-cols-4 gap-3 overflow-visible pt-2 pr-2" role="radiogroup" aria-label="Export frequency">
            {FREQUENCY_OPTIONS.map((opt) => (
              <SelectorCard
                key={opt.value}
                variant="icon"
                label={opt.label}
                description={opt.price}
                selected={schedule.frequency === opt.value}
                onSelect={() => handleFrequencyChange(opt.value)}
              />
            ))}
          </div>

          {/* Weekly: day-of-week picker */}
          {schedule.frequency === 'weekly' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0 mb-2">On <span className="text-destructive">*</span></p>
              <DayPicker
                value={schedule.weeklyDays}
                onChange={(days) => updateSchedule({ weeklyDays: days })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Info note — system assigns execution time */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0" />
        <div className="w-[552px]">
          <InfoHint variant="panel">
            Execution time is assigned automatically by the system to avoid scheduling conflicts.
          </InfoHint>
        </div>
      </div>

      {/* ── Notifications section (Phase 2+) ── */}
      {exporterPhase >= 2 && (
      <div className="pt-3">
        <NotificationsStep
          value={draft.notifications}
          onUpdate={handleNotificationsUpdate}
          onValidChange={onNotificationsValidChange}
        />
      </div>
      )}
    </div>
  );
}
