import { useCallback } from 'react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import type { JourneyNode, ActionSubType } from '../../../models/journey';
import styles from './configStyles.module.css';

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
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="action-type">
          Action Type
        </label>
        <select
          id="action-type"
          className={styles.select}
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
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email-ref">
              Email Reference
            </label>
            <input
              id="email-ref"
              type="text"
              className={styles.input}
              value={config.emailRef}
              onChange={(e) => handleConfigChange({ emailRef: e.target.value })}
              placeholder="e.g. Welcome Email"
            />
          </div>
          <div className={styles.formGroup}>
            <button
              type="button"
              className={styles.input}
              style={{ cursor: 'pointer', textAlign: 'left', color: 'var(--color-primary-500)', fontWeight: 'var(--weight-semibold)' }}
              onClick={() => onEditContent?.('email')}
            >
              Edit Email…
            </button>
            <span className={styles.hint}>
              Opens the email content editor.
            </span>
          </div>
        </>
      )}

      {/* Send SMS fields */}
      {config.subType === 'send-sms' && (
        <>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="sms-message">
              Message Text
            </label>
            <textarea
              id="sms-message"
              className={styles.textarea}
              value={config.messageText}
              onChange={(e) => handleConfigChange({ messageText: e.target.value })}
              placeholder="Enter SMS message…"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="sms-sender">
              Sender Name
            </label>
            <input
              id="sms-sender"
              type="text"
              className={styles.input}
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
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="contact-field-key">
              Field Key
            </label>
            <input
              id="contact-field-key"
              type="text"
              className={styles.input}
              value={config.fieldKey}
              onChange={(e) => handleConfigChange({ fieldKey: e.target.value })}
              placeholder="e.g. loyalty_tier"
            />
            <span className={styles.hint}>
              The contact field to update.
            </span>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="contact-field-value">
              Value
            </label>
            <input
              id="contact-field-value"
              type="text"
              className={styles.input}
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
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="webhook-url">
              URL
            </label>
            <input
              id="webhook-url"
              type="url"
              className={styles.input}
              value={config.url}
              onChange={(e) => handleConfigChange({ url: e.target.value })}
              placeholder="https://example.com/webhook"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="webhook-method">
              Method
            </label>
            <select
              id="webhook-method"
              className={styles.select}
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
