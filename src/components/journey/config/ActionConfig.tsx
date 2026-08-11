import { useCallback } from 'react';
import { EnvelopeSimple, DeviceMobile, UserCircle, WebhooksLogo } from '@phosphor-icons/react';
import { useJourneys } from '../../../contexts/JourneysContext';
import { createDefaultConfig } from '../../../models/journey';
import { emailTemplates } from '../../../data/emailTemplates';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import type { JourneyNode, ActionSubType } from '../../../models/journey';

export interface ActionConfigProps {
  journeyId: string;
  node: JourneyNode;
  onEditContent?: (contentType: 'email' | 'form' | 'survey') => void;
}

interface ActionOption {
  value: ActionSubType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ACTION_OPTIONS: ActionOption[] = [
  { value: 'send-email', label: 'Send Email', icon: EnvelopeSimple },
  { value: 'send-sms', label: 'Send SMS', icon: DeviceMobile },
  { value: 'update-contact', label: 'Update Contact', icon: UserCircle },
  { value: 'webhook', label: 'Webhook', icon: WebhooksLogo },
];

const METHOD_OPTIONS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
];

// Group templates by category
const TEMPLATE_CATEGORIES = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'promotional', label: 'Promotional' },
  { key: 'transactional', label: 'Transactional' },
  { key: 'nurture', label: 'Nurture' },
  { key: 're-engagement', label: 'Re-engagement' },
] as const;

export function ActionConfig({ journeyId, node, onEditContent }: ActionConfigProps) {
  const { updateNode } = useJourneys();
  const config = node.config;

  const handleSubTypeChange = useCallback(
    (value: string) => {
      const newSubType = value as ActionSubType;
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

  const currentAction = ACTION_OPTIONS.find((opt) => opt.value === node.subType);

  // Filter templates: global (null accountId) or matching account
  // For now, show all global templates
  const availableTemplates = emailTemplates.filter((t) => t.accountId === null);

  return (
    <div className="space-y-4">
      {/* Action type selector */}
      <div className="space-y-2">
        <Label htmlFor="action-type">Action Type</Label>
        <Select value={node.subType} onValueChange={handleSubTypeChange}>
          <SelectTrigger id="action-type">
            <SelectValue placeholder="Select an action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((opt) => {
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
      </div>

      {/* Send Email fields */}
      {config.subType === 'send-email' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email-template">Email Template</Label>
            <Select
              value={(config.templateId as string) ?? ''}
              onValueChange={(value) => handleConfigChange({ templateId: value })}
            >
              <SelectTrigger id="email-template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((category) => {
                  const categoryTemplates = availableTemplates.filter(
                    (t) => t.category === category.key
                  );
                  if (categoryTemplates.length === 0) return null;
                  return (
                    <SelectGroup key={category.key}>
                      <SelectLabel>{category.label}</SelectLabel>
                      {categoryTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
            {config.templateId && (
              <p className="body-xs text-muted-foreground">
                Subject: {availableTemplates.find((t) => t.id === config.templateId)?.subject}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-ref">Reference Name (optional)</Label>
            <Input
              id="email-ref"
              value={(config.emailRef as string) ?? ''}
              onChange={(e) => handleConfigChange({ emailRef: e.target.value })}
              placeholder="e.g. Welcome Email"
            />
            <p className="body-xs text-muted-foreground">
              A name to identify this email step in reports.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onEditContent?.('email')}
          >
            <EnvelopeSimple size={16} className="mr-2" />
            Edit Email Content
          </Button>
        </>
      )}

      {/* Send SMS fields */}
      {config.subType === 'send-sms' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="sms-message">Message Text</Label>
            <Textarea
              id="sms-message"
              value={(config.messageText as string) ?? ''}
              onChange={(e) => handleConfigChange({ messageText: e.target.value })}
              placeholder="Enter SMS message..."
              className="min-h-[72px] resize-y"
            />
            <p className="body-xs text-muted-foreground">
              {((config.messageText as string) ?? '').length}/160 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sms-sender">Sender Name</Label>
            <Input
              id="sms-sender"
              value={(config.senderName as string) ?? ''}
              onChange={(e) => handleConfigChange({ senderName: e.target.value })}
              placeholder="e.g. UbiQuity"
              maxLength={11}
            />
            <p className="body-xs text-muted-foreground">
              Max 11 characters. Shown as the sender on the recipient's phone.
            </p>
          </div>
        </>
      )}

      {/* Update Contact fields */}
      {config.subType === 'update-contact' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="contact-field-key">Field Key</Label>
            <Input
              id="contact-field-key"
              value={(config.fieldKey as string) ?? ''}
              onChange={(e) => handleConfigChange({ fieldKey: e.target.value })}
              placeholder="e.g. loyalty_tier"
            />
            <p className="body-xs text-muted-foreground">
              The contact field to update.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-field-value">Value</Label>
            <Input
              id="contact-field-value"
              value={(config.value as string) ?? ''}
              onChange={(e) => handleConfigChange({ value: e.target.value })}
              placeholder="New value for the field"
            />
          </div>
        </>
      )}

      {/* Webhook fields */}
      {config.subType === 'webhook' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL</Label>
            <Input
              id="webhook-url"
              type="url"
              value={(config.url as string) ?? ''}
              onChange={(e) => handleConfigChange({ url: e.target.value })}
              placeholder="https://example.com/webhook"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-method">Method</Label>
            <Select
              value={(config.method as string) ?? 'POST'}
              onValueChange={(value) => handleConfigChange({ method: value })}
            >
              <SelectTrigger id="webhook-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
