import { useCallback } from 'react';
import { SignOut, ArrowSquareRight, Info } from '@phosphor-icons/react';
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
import type { JourneyNode, EndSubType } from '../../../models/journey';

export interface EndConfigProps {
  journeyId: string;
  node: JourneyNode;
}

interface EndOption {
  value: EndSubType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const END_OPTIONS: EndOption[] = [
  {
    value: 'exit',
    label: 'Exit Journey',
    description: 'Contact exits and journey ends',
    icon: SignOut,
  },
  {
    value: 'move-to-journey',
    label: 'Move to Journey',
    description: 'Transfer contact to another journey',
    icon: ArrowSquareRight,
  },
];

const REASON_OPTIONS = [
  { value: 'none', label: 'No reason' },
  { value: 'completed', label: 'Completed' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'goal-met', label: 'Goal Met' },
];

export function EndConfig({ journeyId, node }: EndConfigProps) {
  const { updateNode, journeys } = useJourneys();
  const config = node.config;

  const otherJourneys = journeys.filter((j) => j.id !== journeyId);

  const handleSubTypeChange = useCallback(
    (value: string) => {
      const newSubType = value as EndSubType;
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

  const currentEnd = END_OPTIONS.find((opt) => opt.value === node.subType);

  return (
    <div className="space-y-4">
      {/* End type selector */}
      <div className="space-y-2">
        <Label htmlFor="end-type">End Type</Label>
        <Select value={node.subType} onValueChange={handleSubTypeChange}>
          <SelectTrigger id="end-type">
            <SelectValue placeholder="Select end type" />
          </SelectTrigger>
          <SelectContent>
            {END_OPTIONS.map((opt) => {
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
        {currentEnd && (
          <p className="body-xs text-muted-foreground">{currentEnd.description}</p>
        )}
      </div>

      {/* Exit Journey fields */}
      {config.subType === 'exit' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="exit-label">Label (optional)</Label>
            <Input
              id="exit-label"
              value={(config.label as string) ?? ''}
              onChange={(e) => handleConfigChange({ label: e.target.value })}
              placeholder="e.g. Journey Complete"
            />
            <p className="body-xs text-muted-foreground">
              A name for this exit point, shown in reports.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exit-reason">Exit Reason</Label>
            <Select
              value={(config.reason as string) || 'none'}
              onValueChange={(value) => handleConfigChange({ reason: value === 'none' ? '' : value })}
            >
              <SelectTrigger id="exit-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="body-xs text-muted-foreground">
              Categorises why contacts exited for reporting purposes.
            </p>
          </div>
        </>
      )}

      {/* Move to Journey fields */}
      {config.subType === 'move-to-journey' && (
        <div className="space-y-2">
          <Label htmlFor="target-journey">Target Journey</Label>
          <Select
            value={(config.targetJourneyId as string) ?? ''}
            onValueChange={(value) => handleConfigChange({ targetJourneyId: value })}
          >
            <SelectTrigger id="target-journey">
              <SelectValue placeholder="Select a journey" />
            </SelectTrigger>
            <SelectContent>
              {otherJourneys.length > 0 ? (
                otherJourneys.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="_none" disabled>
                  No other journeys available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {otherJourneys.length === 0 && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-secondary text-secondary-foreground">
              <Info size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              <p className="body-xs leading-relaxed">
                No other journeys available. Create another journey first, then you can
                transfer contacts between them.
              </p>
            </div>
          )}
          {config.targetJourneyId && (
            <p className="body-xs text-muted-foreground">
              Contacts will be moved to the selected journey and start from its entry
              point.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
