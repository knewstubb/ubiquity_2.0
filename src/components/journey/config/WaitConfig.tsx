import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, WaitSubType } from '../../../models/journey';

export interface WaitConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const WAIT_OPTIONS: { value: WaitSubType; label: string }[] = [
  { value: 'time-delay', label: 'Time Delay' },
  { value: 'wait-for-event', label: 'Wait for Event' },
  { value: 'wait-until-date', label: 'Wait Until Date' },
];

const DELAY_UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

const TIMEOUT_UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

const EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'purchase_made', label: 'Purchase Made' },
  { value: 'page_visited', label: 'Page Visited' },
  { value: 'email_opened', label: 'Email Opened' },
  { value: 'link_clicked', label: 'Link Clicked' },
];

const inputClasses = "w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer`;

export function WaitConfig({ journeyId, node }: WaitConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as WaitSubType;
      const newConfig = createDefaultConfig(newSubType);
      updateNode(journeyId, node.id, { subType: newSubType, config: newConfig });
    },
    [journeyId, node.id, updateNode],
  );

  const handleConfigChange = useCallback(
    (updates: Record<string, unknown>) => {
      updateNode(journeyId, node.id, {
        config: { ...config, ...updates },
      });
    },
    [journeyId, node.id, config, updateNode],
  );

  return (
    <div>
      {/* Wait type selector */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="wait-type">
          Wait Type
        </label>
        <select
          id="wait-type"
          className={selectClasses}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {WAIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time Delay fields */}
      {config.subType === 'time-delay' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="delay-duration">
              Duration
            </label>
            <input
              id="delay-duration"
              type="number"
              min={0}
              className={inputClasses}
              value={config.duration}
              onChange={(e) =>
                handleConfigChange({ duration: Math.max(0, Number(e.target.value)) })
              }
              placeholder="e.g. 3"
            />
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="delay-unit">
              Unit
            </label>
            <select
              id="delay-unit"
              className={selectClasses}
              value={config.unit}
              onChange={(e) => handleConfigChange({ unit: e.target.value })}
            >
              {DELAY_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Wait for Event fields */}
      {config.subType === 'wait-for-event' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="wait-event-type">
              Event Type
            </label>
            <select
              id="wait-event-type"
              className={selectClasses}
              value={config.eventType}
              onChange={(e) => handleConfigChange({ eventType: e.target.value })}
            >
              <option value="">Select an event…</option>
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="timeout-duration">
              Timeout Duration
            </label>
            <input
              id="timeout-duration"
              type="number"
              min={0}
              className={inputClasses}
              value={config.timeoutDuration}
              onChange={(e) =>
                handleConfigChange({ timeoutDuration: Math.max(0, Number(e.target.value)) })
              }
              placeholder="e.g. 7"
            />
            <span className="text-xs text-muted-foreground leading-tight">
              How long to wait before timing out if the event doesn't occur.
            </span>
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="timeout-unit">
              Timeout Unit
            </label>
            <select
              id="timeout-unit"
              className={selectClasses}
              value={config.timeoutUnit}
              onChange={(e) => handleConfigChange({ timeoutUnit: e.target.value })}
            >
              {TIMEOUT_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Wait Until Date fields */}
      {config.subType === 'wait-until-date' && (
        <div className="flex flex-col gap-1 mb-4 last:mb-0">
          <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="target-date">
            Target Date
          </label>
          <input
            id="target-date"
            type="date"
            className={inputClasses}
            value={config.targetDate}
            onChange={(e) => handleConfigChange({ targetDate: e.target.value })}
          />
          <span className="text-xs text-muted-foreground leading-tight">
            Contacts will wait until this date before proceeding.
          </span>
        </div>
      )}
    </div>
  );
}
