import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, EndSubType } from '../../../models/journey';

export interface EndConfigProps {
  journeyId: string;
  node: JourneyNode;
}

const END_OPTIONS: { value: EndSubType; label: string }[] = [
  { value: 'exit', label: 'Exit Journey' },
  { value: 'move-to-journey', label: 'Move to Journey' },
];

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'No reason' },
  { value: 'completed', label: 'Completed' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'goal-met', label: 'Goal Met' },
];

const inputClasses = "w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer`;

export function EndConfig({ journeyId, node }: EndConfigProps) {
  const { updateNode, journeys } = useJourneys();
  const config = node.config;

  const otherJourneys = journeys.filter((j) => j.id !== journeyId);

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as EndSubType;
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
      {/* End type selector */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="end-type">
          End Type
        </label>
        <select
          id="end-type"
          className={selectClasses}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {END_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Exit Journey fields */}
      {config.subType === 'exit' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="exit-label">
              Label
            </label>
            <input
              id="exit-label"
              type="text"
              className={inputClasses}
              value={config.label}
              onChange={(e) => handleConfigChange({ label: e.target.value })}
              placeholder="e.g. Journey Complete"
            />
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="exit-reason">
              Reason
            </label>
            <select
              id="exit-reason"
              className={selectClasses}
              value={config.reason}
              onChange={(e) => handleConfigChange({ reason: e.target.value })}
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground leading-tight">
              Optional reason for why contacts exit at this point.
            </span>
          </div>
        </>
      )}

      {/* Move to Journey fields */}
      {config.subType === 'move-to-journey' && (
        <div className="flex flex-col gap-1 mb-4 last:mb-0">
          <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="target-journey">
            Target Journey
          </label>
          <select
            id="target-journey"
            className={selectClasses}
            value={config.targetJourneyId}
            onChange={(e) => handleConfigChange({ targetJourneyId: e.target.value })}
          >
            <option value="">Select a journey…</option>
            {otherJourneys.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
          {otherJourneys.length === 0 && (
            <span className="text-xs text-muted-foreground leading-tight">
              No other journeys available. Create another journey first.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
