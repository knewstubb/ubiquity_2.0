import { useCallback } from 'react';
import { Timer, Lightning, CalendarBlank } from '@phosphor-icons/react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Input } from '../../ui/input';
import type { JourneyNode, WaitSubType } from '../../../models/journey';

export interface WaitConfigProps {
  journeyId: string;
  node: JourneyNode;
}

interface WaitOption {
  value: WaitSubType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const WAIT_OPTIONS: WaitOption[] = [
  {
    value: 'time-delay',
    label: 'Time Delay',
    description: 'Wait for a specific duration',
    icon: Timer,
  },
  {
    value: 'wait-for-event',
    label: 'Wait for Event',
    description: 'Wait until an event occurs or timeout',
    icon: Lightning,
  },
  {
    value: 'wait-until-date',
    label: 'Wait Until Date',
    description: 'Wait until a specific date',
    icon: CalendarBlank,
  },
];

const DELAY_UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

const TIMEOUT_UNIT_OPTIONS = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
];

const EVENT_OPTIONS = [
  { value: 'form_submitted', label: 'Form Submitted' },
  { value: 'purchase_made', label: 'Purchase Made' },
  { value: 'page_visited', label: 'Page Visited' },
  { value: 'email_opened', label: 'Email Opened' },
  { value: 'link_clicked', label: 'Link Clicked' },
];

export function WaitConfig({ journeyId, node }: WaitConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (value: string) => {
      const newSubType = value as WaitSubType;
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

  const currentWait = WAIT_OPTIONS.find((opt) => opt.value === node.subType);

  // Calculate human-readable delay summary
  const getDelaySummary = () => {
    if (config.subType !== 'time-delay') return null;
    const duration = config.duration as number;
    const unit = config.unit as string;
    if (!duration || !unit) return null;
    return `Contacts will wait ${duration} ${unit.toLowerCase()} before proceeding.`;
  };

  return (
    <div className="space-y-4">
      {/* Wait type selector */}
      <div className="space-y-2">
        <Label htmlFor="wait-type">Wait Type</Label>
        <Select value={node.subType} onValueChange={handleSubTypeChange}>
          <SelectTrigger id="wait-type">
            <SelectValue placeholder="Select wait type" />
          </SelectTrigger>
          <SelectContent>
            {WAIT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <Icon size={16} className="text-muted-foreground" />
                    {opt.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {currentWait && (
          <p className="text-xs text-muted-foreground">{currentWait.description}</p>
        )}
      </div>

      {/* Time Delay fields */}
      {config.subType === 'time-delay' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="delay-duration">Duration</Label>
              <Input
                id="delay-duration"
                type="number"
                min={1}
                value={(config.duration as number) ?? 1}
                onChange={(e) =>
                  handleConfigChange({ duration: Math.max(1, Number(e.target.value)) })
                }
                placeholder="e.g. 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delay-unit">Unit</Label>
              <Select
                value={(config.unit as string) ?? 'days'}
                onValueChange={(value) => handleConfigChange({ unit: value })}
              >
                <SelectTrigger id="delay-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELAY_UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {getDelaySummary() && (
            <p className="text-xs text-muted-foreground">{getDelaySummary()}</p>
          )}
        </>
      )}

      {/* Wait for Event fields */}
      {config.subType === 'wait-for-event' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="wait-event-type">Event Type</Label>
            <Select
              value={(config.eventType as string) ?? ''}
              onValueChange={(value) => handleConfigChange({ eventType: value })}
            >
              <SelectTrigger id="wait-event-type">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="timeout-duration">Timeout</Label>
              <Input
                id="timeout-duration"
                type="number"
                min={1}
                value={(config.timeoutDuration as number) ?? 7}
                onChange={(e) =>
                  handleConfigChange({ timeoutDuration: Math.max(1, Number(e.target.value)) })
                }
                placeholder="e.g. 7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeout-unit">Unit</Label>
              <Select
                value={(config.timeoutUnit as string) ?? 'days'}
                onValueChange={(value) => handleConfigChange({ timeoutUnit: value })}
              >
                <SelectTrigger id="timeout-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEOUT_UNIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            If the event doesn't occur within the timeout, contacts proceed to the
            timeout path.
          </p>
        </>
      )}

      {/* Wait Until Date fields */}
      {config.subType === 'wait-until-date' && (
        <div className="space-y-2">
          <Label htmlFor="target-date">Target Date</Label>
          <Input
            id="target-date"
            type="date"
            value={(config.targetDate as string) ?? ''}
            onChange={(e) => handleConfigChange({ targetDate: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Contacts will wait until this date before proceeding.
          </p>
        </div>
      )}
    </div>
  );
}
