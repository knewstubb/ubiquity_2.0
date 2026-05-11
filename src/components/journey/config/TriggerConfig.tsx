import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, TriggerSubType } from '../../../models/journey';
import { segments } from '../../../data/segments';

export interface TriggerConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const TRIGGER_OPTIONS: { value: TriggerSubType; label: string }[] = [
  { value: 'segment-entry', label: 'Segment Entry' },
  { value: 'event-based', label: 'Event-Based' },
  { value: 'manual', label: 'Manual' },
  { value: 'scheduled', label: 'Scheduled' },
];

const EVENT_OPTIONS = [
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'purchase_made', label: 'Purchase Made' },
  { value: 'page_visited', label: 'Page Visited' },
];

const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const inputClasses = "w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer`;
const textareaClasses = `${inputClasses} resize-y min-h-[72px]`;

export function TriggerConfig({ journeyId, node }: TriggerConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as TriggerSubType;
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
      {/* Trigger type selector */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="trigger-type">
          Trigger Type
        </label>
        <select
          id="trigger-type"
          className={selectClasses}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {TRIGGER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sub-type specific fields */}
      {config.subType === 'segment-entry' && (
        <div className="flex flex-col gap-1 mb-4 last:mb-0">
          <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="segment-picker">
            Segment
          </label>
          <select
            id="segment-picker"
            className={selectClasses}
            value={config.segmentId}
            onChange={(e) => handleConfigChange({ segmentId: e.target.value })}
          >
            <option value="">Select a segment…</option>
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.name} ({seg.memberCount} members)
              </option>
            ))}
          </select>
        </div>
      )}

      {config.subType === 'event-based' && (
        <div className="flex flex-col gap-1 mb-4 last:mb-0">
          <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="event-type">
            Event Type
          </label>
          <select
            id="event-type"
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
      )}

      {config.subType === 'scheduled' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="schedule-date">
              Date
            </label>
            <input
              id="schedule-date"
              type="date"
              className={inputClasses}
              value={config.date}
              onChange={(e) => handleConfigChange({ date: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="recurrence">
              Recurrence
            </label>
            <select
              id="recurrence"
              className={selectClasses}
              value={config.recurrence}
              onChange={(e) => handleConfigChange({ recurrence: e.target.value })}
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {config.subType === 'manual' && (
        <div className="flex flex-col gap-1 mb-4 last:mb-0">
          <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="manual-description">
            Description
          </label>
          <textarea
            id="manual-description"
            className={textareaClasses}
            value={config.description}
            onChange={(e) => handleConfigChange({ description: e.target.value })}
            placeholder="Describe how contacts are added manually…"
          />
          <span className="text-xs text-muted-foreground leading-tight">
            Contacts will be added to this journey manually by an operator.
          </span>
        </div>
      )}
    </div>
  );
}
