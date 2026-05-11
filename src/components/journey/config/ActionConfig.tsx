import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, ActionSubType } from '../../../models/journey';

export interface ActionConfigProps {
  journeyId: string;
  node: JourneyNode;
  onEditContent?: (contentType: 'email' | 'form' | 'survey') => void;
}

const ACTION_OPTIONS: { value: ActionSubType; label: string }[] = [
  { value: 'send-email', label: 'Send Email' },
  { value: 'send-sms', label: 'Send SMS' },
  { value: 'update-contact', label: 'Update Contact' },
  { value: 'webhook', label: 'Webhook' },
];

const METHOD_OPTIONS: { value: 'GET' | 'POST'; label: string }[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
];

const inputClasses = "w-full px-2 py-2 border border-border rounded-md bg-background font-sans text-sm text-foreground leading-normal transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const selectClasses = `${inputClasses} appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20d%3D%22M3%204.5L6%207.5L9%204.5%22%20fill%3D%22none%22%20stroke%3D%22%2371717A%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7 cursor-pointer`;
const textareaClasses = `${inputClasses} resize-y min-h-[72px]`;

export function ActionConfig({ journeyId, node, onEditContent }: ActionConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubType = e.target.value as ActionSubType;
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
      {/* Action type selector */}
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="action-type">
          Action Type
        </label>
        <select
          id="action-type"
          className={selectClasses}
          value={node.subType}
          onChange={handleSubTypeChange}
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Send Email fields */}
      {config.subType === 'send-email' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="email-ref">
              Email Reference
            </label>
            <input
              id="email-ref"
              type="text"
              className={inputClasses}
              value={config.emailRef}
              onChange={(e) => handleConfigChange({ emailRef: e.target.value })}
              placeholder="e.g. Welcome Email"
            />
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <button
              type="button"
              className={`${inputClasses} cursor-pointer text-left text-primary font-semibold`}
              onClick={() => onEditContent?.('email')}
            >
              Edit Email…
            </button>
            <span className="text-xs text-muted-foreground leading-tight">
              Opens the email content editor.
            </span>
          </div>
        </>
      )}

      {/* Send SMS fields */}
      {config.subType === 'send-sms' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="sms-message">
              Message Text
            </label>
            <textarea
              id="sms-message"
              className={textareaClasses}
              value={config.messageText}
              onChange={(e) => handleConfigChange({ messageText: e.target.value })}
              placeholder="Enter SMS message…"
            />
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="sms-sender">
              Sender Name
            </label>
            <input
              id="sms-sender"
              type="text"
              className={inputClasses}
              value={config.senderName}
              onChange={(e) => handleConfigChange({ senderName: e.target.value })}
              placeholder="e.g. UbiQuity"
            />
          </div>
        </>
      )}

      {/* Update Contact fields */}
      {config.subType === 'update-contact' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="contact-field-key">
              Field Key
            </label>
            <input
              id="contact-field-key"
              type="text"
              className={inputClasses}
              value={config.fieldKey}
              onChange={(e) => handleConfigChange({ fieldKey: e.target.value })}
              placeholder="e.g. loyalty_tier"
            />
            <span className="text-xs text-muted-foreground leading-tight">
              The contact field to update.
            </span>
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="contact-field-value">
              Value
            </label>
            <input
              id="contact-field-value"
              type="text"
              className={inputClasses}
              value={config.value}
              onChange={(e) => handleConfigChange({ value: e.target.value })}
              placeholder="New value for the field"
            />
          </div>
        </>
      )}

      {/* Webhook fields */}
      {config.subType === 'webhook' && (
        <>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="webhook-url">
              URL
            </label>
            <input
              id="webhook-url"
              type="url"
              className={inputClasses}
              value={config.url}
              onChange={(e) => handleConfigChange({ url: e.target.value })}
              placeholder="https://example.com/webhook"
            />
          </div>
          <div className="flex flex-col gap-1 mb-4 last:mb-0">
            <label className="text-xs font-semibold text-muted-foreground leading-tight" htmlFor="webhook-method">
              Method
            </label>
            <select
              id="webhook-method"
              className={selectClasses}
              value={config.method}
              onChange={(e) => handleConfigChange({ method: e.target.value })}
            >
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
